<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, reactive, ref, watch} from "vue";
import {useImagesStore} from "@/store/images.ts";
import {CanvasEditor} from "@/Utilities/CanvasEditor.ts";
import {type CroppedExportOptions, exportCroppedArea} from "@/Utilities/useCanvasExporter.ts";
import {ElementTypesEnum, type ICanvasElement, type ITextConfig} from "@/types.ts";
import Popover from "./Popover.vue";
import KeyboardController from "../KeyboardController.vue";
import Symbols from "@/components/Symbols.vue";

const imagesStore = useImagesStore();
const emit = defineEmits(['element-selected']);

const canvas = ref<HTMLCanvasElement | null>(null);
const uploaderContainer = ref<HTMLDivElement | null>(null);
const popOverRef = ref<InstanceType<typeof Popover> | null>(null);

const editor = ref<CanvasEditor>(new CanvasEditor(imagesStore));

// 使用 SVG 建立一個白色的 'X' 圖示
const deleteIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>`;
// 將 SVG 轉為 Base64 Data URL，讓 Image 物件可以載入
imagesStore.deleteIcon.src = `data:image/svg+xml;base64,${btoa(deleteIconSVG)}`;

// 裁切框的狀態
const cropBox = reactive(editor.value.cropBox);

// 建立一個給 UI 使用的 computed 屬性，它包含 getter 和 setter
const displayCropBox = computed(() => {
  // 當 UI 讀取值時，我們回傳原始值，因為縮放轉換在 CanvasEditor 內部處理更佳
  // 如果未來需要在 UI 顯示不同單位的值，可以在這裡進行轉換
  const scaleFactor = 1 / editor.value.viewport.scale;
  return {
    x: Math.round(cropBox.x * scaleFactor),
    y: Math.round(cropBox.y * scaleFactor),
    width: Math.min(Math.round(cropBox.width * scaleFactor * 100) / 100, editor.value.viewport.originalWidth),
    height: Math.min(Math.round(cropBox.height * scaleFactor * 100) / 100, editor.value.viewport.originalHeight)
  };
});

const selectedElement = computed(() => {
  if (imagesStore.selectedElements.length <= 0) return null;
  if (imagesStore.selectedElements.length > 1) return null;
  return imagesStore.selectedElements[0];
});

const handleChange = (key: string, currentValue: number) => {
  if (key === 'x') {
    editor.value.cropBox.x = currentValue * editor.value.viewport.scale;
  }
  if (key === 'y') {
    editor.value.cropBox.y = currentValue * editor.value.viewport.scale;
  }
  if (key === 'width') {
    editor.value.cropBox.width = currentValue * editor.value.viewport.scale;
  }
  if (key === 'height') {
    editor.value.cropBox.height = currentValue * editor.value.viewport.scale;
  }
}

// --- 互動狀態管理 ---
const textInput = ref<HTMLInputElement | null>(null);
// 文字編輯狀態
const isComposing = ref<boolean>(false);

const textInputStyle = reactive(editor.value.textInputStyle);

// 右鍵選單狀態
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  element: null as ICanvasElement | null,
});
// PopOver選單狀態
const popOverMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  offset: {
    x: -50,
    y: -50
  },
});

onMounted(() => {
  if (canvas.value) {
    editor.value.setup(canvas.value, uploaderContainer.value);
    editor.value.textInput = textInput.value;
    // 預設畫布大小
    editor.value.updateViewportSize(800, 600);
    // 支援貼圖Ctrl+C和Ctrl+V
    editor.value.enableCopyAndPasteSupport();
    // 尺寸變更後需要重新繪製所有內容
    editor.value.render();

    // 設定右鍵選單的回呼函式
    editor.value.onContextMenu = (event) => {
      contextMenu.visible = true;
      contextMenu.x = event.x;
      contextMenu.y = event.y;
      contextMenu.element = event.element;
    };
    // 設定PopOver選單的回呼函式
    editor.value.onPopOverMenu = (event) => {
      popOverMenu.visible = event.visible || false;
      popOverMenu.x = event.x + (popOverRef.value?.popoverWidth() || 0) / 2 * -1;
      popOverMenu.y = event.y + popOverMenu.offset.y;
    };
    // 設定文字編輯的回呼函式
    editor.value.onStartEditText = (element) => {
      editor.value.editingElement = element;
      nextTick(() => {
        minWidth.value = textInput.value?.offsetWidth || 0; // 記錄初始寬度
        textInput.value?.focus();
        updateTextareaSize(); // 初始設定大小
      });
    };
    window.addEventListener('click', closeContextMenu);
  }
});
onUnmounted(() => {
  editor.value.destroy();
})

// --- Event Emitters and Watchers ---
// 選擇物件刷新畫面
watch(() => imagesStore.selectedElements, (newSelection) => {
  // Deep copy to avoid downstream mutations affecting the original object
  emit('element-selected', newSelection.length > 0 ? JSON.parse(JSON.stringify(newSelection)) : []);
  editor.value.render();
  // popOverMenu.visible = (newSelection.length === 1);
}, { deep: true });

// 這邊檢查物件有異動就刷新畫面
watch(() => imagesStore.elements, () => {
  editor.value.render();
}, { deep: true });

watch(() => imagesStore.originalImage, () => {
  if (imagesStore.originalImage) {
    editor.value.updateViewportSize(imagesStore.originalImage.width, imagesStore.originalImage.height);
  }
  editor.value.resetCropMarks();
  editor.value.render(); // 進行初次繪製
}, { deep: true });

// 監聽裁切框的任何變更（來自拖曳或輸入框）
watch(editor.value.cropBox, () => {
  // 當 cropBox 變更時，先套用約束
  const wasConstrained = editor.value.constrainCropBox();

  // 如果值沒有被約束（表示值是有效的），則直接重繪
  // 如果值被約束了，此函式會被再次觸發，屆時 wasConstrained 會是 false，然後再重繪
  if (!wasConstrained) {
    editor.value.render();
  }
}, { deep: true });

// --- 文字編輯狀態 ---
let minWidth = ref(0);

// --- 文字編輯方法 ---
const updateTextareaSize = () => {
  const textarea = textInput.value;
  if (!textarea) return;

  // 為了準確計算，先重設高度
  textarea.style.height = 'auto';
  // 寬度設為 auto 以便計算 scrollWidth，但要確保它不小於初始寬度
  textarea.style.width = `${minWidth.value}px`;
  const config = selectedElement.value?.config as ITextConfig;

  // 根據內容捲動寬高來設定新的寬高
  const scrollHeight = textarea.scrollHeight;
  const scrollWidth = textarea.scrollWidth;
  const w = Math.max(scrollWidth, minWidth.value);
  const countLines: number = config.content.split('\n').length;

  textarea.style.height = `${scrollHeight}px`;
  textarea.style.width = `${w}px`;
  if (countLines > (config._countLines || 1)) {
    const top: number = Number.parseFloat(textarea.style.top.replace('px', ''));
    textarea.style.top =  `${top - ((config._lineSpacing || 0) / 2)}px`;
  } else if (countLines < (config._countLines || 1)) {
    const top: number = Number.parseFloat(textarea.style.top.replace('px', ''));
    textarea.style.top =  `${top + ((config._lineSpacing || 0) / 2)}px`;
  }
};

// --- 文字編輯方法 ---
const finishEditing = () => {
  if (isComposing.value) return;
  if (!editor.value.editingElement) return;
  // 如果編輯後文字為空，則移除該元素
  if ((editor.value.editingElement.config as ITextConfig).content.trim() === '') {
    imagesStore.elements = imagesStore.elements.filter(el => el.id !== editor.value.editingElement!.id);
  }
  minWidth.value = 0; // 重設
  editor.value.editingElement = null;
  editor.value.render();
};
// 處理IME輸入問題
const compositionStart = () => {
  isComposing.value = true;
}
const compositionEnd = () => {
  isComposing.value = false;
  updateTextareaSize();
}
const handleTextInput = () => {
  if (isComposing.value) return;
  updateTextareaSize();
}

// 儲存裁切後的圖片
const saveImage = async () => {
  // 計算比例
  const scaleFactor = 1 / editor.value.viewport.scale;
  // 輸出圖片的 URL
  const href = exportCroppedArea({
    store: imagesStore,
    editorCanvas: canvas.value,
    cropBox: {
      x: cropBox.x,
      y: cropBox.y,
      width: cropBox.width,
      height: cropBox.height
    },
    scaleFactor
  } as CroppedExportOptions);
  if (href) {
    // 4. 將暫時畫布的內容轉換為圖片的 data URL 並觸發下載
    const link = document.createElement('a');
    link.href = href;
    link.download = `edited-image-${Date.now()}.png`; // 加上時間戳避免檔名重複
    document.body.appendChild(link); // Firefox 需要將 link 加入 DOM
    link.click();
    document.body.removeChild(link); // 清理 DOM
  }
};

// --- 右鍵選單方法 ---
const closeContextMenu = () => {
  contextMenu.visible = false;
};

const deleteSelectedElement = () => {
  if (contextMenu.element) {
    imagesStore.removeElements([contextMenu.element.id]);
    editor.value.render();
  }
  closeContextMenu();
};
const handlePopOverMenuChange = (state: string) => {
  const multiple: boolean = imagesStore.selectedElements.length > 1;
  switch (state) {
    case "left":
      if (multiple)
        editor.value.align("left", null);
      else
        editor.value.stageAlign("left", null);
      break;
    case "center":
      if (multiple) {
        editor.value.align("center", null);
      } else {
        editor.value.stageAlign("center", null);
      }
      break;
    case "right":
      if (multiple) {
        editor.value.align("right", null);
      } else {
        editor.value.stageAlign("right", null);
      }
      break;
    case "delete":
      handleDeleteSelected();
      break;
  }
};

// --- 供外部呼叫的方法 ---
const addElement = async (element: ICanvasElement) => {
  await editor.value.addElement(element);
};
// 更新在這邊處理
const updateSelectedElement = (newProps: Partial<any>) => {

  if (newProps.type === ElementTypesEnum.Stage) {
    const config = newProps.config;
    editor.value.updateViewportSize(config.width, config.height, config.color);
    editor.value.render();
    return;
  }

  // Now updates all selected elements
  if (imagesStore.selectedElements.length === 0) return;
  imagesStore.selectedElements.forEach(element => {
    Object.assign(element.config, newProps);
  });
  editor.value.render();
  // css載入字體包監聽是否完成
  document.fonts.ready.then(() => {
    editor.value.render();
  });
};

// --- 鍵盤事件處理 ---
const handleDeleteSelected = () => {
  const selectedIds = imagesStore.selectedElements.map(el => el.id);
  if (selectedIds.length > 0) {
    imagesStore.removeElements(selectedIds);
    editor.value.render();
  }
};

const handleMoveSelected = ({ dx, dy }: { dx: number, dy: number }) => {
  if (imagesStore.selectedElements.length > 0) {
    imagesStore.selectedElements.forEach(el => {
      el.config.x += dx;
      el.config.y += dy;
    });
    editor.value.render();
  }
};

const handleTextEditing = (type: string, action: string) => {
  if (imagesStore.selectedElements.length > 0) {
    imagesStore.selectedElements.forEach(el => {
      if (type === el.type) {
        if (action === 'bold') {
          const { fontWeight } = el.config as ITextConfig;
          (el.config as ITextConfig).fontWeight = fontWeight === 'bold' ? 'normal' : 'bold';
        }
      }
    });
    editor.value.render();
  }


}

defineExpose({ addElement, updateSelectedElement });

</script>

<template>
  <div class="editor-wrapper" :style="{
    minHeight: editor.viewport.height,
    minWidth: editor.viewport.width
  }">
    <!-- 鍵盤控制器，用於處理快捷鍵 -->
    <KeyboardController
        @delete-selected="handleDeleteSelected"
        @move-selected="handleMoveSelected"
        @text-editing="handleTextEditing"
    />
    <div
        class="uploader-container"
        ref="uploaderContainer">
      <canvas
          ref="canvas"
          class="editor-canvas"
      ></canvas>
      <textarea
          v-if="editor.editingElement"
          ref="textInput"
          v-model="(editor.editingElement.config as ITextConfig).content"
          :style="textInputStyle"
          class="text-editor-input"
          wrap="off"
          @input="handleTextInput"
          @compositionstart="compositionStart"
          @compositionend="compositionEnd"
          @focusout="finishEditing"
          @keydown.enter.shift.prevent="finishEditing"
      />
      <Popover
          ref="popOverRef"
          v-show="popOverMenu.visible && (selectedElement?.type === ElementTypesEnum.Image || imagesStore.selectedElements.length > 1)"
          :style="{ transform: `translate(${popOverMenu.x}px, ${popOverMenu.y}px)`}"
          @change="handlePopOverMenuChange"
      />
      <!-- 自訂右鍵選單 -->
      <div
          v-if="contextMenu.visible && contextMenu.element"
          class="context-menu"
          :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
          @click.stop
      >
        <div class="context-menu-item" @click="deleteSelectedElement">
          刪除
        </div>
        <!-- 在這裡可以新增更多選項，例如： -->
        <!-- <div class="context-menu-item">上移一層</div> -->
        <!-- <div class="context-menu-item">下移一層</div> -->
      </div>
      <div class="upload-prompt-overlay" :style="{
        opacity: imagesStore.elements.length === 0 ? 1 : 0
      }">
        <div class="prompt-content">
          <Symbols name="picture"/>
          <h1>开始产生影像</h1>
          <p>选择素材添加文字、效果和AI，线上编辑您的图片。</p>
        </div>
      </div>
    </div>
    <div class="actions-bar">
      <el-button class="save-button" @click="saveImage">
        <div style="margin-right: 10px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.00199 1.99997C8.37297 1.99997 8.67485 2.30185 8.67485 2.67283L8.67485 8.14618L9.98808 6.82308L10.0321 6.80087C10.0592 6.7873 10.1592 6.74288 10.2982 6.74288C10.4269 6.74288 10.6186 6.78113 10.8004 6.96251C11.1129 7.27508 10.9747 7.6514 10.8583 7.80687L10.846 7.82332L8.19982 10.5032C8.16486 10.5419 8.09371 10.5851 8.00158 10.5851C7.90945 10.5851 7.84118 10.5419 7.80663 10.5032L5.15016 7.82332L5.13782 7.80687C5.02143 7.6514 4.88365 7.27508 5.19581 6.96251C5.37719 6.78113 5.56926 6.74288 5.69799 6.74288C5.837 6.74288 5.93653 6.7873 5.96409 6.80087L6.0081 6.82308L7.32872 8.15399L7.32872 2.67283C7.32872 2.30185 7.63061 1.99997 8.00158 1.99997L8.00199 1.99997Z" fill="black"/>
            <path d="M3.25628 15C1.46052 15 0 13.5544 0 11.7771V7.68354C0 7.3066 0.30977 7 0.690615 7C1.07146 7 1.38123 7.3066 1.38123 7.68354V11.7746C1.38123 12.7237 2.16141 13.4963 3.12071 13.4963H12.7922C13.7996 13.4963 14.6188 12.6851 14.6188 11.6884V7.68354C14.6188 7.3066 14.9285 7 15.3094 7C15.6902 7 16 7.3066 16 7.68354V11.5794C16 13.4658 14.4495 15 12.544 15H3.25628Z" fill="black"/>
          </svg>
        </div>储存图片
      </el-button>
      <div class="crop-controls">
        <div class="input-group">
          <label for="crop-x">X:</label>
          <input id="crop-x" type="number" v-model.number="displayCropBox.x" @change="(e: Event) => handleChange('x', parseInt((e.target as HTMLInputElement)?.value) || 0)"/>
        </div>
        <div class="input-group">
          <label for="crop-y">Y:</label>
          <input id="crop-y" type="number" v-model.number="displayCropBox.y" @change="(e: Event) => handleChange('y', parseInt((e.target as HTMLInputElement)?.value) || 0)"/>
        </div>
        <div class="input-group">
          <label for="crop-width">寬:</label>
          <input id="crop-width" type="number" v-model.number="displayCropBox.width" @change="(e: Event) => handleChange('width', parseInt((e.target as HTMLInputElement)?.value) || 0)" />
        </div>
        <div class="input-group">
          <label for="crop-height">高:</label>
          <input id="crop-height" type="number" v-model.number="displayCropBox.height" @change="(e: Event) => handleChange('height', parseInt((e.target as HTMLInputElement)?.value) || 0)" />
        </div>
        <div class="input-group">
          <span>{{ `${editor.viewport.originalWidth} x ${editor.viewport.originalHeight}` }}</span>
          <span>{{ `${Math.floor(editor.viewport.scale * 100)}%` }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

@use "../../styles/theme";

.editor-wrapper {
  width: 100%;
  height: 100%;
  min-width: 800px;
  display: flex;
  flex-direction: column;
  padding: 10px 10px 10px 10px;
  gap: 1.5rem;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  flex-shrink: 0;
}

.uploader-container {
  position: relative;
  display: flex;
  border-radius: 20px;
  width: 800px;
  height: 600px;
  max-height: 600px;
  min-height: 50px; /* 避免過度縮小 */
  overflow: hidden;
}

.editor-canvas {
  width: 100%;
  height: 100%;
  display: block;
  cursor: default;
}

.upload-prompt-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  background-color: #D9D9D9;
  transition: opacity 0.3s;
}

.prompt-content {
  text-align: center;
  color: #666;
}



.actions-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.upload-button {
  padding: 10px 20px;
  border: none;
  background-color: #409eff;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.upload-button:hover {
  background-color: #79bbff;
}

.save-button {
  width: 146px;
  height: 50px;
  padding: 10px 20px;
  border: none;
  background-color: #78EFB2;
  border-radius: 40px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: black;
  font-weight: 700;
  font-size: 15px;
}

.save-button:hover {
  background-color: #95d475;
}

.text-editor-input {
  position: absolute;
  background-color: white;
  border: 1px dashed #909399;
  margin: 0;
  text-align: center;
  outline: none;
  box-sizing: border-box;
  z-index: 10;
  overflow: hidden;
  resize: none;
  padding: 0;
}

.crop-controls {
  display: flex;
  position: relative;
  gap: 1rem;
  align-items: center;
  background-color: #fff;
  padding: 15px 30px;
  border-radius: 15px;
  height: 30px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-group label {
  font-size: 15px;
  color: #555;
  font-weight: 700;
}

.input-group input {
  width: 40px;
  max-width: 60px;
  padding: 4px 8px;
  border: 1px solid theme.$border-color-base;
  border-radius: 4px;
  text-align: right;
}

.input-group span {
  font-size: 15px;
  color: theme.$text-color;
  font-weight: 700;
}

.input-group input::-webkit-outer-spin-button,
.input-group input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.input-group input[type=number] {
  -moz-appearance: textfield;
}

.context-menu {
  position: fixed; /* 使用 fixed 定位，相對於視窗 */
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 5px 0;
}

.context-menu-item {
  padding: 8px 15px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.context-menu-item:hover {
  background-color: #f0f0f0;
}

.filename {
  position: absolute;
  display: flex;
  top: -20px;
  left: 0;
  right: 0;
  color: black;
}
</style>