<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, reactive, ref, watch} from "vue";
import {useEditorStore} from "@/store/editorStore.ts";
import {CanvasEditor} from "@/Utilities/CanvasEditor.ts";
import {type CroppedExportOptions, exportCroppedArea} from "@/Utilities/useCanvasExporter.ts";
import {ElementTypesEnum, type ICanvasElement, type ITextConfig, type StageConfig} from "@/types.ts";
import Popover from "./Popover.vue";
import KeyboardController from "../Basic/KeyboardController.vue";
import Symbols from "@/components/Basic/Symbols.vue";
import {advancedDefaults, generalDefaults} from "@/config/settings.ts";
import NCropControls from "@/components/EditorArea/NCropControls.vue";

const editorStore = useEditorStore();
const emit = defineEmits(['element-selected']);

const canvas = ref<HTMLCanvasElement | null>(null);
const wheelerRef = ref<HTMLDivElement | null>(null);
const uploaderContainer = ref<HTMLDivElement | null>(null);
const popOverRef = ref<InstanceType<typeof Popover> | null>(null);

const editor = ref<CanvasEditor>(new CanvasEditor(editorStore));

// 使用 SVG 建立一個白色的 'X' 圖示
const deleteIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>`;
// 將 SVG 轉為 Base64 Data URL，讓 Image 物件可以載入
editorStore.deleteIcon.src = `data:image/svg+xml;base64,${btoa(deleteIconSVG)}`;

// 裁切框的狀態
const cropBox = reactive(editor.value.cropBox);

const selectedElement = computed(() => {
  if (editorStore.selectedElements.length <= 0) return null;
  if (editorStore.selectedElements.length > 1) return null;
  return editorStore.selectedElements[0];
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
    x: 0,
    y: -40
  },
});

// 用於平移 uploader-container
const uploaderTranslate = reactive({ x: 0, y: 0 });

onMounted(() => {
  const { viewport } = generalDefaults;
  const config = editorStore.stage.config as StageConfig;
  const width: number = config.width || viewport.width;
  const height: number = config.height || viewport.height;
  const color: string = config.color || viewport.color;

  if (canvas.value) {
    editor.value.setup(canvas.value, uploaderContainer.value);
    if (wheelerRef.value && advancedDefaults.zoomEnabled) editor.value.setupZoomView(wheelerRef.value);
    editor.value.textInput = textInput.value;
    // 預設畫布大小
    editor.value.updateViewportSize(width, height, color);
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
      popOverMenu.visible = advancedDefaults.popupMenu && (event.visible || false);
      popOverMenu.x = Math.max(Math.min(event.x + popOverMenu.offset.x, 900), -100);
      popOverMenu.y = Math.max(event.y + popOverMenu.offset.y, -50);
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
watch(() => editorStore.selectedElements, (newSelection) => {
  // Deep copy to avoid downstream mutations affecting the original object
  emit('element-selected', newSelection.length > 0 ? JSON.parse(JSON.stringify(newSelection)) : []);
  editor.value.render();
  // popOverMenu.visible = (newSelection.length === 1);
}, { deep: true });

// 這邊檢查物件有異動就刷新畫面
watch(() => editorStore.elements, () => {
  editor.value.render();
}, { deep: true });

watch(() => editorStore.originalImage, () => {
  if (editorStore.originalImage) {
    editor.value.updateViewportSize(editorStore.originalImage.width, editorStore.originalImage.height);
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
  // const scrollHeight = textarea.scrollHeight;
  const scrollWidth = textarea.scrollWidth;
  const w = Math.max(scrollWidth, minWidth.value);
  const countLines: number = config.content.split('\n').length;
  // console.log('countLines', countLines * (config._lineSpacing || 0), scrollHeight);
  textarea.style.height = `${countLines * (config._lineSpacing || 0)}px`;
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
    editorStore.elements = editorStore.elements.filter(el => el.id !== editor.value.editingElement!.id);
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
const textAreaSelected = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  const selectedText: string = target.value.substring(target.selectionStart, target.selectionEnd);
  console.log('Text selected:', selectedText);
}

// 儲存裁切後的圖片
const saveImage = async () => {
  // 計算比例
  const scaleFactor = 1 / editor.value.viewport.scale;
  // 輸出圖片的 URL
  const href = exportCroppedArea({
    store: editorStore,
    editorCanvas: canvas.value,
    cropBox: {
      x: cropBox.x,
      y: cropBox.y,
      width: cropBox.width,
      height: cropBox.height
    },
    scaleFactor,
    type: 'image/png',
    color: editor.value.viewport.color
  } as CroppedExportOptions);
  if (href) {
    // 4. 將暫時畫布的內容轉換為圖片的 data URL 並觸發下載
    const link = document.createElement('a');
    link.href = href;
    link.download = editorStore.pageName ? `${editorStore.pageName}.png` : `edited-image-${Date.now()}.png`; // 加上時間戳避免檔名重複
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
    editorStore.removeElements([contextMenu.element.id]);
    editor.value.render();
  }
  closeContextMenu();
};
const handlePopOverMenuChange = (state: string) => {
  const multiple: boolean = editorStore.selectedElements.length > 1;
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
  if (editorStore.selectedElements.length === 0) return;
  editorStore.selectedElements.forEach(element => {
    Object.assign(element.config, newProps);
  });
  editor.value.render();
  // css載入字體包監聽是否完成
  document.fonts.ready.then(() => {
    editor.value.render();
  });
};
// 這邊處理對齊
const alignSelectedElement = (horizontal: string, vertical: string) => {

  if (editorStore.selectedElements.length === 1) {
    editor.value.stageAlign(horizontal, vertical);
  } else {
    editor.value.align(horizontal, vertical);
  }
}
const refresh = () => {
  editor.value.render();
}

// --- 鍵盤事件處理 ---
const handleDeleteSelected = () => {
  const selectedIds = editorStore.selectedElements.map(el => el.id);
  if (selectedIds.length > 0) {
    editorStore.removeElements(selectedIds);
    editor.value.render();
  }
};

const handleMoveSelected = ({ dx, dy }: { dx: number, dy: number }) => {
  if (editorStore.selectedElements.length > 0) {
    editorStore.selectedElements.forEach(el => {
      el.config.x += dx;
      el.config.y += dy;
    });
    editor.value.render();
  }
};

const handleTextEditing = (type: string, action: string) => {
  if (editorStore.selectedElements.length > 0) {
    editorStore.selectedElements.forEach(el => {
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
const handleCtrlEvent = (action: string) => {
  if (action === 'undo') {
    editorStore.undo();
    editor.value.render();
  } else if (action === 'redo') {
    editorStore.redo();
    editor.value.render();
  }
}

defineExpose({ addElement, updateSelectedElement, alignSelectedElement, refresh });

</script>

<template>
  <div class="editor-wrapper" ref="wheelerRef" :style="{
    minHeight: editor.viewport.height,
    minWidth: editor.viewport.width,
  }">
    <!-- 鍵盤控制器，用於處理快捷鍵 -->
    <KeyboardController
        @delete-selected="handleDeleteSelected"
        @move-selected="handleMoveSelected"
        @text-editing="handleTextEditing"
        @ctrl-event="handleCtrlEvent"
    />
    <div
        class="uploader-container"
        :style="{ transform: `scale(${editor.divScale}) translate(${uploaderTranslate.x}px, ${uploaderTranslate.y}px)`}"
        ref="uploaderContainer">
      <div class="control" :style="{
        width: `${ editor.viewport.width * editor.divScale * editor.viewport.scale }px`,
        height: `${ editor.viewport.height * editor.divScale * editor.viewport.scale }px`
      }"/>
      <canvas
          ref="canvas"
          :style="{ opacity: editorStore.elements.length === 0 ? 0 : 1 }"
          class="editor-canvas"
      ></canvas>
      <textarea
          v-if="editor.editingElement"
          ref="textInput"
          v-model="(editor.editingElement.config as ITextConfig).content"
          :style="textInputStyle"
          class="text-editor-input"
          wrap="off"
          @compositionend="compositionEnd"
          @compositionstart="compositionStart"
          @focusout="finishEditing"
          @input="handleTextInput"
          @select="textAreaSelected"
          @keydown.enter.shift.prevent="finishEditing"
      />
      <!-- 快速選單 -->
      <div
          :style="{ transform: `translate(${popOverMenu.x}px, ${popOverMenu.y}px)`}"
          class="pop-over-menu"
          ref="popOverRef">
        <Popover
            v-show="popOverMenu.visible && (selectedElement?.type === ElementTypesEnum.Image || editorStore.selectedElements.length > 1)"
            @change="handlePopOverMenuChange"
            @alignElement="alignSelectedElement"/>
      </div>
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
        opacity: editorStore.elements.length === 0 ? 1 : 0
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
        <el-icon size="20"><Symbols name="download"/></el-icon>
        <span>储存图片</span>
      </el-button>
      <NCropControls
          :crop-box="editor.cropBox"
          :viewport="editor.viewport"
          :div-scale="editor.divScale"
          @change="handleChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">

@use "@/styles/theme";

.editor-wrapper {
  width: 100%;
  height: 100%;
  min-width: 800px;
  display: flex;
  flex-direction: column;
  padding: 100px 10px 10px 10px;
  gap: 1.5rem;
  box-sizing: border-box;
  //justify-content: center;
  align-items: center;
  flex-shrink: 0;
}
.control {
  position: absolute;
  display: flex;
  pointer-events: none;
}
.uploader-container {
  position: relative;
  display: flex;
  border-radius: 20px;
  width: 800px;
  height: 600px;
  max-height: 600px;
  min-height: 50px; /* 避免過度縮小 */
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
  border-radius: 20px;
}

.prompt-content {
  text-align: center;
  color: #666;
  position: relative;
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}


.actions-bar {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
  z-index: 10;
  bottom: 50px;
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

.pop-over-menu {
  position: fixed;
  display: flex;
  min-width: 40px;
  min-height: 36px;
  flex-direction: row;
}

</style>