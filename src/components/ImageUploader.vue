<script setup lang="ts">
import { ref, reactive, nextTick, watch } from "vue";

interface CanvasElement {
  id: number;
  type: 'text' | 'icon';
  content: string;
  x: number;
  y: number;
  color: string;
  // 文字屬性
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  lineHeight?: number;
  // 圖示屬性
  size?: number;
  // 陰影屬性
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  // 外框屬性
  strokeColor?: string;
  strokeWidth?: number;
}

const emit = defineEmits(['element-selected']);

const imageUrl = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const originalImage = ref<HTMLImageElement | null>(null); // 儲存原始圖片物件

// 裁切框的狀態
const cropBox = reactive({
  x: 150,
  y: 150,
  width: 300,
  height: 300,
});

// 畫布上的元素 (文字、圖形等)
const elements = ref<CanvasElement[]>([]);

// --- 互動狀態管理 ---
const selectedElement = ref<CanvasElement | null>(null);
const editingElement = ref<CanvasElement | null>(null);
const textInput = ref<HTMLInputElement | null>(null);

const textInputStyle = reactive({
  top: '0px',
  left: '0px',
  width: '0px',
  height: '0px',
  fontSize: '32px',
  fontFamily: 'Arial',
});

// 拖曳裁切框相關的狀態
const isDraggingCropBox = ref(false);
const isDraggingElement = ref(false);
const dragStart = reactive({
  x: 0,
  y: 0,
  boxX: 0,
  boxY: 0,
  elementX: 0,
  elementY: 0,
});

// --- Event Emitters and Watchers ---
watch(selectedElement, (newSelection) => {
  // Deep copy to avoid downstream mutations affecting the original object
  emit('element-selected', newSelection ? JSON.parse(JSON.stringify(newSelection)) : null);
});


// 處理選擇或拖曳的檔案
const processFile = (file: File) => {
  // 驗證是否為圖片檔案
  if (!file.type.startsWith('image/')) {
    alert('請上傳圖片檔案');
    return;
  }

  // 使用 FileReader 讀取檔案並產生預覽
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string;
    imageUrl.value = dataUrl; // 用於切換 v-if 顯示

    const img = new Image();
    img.onload = () => {
      originalImage.value = img; // 儲存圖片物件

      // 將裁切框重設到畫布中心
      if (canvas.value) {
        cropBox.x = (canvas.value.width - cropBox.width) / 2;
        cropBox.y = (canvas.value.height - cropBox.height) / 2;
      }

      redrawCanvas(); // 進行初次繪製
    };
    img.src = dataUrl;
  };
  reader.readAsDataURL(file);
};

// --- 統一的約束與重繪邏輯 ---

const constrainCropBox = () => {
  if (!canvas.value) return false;

  const original = { ...cropBox };

  const minSize = 10;
  // 使用 Math.round 避免拖曳時產生小數
  let w = Math.round(Math.max(minSize, cropBox.width));
  let h = Math.round(Math.max(minSize, cropBox.height));

  // 確保尺寸不超過畫布
  w = Math.min(w, canvas.value.width);
  h = Math.min(h, canvas.value.height);

  // 確保位置在邊界內
  let x = Math.round(Math.max(0, Math.min(cropBox.x, canvas.value.width - w)));
  let y = Math.round(Math.max(0, Math.min(cropBox.y, canvas.value.height - h)));

  // 應用約束後的值
  cropBox.width = w;
  cropBox.height = h;
  cropBox.x = x;
  cropBox.y = y;

  // 回傳是否有值被更改
  return original.x !== x || original.y !== y || original.width !== w || original.height !== h;
};

// 監聽裁切框的任何變更（來自拖曳或輸入框）
watch(cropBox, () => {
  // 當 cropBox 變更時，先套用約束
  const wasConstrained = constrainCropBox();

  // 如果值沒有被約束（表示值是有效的），則直接重繪
  // 如果值被約束了，此函式會被再次觸發，屆時 wasConstrained 會是 false，然後再重繪
  if (!wasConstrained) {
    redrawCanvas();
  }
}, { deep: true });

