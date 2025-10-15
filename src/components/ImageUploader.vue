<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch} from "vue";
import {type CanvasElement} from "../Utilities/useImageEditor.ts";
import {useImagesStore} from "../store/images.ts";
import {processFile} from "../Utilities/FileProcessor.ts";
import {CanvasEditor} from "../Utilities/CanvasEditor.ts";
import {type CroppedExportOptions, exportCroppedArea} from "../Utilities/useCanvasExporter.ts";

const imagesStore = useImagesStore();
const emit = defineEmits(['element-selected']);

const fileInput = ref<HTMLInputElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const uploaderContainer = ref<HTMLDivElement | null>(null);

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
  element: null as CanvasElement | null,
});

onMounted(() => {
  if (canvas.value) {
    editor.value.setup(canvas.value, uploaderContainer.value);
    editor.value.textInput = textInput.value;
    // 預設畫布大小
    editor.value.updateViewportSize(800, 600);
    // 支援貼圖Ctrl+V
    editor.value.enablePasteSupport();
    // 尺寸變更後需要重新繪製所有內容
    editor.value.render();

    // 設定右鍵選單的回呼函式
    editor.value.onContextMenu = (event) => {
      contextMenu.visible = true;
      contextMenu.x = event.x;
      contextMenu.y = event.y;
      contextMenu.element = event.element;
    };
    window.addEventListener('click', closeContextMenu);
  }

})

// --- Event Emitters and Watchers ---
// 選擇物件刷新畫面
watch(() => imagesStore.selectedElement, (newSelection) => {
  // Deep copy to avoid downstream mutations affecting the original object
  console.log('se');
  emit('element-selected', newSelection ? JSON.parse(JSON.stringify(newSelection)) : null);
  editor.value.render();
}, {deep : true});

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

// --- 文字編輯方法 ---
const finishEditing = () => {
  if (isComposing.value) return;
  if (!editor.value.editingElement) return;
  // 如果編輯後文字為空，則移除該元素
  if (editor.value.editingElement.content.trim() === '') {
    imagesStore.elements = imagesStore.elements.filter(el => el.id !== editor.value.editingElement!.id);
  }
  editor.value.editingElement = null;
  editor.value.render();
};
// 處理IME輸入問題
const compositionStart = () => {
  isComposing.value = true;
}
const compositionEnd = () => {
  isComposing.value = false;
}

// 儲存裁切後的圖片
const saveImage = () => {
  if (!canvas.value || !imagesStore.imageUrl) {
    alert('沒有可儲存的圖片。');
    return;
  }
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
    imagesStore.removeElement(contextMenu.element.id);
    editor.value.render();
  }
  closeContextMenu();
};


// --- 供外部呼叫的方法 ---
const addElement = async (element: any) => {
  await editor.value.addElement(element);
};

const updateSelectedElement = (newProps: Partial<CanvasElement>) => {
  if (!imagesStore.selectedElement) return;

  Object.assign(imagesStore.selectedElement, newProps);

  editor.value.render();
};

const onContainerClick = () => {
  fileInput.value?.click();
};

const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const info = await processFile(target.files[0]);
    editor.value.setImage(info.image);
  }
};

defineExpose({ addElement, updateSelectedElement });

</script>

<template>
  <div class="editor-wrapper">
    <div class="uploader-container" ref="uploaderContainer">
      <input
          ref="fileInput"
          type="file"
          @change="onFileChange"
          accept="image/*"
          hidden
      />
      <canvas
          ref="canvas"
          class="editor-canvas"
      ></canvas>
      <input
          v-if="editor.editingElement"
          ref="textInput"
          v-model="editor.editingElement.content"
          :style="textInputStyle"
          class="text-editor-input"
          @compositionstart="compositionStart"
          @compositionend="compositionEnd"
          @focusout="finishEditing"
          @keydown.enter.prevent="finishEditing"
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
      <div v-if="!imagesStore.imageUrl" class="upload-prompt-overlay">
        <div class="prompt-content">
          <p>點擊下方按鈕上傳圖片</p>
        </div>
      </div>
    </div>
    <div class="actions-bar">
      <button class="upload-button" hidden="hidden" @click="onContainerClick">
        上傳圖片
      </button>
      <button v-if="imagesStore.imageUrl" class="save-button" @click="saveImage">
        儲存圖片
      </button>
      <div v-if="imagesStore.imageUrl" class="crop-controls">
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
        <div style="color:#808080;">{{ `${editor.viewport.originalWidth}px x ${editor.viewport.originalHeight}px` }}</div>
        <div style="color:#808080;">{{ `${Math.floor(editor.viewport.scale * 100)}%` }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>

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
  overflow: auto;
}

.uploader-container {
  position: relative;
  border: 2px dashed #ccc;
  border-radius: 10px;
  width: 800px;
  height: 600px;
  max-height: 600px;
  min-height: 50px; /* 避免過度縮小 */
  transition: border-color 0.3s, background-color 0.3s;
  overflow: hidden;
}

.uploader-container:hover {
  border-color: #409eff;
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
  padding: 10px 20px;
  border: none;
  background-color: #67c23a;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-button:hover {
  background-color: #95d475;
}

.text-editor-input {
  position: absolute;
  background-color: transparent;
  border: 1px dashed #409eff;
  padding: 0;
  margin: 0;
  text-align: center;
  outline: none;
  box-sizing: border-box;
  z-index: 10;
}

.crop-controls,
.text-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  background-color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 15px;
  border: 1px solid #e0e0e0;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-group label {
  font-size: 14px;
  color: #555;
}

.input-group input {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: right;
}

.input-group select {
  min-width: 120px;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
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
</style>