// 重新繪製整個畫布（背景、圖片、裁切框）
const redrawCanvas = () => {
  const ctx = canvas.value?.getContext("2d");
  if (!ctx || !canvas.value) return;

  const canvasEl = canvas.value;

  // 1. 清除畫布並填上白色背景
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

  // 2. 繪製置中的原始圖片
  if (originalImage.value) {
    const img = originalImage.value;
    const canvasRatio = canvasEl.width / canvasEl.height;
    const imgRatio = img.width / img.height;
    let drawWidth, drawHeight, x, y;

    if (imgRatio > canvasRatio) {
      drawWidth = canvasEl.width;
      drawHeight = drawWidth / imgRatio;
      x = 0;
      y = (canvasEl.height - drawHeight) / 2;
    } else {
      drawHeight = canvasEl.height;
      drawWidth = drawHeight * imgRatio;
      y = 0;
      x = (canvasEl.width - drawWidth) / 2;
    }
    ctx.drawImage(img, x, y, drawWidth, drawHeight);
  }

  // 3. 若有圖片，則繪製裁切框的半透明遮罩和邊框
  if (imageUrl.value) {
    ctx.save();
    // 使用 "evenodd" 填充規則來建立一個有孔的矩形（遮罩）
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.rect(0, 0, canvasEl.width, canvasEl.height); // 外矩形
    ctx.rect(cropBox.x, cropBox.y, cropBox.width, cropBox.height); // 內矩形 (孔)
    ctx.fill("evenodd");
    ctx.restore();

    // 繪製裁切框的邊框
    ctx.strokeStyle = "#409eff";
    ctx.lineWidth = 2;
    ctx.strokeRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height);

    // 4. 繪製所有其他元素
    elements.value.forEach(element => {
      // 如果元素正在被編輯，則不在 canvas 上繪製它，由 input 框取代
      if (editingElement.value?.id === element.id) return;

      if (element.type === 'text') {
        if (!element.fontSize || !element.fontFamily) return;
        ctx.save();

        // Common text styles
        ctx.font = `${element.fontWeight || 'normal'} ${element.fontSize}px ${element.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Apply shadow if properties exist
        if (element.shadowColor) {
          ctx.shadowColor = element.shadowColor;
          ctx.shadowBlur = element.shadowBlur || 0;
          ctx.shadowOffsetX = element.shadowOffsetX || 0;
          ctx.shadowOffsetY = element.shadowOffsetY || 0;
        }

        const lines = element.content.split('\n');
        const lineHeight = element.lineHeight || 1.2; // Default line height multiplier
        const totalTextHeight = lines.length * element.fontSize * lineHeight;
        let currentLineY = element.y - totalTextHeight / 2 + (element.fontSize * lineHeight) / 2;

        lines.forEach((line) => {
          // Apply stroke if properties exist
          if (element.strokeColor && element.strokeWidth) {
            ctx.strokeStyle = element.strokeColor;
            ctx.lineWidth = element.strokeWidth;
            ctx.strokeText(line, element.x, currentLineY);
          }

          // Apply fill
          ctx.fillStyle = element.color;
          ctx.fillText(line, element.x, currentLineY);

          if (element.fontSize) currentLineY += element.fontSize * lineHeight;
        });

        ctx.restore();
      } else if (element.type === 'icon') {
        if (!element.size) return;
        const path = new Path2D(element.content);
        ctx.fillStyle = element.color;

        // 為了讓圖示可以被正確縮放和定位，我們需要做一些轉換
        // SVG 的 viewBox 是 1024x1024，我們將其縮放到指定的 size
        const scale = element.size / 1024;
        ctx.save();
        // 將原點移動到繪製中心，然後縮放，再移回來
        ctx.translate(element.x, element.y);
        ctx.scale(scale, scale);
        ctx.translate(-512, -512); // SVG viewBox 的中心是 512,512
        ctx.fill(path);
        ctx.restore();
      }
      // 未來可以在此處處理其他類型的元素
    });

    // 5. 如果有選中元素，繪製選取框
    if (selectedElement.value && !editingElement.value) {
      const box = getElementBoundingBox(selectedElement.value);
      if (box) {
        ctx.strokeStyle = '#409eff';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]); // 繪製虛線框
        // 增加一點 padding 讓選取框更明顯
        ctx.strokeRect(box.x - 5, box.y - 5, box.width + 10, box.height + 10);
        ctx.setLineDash([]); // 重置虛線設定
      }
    }
  }
};

// --- 裁切框拖曳事件處理 ---

const isPointInCropBox = (x: number, y: number) => {
  return (
    x >= cropBox.x &&
    x <= cropBox.x + cropBox.width &&
    y >= cropBox.y &&
    y <= cropBox.y + cropBox.height
  );
};

// --- 元素互動輔助函式 ---
const getElementBoundingBox = (element: CanvasElement) => {
  const ctx = canvas.value?.getContext("2d");
  if (!ctx) return null;

  let width = 0;
  let height = 0;

  if (element.type === 'text' && element.fontSize && element.fontFamily) {
    ctx.font = `${element.fontWeight || 'normal'} ${element.fontSize}px ${element.fontFamily}`;
    const metrics = ctx.measureText(element.content);
    width = metrics.width;
    // For multi-line text, height needs to consider line breaks and line height
    const lines = element.content.split('\n');
    const lineHeight = element.lineHeight || 1.2;
    height = lines.length * element.fontSize * lineHeight;

  } else if (element.type === 'icon' && element.size) {
    width = element.size;
    height = element.size;
  }

  // 因為文字是中心對齊的，所以要從中心點計算左上角座標
  return {
    x: element.x - width / 2,
    y: element.y - height / 2,
    width,
    height,
  };
};

const isPointInBox = (px: number, py: number, box: {x: number, y: number, width: number, height: number}) => {
  return px >= box.x && px <= box.x + box.width && py >= box.y && py <= box.y + box.height;
}

const findElementAtPosition = (x: number, y: number) => {
  // 從後往前找，確保點擊到最上層的元素
  return [...elements.value].reverse().find(el => {
    // 對所有可互動的元素類型進行邊界檢查
    const box = getElementBoundingBox(el);
    return box && isPointInBox(x, y, box);
  });
};

// --- Canvas 事件處理 ---

const onCanvasMouseDown = (event: MouseEvent) => {
  if (!imageUrl.value) return;
  const x = event.offsetX;
  const y = event.offsetY;

  const clickedElement = findElementAtPosition(x, y);

  // Handle element selection
  selectedElement.value = clickedElement || null;

  if (clickedElement) {
    isDraggingElement.value = true;
    dragStart.x = x;
    dragStart.y = y;
    dragStart.elementX = clickedElement.x;
    dragStart.elementY = clickedElement.y;
  } else if (isPointInCropBox(x, y)) {
    isDraggingCropBox.value = true;
    dragStart.x = event.offsetX;
    dragStart.y = event.offsetY;
    dragStart.boxX = cropBox.x;
    dragStart.boxY = cropBox.y;
  }
  
  redrawCanvas();
};

const onCanvasMouseMove = (event: MouseEvent) => {
  if (!imageUrl.value || !canvas.value) return;
  const x = event.offsetX;
  const y = event.offsetY;

  // 處理元素拖曳
  if (isDraggingElement.value && selectedElement.value) {
    canvas.value.style.cursor = "move";
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;
    selectedElement.value.x = dragStart.elementX + dx;
    selectedElement.value.y = dragStart.elementY + dy;
    redrawCanvas();
    return;
  }

  // 處理裁切框拖曳
  if (isDraggingCropBox.value) {
    canvas.value.style.cursor = "move";
    const dx = event.offsetX - dragStart.x;
    const dy = event.offsetY - dragStart.y;

    // 直接更新值，讓 watcher 處理約束和重繪
    cropBox.x = dragStart.boxX + dx;
    cropBox.y = dragStart.boxY + dy;

    return;
  }

  // 根據滑鼠位置改變指標樣式 (Hover)
  const hoveredElement = findElementAtPosition(x, y);
  if (hoveredElement) {
    canvas.value.style.cursor = 'move';
  } else if (isPointInCropBox(x, y)) {
    canvas.value.style.cursor = 'move';
  } else {
    canvas.value.style.cursor = 'default';
  }
};

const onCanvasDoubleClick = (event: MouseEvent) => {
  if (!imageUrl.value) return;
  const clickedElement = findElementAtPosition(event.offsetX, event.offsetY);
  
  // 只有文字元素可以雙擊編輯
  if (clickedElement && clickedElement.type === 'text') {
    selectedElement.value = null; // 取消選取狀態，進入編輯狀態
    editingElement.value = clickedElement;
    const box = getElementBoundingBox(clickedElement)!;

    // 設定 input 的樣式和位置
    textInputStyle.left = `${box.x}px`;
    textInputStyle.top = `${box.y}px`;
    textInputStyle.width = `${box.width + 20}px`; // 增加一點寬度方便輸入
    textInputStyle.height = `${box.height}px`;
    textInputStyle.fontSize = `${clickedElement.fontSize}px`;
    textInputStyle.fontFamily = clickedElement.fontFamily || '';

    redrawCanvas(); // 重新繪製，隱藏 canvas 上的文字

    nextTick(() => {
      textInput.value?.focus();
      textInput.value?.select();
    });
  }
};

const onCanvasMouseUpOrLeave = () => {
  isDraggingCropBox.value = false;
  isDraggingElement.value = false;
  if (canvas.value) {
    // 恢復指標樣式，讓mousemove事件下次可以重新判斷
    canvas.value.style.cursor = "default";
  }
};

// --- 文字編輯方法 ---
const finishEditing = () => {
  if (!editingElement.value) return;
  // 如果編輯後文字為空，則移除該元素
  if (editingElement.value.content.trim() === '') {
    elements.value = elements.value.filter(el => el.id !== editingElement.value!.id);
  }
  editingElement.value = null;
  redrawCanvas();
};

// 儲存裁切後的圖片
const saveImage = () => {
  if (!canvas.value || !imageUrl.value) {
    alert('沒有可儲存的圖片。');
    return;
  }

  // 1. 建立一個暫時的 canvas 來繪製裁切後的結果
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  if (!tempCtx) {
    alert('無法建立圖片，您的瀏覽器可能不支援此功能。');
    return;
  }

  // 2. 設定暫時 canvas 的尺寸等於裁切框的尺寸
  tempCanvas.width = cropBox.width;
  tempCanvas.height = cropBox.height;

  // 3. 使用 drawImage 將主畫布中，裁切框內的區域，繪製到暫時畫布上
  tempCtx.drawImage(
    canvas.value,      // 來源是我們的主畫布
    cropBox.x,         // 從主畫布的 cropBox.x 開始擷取
    cropBox.y,         // 從主畫布的 cropBox.y 開始擷取
    cropBox.width,     // 擷取寬度
    cropBox.height,    // 擷取高度
    0, 0,              // 繪製到暫時畫布的 (0,0) 位置
    cropBox.width,     // 繪製寬度
    cropBox.height     // 繪製高度
  );

  // 4. 將暫時畫布的內容轉換為圖片的 data URL 並觸發下載
  const link = document.createElement('a');
  link.href = tempCanvas.toDataURL('image/png');
  link.download = `edited-image-${Date.now()}.png`; // 加上時間戳避免檔名重複
  document.body.appendChild(link); // Firefox 需要將 link 加入 DOM
  link.click();
  document.body.removeChild(link); // 清理 DOM
};


// --- 供外部呼叫的方法 ---

const addElement = (element: any) => {
  if (!canvas.value || !imageUrl.value) {
    alert('請先上傳一張圖片！');
    return;
  }

  if (element.type === 'text') {
    elements.value.push({
      id: Date.now(),
      type: 'text',
      content: element.content || '新文字',
      x: canvas.value.width / 2, // 預設放在畫布中央
      y: canvas.value.height / 2,
      fontSize: element.fontSize || 32,
      fontFamily: element.fontFamily || 'Arial',
      color: element.color || 'black',
      fontWeight: element.fontWeight || 'normal',
      lineHeight: element.lineHeight || 1.2,
      shadowColor: element.shadowColor,
      shadowBlur: element.shadowBlur,
      shadowOffsetX: element.shadowOffsetX,
      shadowOffsetY: element.shadowOffsetY,
      strokeColor: element.strokeColor,
      strokeWidth: element.strokeWidth,
    });
  } else if (element.type === 'icon') {
    elements.value.push({
      id: Date.now(),
      type: 'icon',
      content: element.content || '',
      x: canvas.value.width / 2,
      y: canvas.value.height / 2,
      size: 50, // 預設圖示大小
      color: 'black',
    });
  }

  redrawCanvas();
};

const updateSelectedElement = (newProps: Partial<CanvasElement>) => {
  if (!selectedElement.value) return;

  // Merge the new properties into the selected element
  Object.assign(selectedElement.value, newProps);
  
  redrawCanvas();
};

// 點擊容器時，觸發隱藏的 file input
const onContainerClick = () => {
  fileInput.value?.click();
};

// 處理透過點擊選擇的檔案
const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    processFile(target.files[0]);
  }
};

defineExpose({ addElement, updateSelectedElement });

</script>

<template>
  <div class="editor-wrapper">
    <div class="uploader-container">
    <input
      ref="fileInput"
      type="file"
      @change="onFileChange"
      accept="image/*"
      hidden
    />
    <!-- Canvas 畫布現在是主要顯示區域 -->
    <canvas
      ref="canvas"
      width="800"
      height="600"
      class="editor-canvas"
      @mousedown="onCanvasMouseDown"
      @mousemove="onCanvasMouseMove"
      @mouseup="onCanvasMouseUpOrLeave"
      @mouseleave="onCanvasMouseUpOrLeave"
      @dblclick="onCanvasDoubleClick"
    ></canvas>
    <!-- 文字編輯輸入框 -->
    <input
      v-if="editingElement"
      ref="textInput"
      v-model="editingElement.content"
      :style="textInputStyle"
      class="text-editor-input"
      @blur="finishEditing"
      @keydown.enter.prevent="finishEditing"
    />
    <!-- 上傳提示變成一個覆蓋層 -->
    <div v-if="!imageUrl" class="upload-prompt-overlay">
      <div class="prompt-content">
        <p>點擊下方按鈕上傳圖片</p>
      </div>
    </div>
  </div>
    <div class="actions-bar">
      <button class="upload-button" @click="onContainerClick">
        上傳圖片
      </button>
      <button v-if="imageUrl" class="save-button" @click="saveImage">
        儲存圖片
      </button>
      <!-- 裁切框控制項 -->
      <div v-if="imageUrl" class="crop-controls">
        <div class="input-group">
          <label for="crop-x">X:</label>
          <input id="crop-x" type="number" v-model.number="cropBox.x" />
        </div>
        <div class="input-group">
          <label for="crop-y">Y:</label>
          <input id="crop-y" type="number" v-model.number="cropBox.y" />
        </div>
        <div class="input-group">
          <label for="crop-width">寬:</label>
          <input id="crop-width" type="number" v-model.number="cropBox.width" />
        </div>
        <div class="input-group">
          <label for="crop-height">高:</label>
          <input id="crop-height" type="number" v-model.number="cropBox.height" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.uploader-container {
  position: relative;
  border: 2px dashed #ccc;
  border-radius: 10px;
  width: 800px;
  height: 600px;
  transition: border-color 0.3s, background-color 0.3s;
  overflow: hidden;
  background-color: #f9f9f9;
}

.uploader-container:hover {
  border-color: #409eff; /* Element Plus 主題色 */
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
  pointer-events: none; /* 讓點擊事件可以穿透到下方的 container */
}

.prompt-content {
  text-align: center;
  color: #666;
}

.editor-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem; /* 增加按鈕和畫布的間距 */
}

.actions-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.upload-button {
  /* 此按鈕現在是唯一的上傳方式 */
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
  background-color: #67c23a; /* Element Plus success color */
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
  border: 1.5px dashed #409eff;
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
  border-radius: 8px;
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
/* 隱藏 number input 的上下箭頭 */
.input-group input::-webkit-outer-spin-button,
.input-group input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.input-group input[type=number] {
  -moz-appearance: textfield;
}
</style>