<script setup lang="ts">
import { ref, reactive, nextTick, watch } from "vue";
import { drawBackground, drawCropMarks, drawSticker, drawSVG, drawText, type CanvasElement} from "./useImageEditor.ts";
import { useImagesStore } from "../store/images.ts";
import {ErrorMessage} from "../Utilities/AlertMessage.ts";
import {processFile} from "../Utilities/FileProcessor.ts";

const imagesStore = useImagesStore();
const emit = defineEmits(['element-selected']);

const fileInput = ref<HTMLInputElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);

// --- 預載入控制項圖示 ---
const deleteIcon = new Image();
// 使用 SVG 建立一個白色的 'X' 圖示
const deleteIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>`;
// 將 SVG 轉為 Base64 Data URL，讓 Image 物件可以載入
deleteIcon.src = `data:image/svg+xml;base64,${btoa(deleteIconSVG)}`;

// 裁切框的狀態
const cropBox = reactive({
  x: 150,
  y: 150,
  width: 800,
  height: 400,
});

// --- 互動狀態管理 ---
const editingElement = ref<CanvasElement | null>(null);
const textInput = ref<HTMLInputElement | null>(null);
// 文字編輯狀態
const isComposing = ref<boolean>(false);

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
const isResizing = ref<string | null>(null);
const isRotating = ref(false);
const dragStart = reactive({
  x: 0,
  y: 0,
  boxX: 0,
  boxY: 0,
  elementX: 0,
  elementY: 0,
  elementSize: 0,
  elementRotation: 0,
  angle: 0,
});

// --- Event Emitters and Watchers ---
watch(() => imagesStore.selectedElement, (newSelection) => {
  // Deep copy to avoid downstream mutations affecting the original object
  emit('element-selected', newSelection ? JSON.parse(JSON.stringify(newSelection)) : null);
}, {deep : true});

// 這邊檢查物件有異動就刷新畫面
watch(() => imagesStore.elements, () => {
  redrawCanvas();
}, { deep: true });

watch(() => imagesStore.originalImage, () => {
  resetCropMarks();
  redrawCanvas(); // 進行初次繪製
}, { deep: true })

const resetCropMarks = () => {
  // 將裁切框重設到畫布中心
  if (canvas.value) {
    cropBox.x = (canvas.value.width - cropBox.width) / 2;
    cropBox.y = (canvas.value.height - cropBox.height) / 2;
  }
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
  if (imagesStore.originalImage) {
    drawBackground(canvasEl, ctx, imagesStore.originalImage);
  }
  // 3. 若有圖片，則繪製裁切框的半透明遮罩和邊框
  if (imagesStore.imageUrl) {
    drawCropMarks(canvasEl, ctx, cropBox);

    // 4. 繪製所有其他元素
    imagesStore.elements.forEach(element => {

      // 如果元素正在被編輯，則不在 canvas 上繪製它，由 input 框取代
      if (editingElement.value?.id === element.id) return;

      if (element.type === 'text') {
        drawText(ctx, element);
      } else if (element.type === 'icon') {
        drawSVG(ctx, element);
      } else if (element.type === 'sticker') {
        drawSticker(ctx, element);
      }
    });

    // 5. 如果有選中元素，繪製選取框
    if (imagesStore.selectedElement && !editingElement.value) {
      const box = getElementBoundingBox(imagesStore.selectedElement);
      if (box) { // Draw a simple dashed box for non-sticker elements
        ctx.strokeStyle = '#409eff';
        ctx.lineWidth = 2;
        const isTransformable = imagesStore.selectedElement.type === 'sticker' || imagesStore.selectedElement.type === 'text';
        if (isTransformable) {
          drawTransformHandles(ctx, imagesStore.selectedElement);
        } else { // Draw simple dashed box for other types like 'icon'
          ctx.setLineDash([6, 3]);
          ctx.strokeRect(box.x - 5, box.y - 5, box.width + 10, box.height + 10);
          ctx.setLineDash([]);
        }
      }
    }
  }
};
// 產生編輯用的邊框
const drawTransformHandles = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
  const handles = getTransformHandles(element);
  if (!handles) return;

  ctx.strokeStyle = '#409eff';
  ctx.lineWidth = 1;

  // Draw bounding box
  ctx.stroke(handles.path);

  // Draw handles
  Object.entries(handles.points).forEach(([key, p]) => {
    if (!p) return;

    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);

    if (key === 'del') {
      // 繪製刪除按鈕
      ctx.fillStyle = '#f56c6c'; // Element Plus danger color
      ctx.fill();

      // 繪製 'X' (使用預載入的 SVG 圖示)
      const iconSize = 8; // 圖示在按鈕中的大小
      if (deleteIcon.complete) { // 確保圖片已載入完成
        ctx.drawImage(deleteIcon, p.x - iconSize / 2, p.y - iconSize / 2, iconSize, iconSize);
      }
    } else {
      // 繪製其他控制點
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#409eff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });
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
    const lines = element.content.split('\n');
    const metrics = lines.map(line => ctx.measureText(line));
    width = Math.max(...metrics.map(m => m.width));
    const lineHeight = element.lineHeight || 1.2;
    height = lines.length * element.fontSize * lineHeight;

  } else if ((element.type === 'icon' || element.type === 'sticker') && element.size) {
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

const getTransformHandles = (element: CanvasElement) => {
  const box = getElementBoundingBox(element);
  if (!box) return null;

  const { width: w, height: h } = box;
  const cx = element.x;
  const cy = element.y;
  const angle = element.rotation || 0;

  const rotatePoint = (x: number, y: number, angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: x * cos - y * sin,
      y: x * sin + y * cos,
    };
  };

  const halfW = w / 2;
  const halfH = h / 2;

  const tl_r = rotatePoint(-halfW, -halfH, angle);
  const tr_r = rotatePoint(halfW, -halfH, angle);
  const bl_r = rotatePoint(-halfW, halfH, angle);
  const br_r = rotatePoint(halfW, halfH, angle);
  const rot_r = rotatePoint(0, -halfH - 20, angle); // Rotation handle 20px above top-middle
  const del_r = rotatePoint(halfW + 20, -halfH - 20, angle); // Delete handle outside top-right

  const path = new Path2D();
  path.moveTo(cx + tl_r.x, cy + tl_r.y);
  path.lineTo(cx + tr_r.x, cy + tr_r.y);
  path.lineTo(cx + br_r.x, cy + br_r.y);
  path.lineTo(cx + bl_r.x, cy + bl_r.y);
  path.closePath();

  return {
    path,
    points: {
      tl: { x: cx + tl_r.x, y: cy + tl_r.y },
      tr: { x: cx + tr_r.x, y: cy + tr_r.y },
      bl: { x: cx + bl_r.x, y: cy + bl_r.y },
      br: { x: cx + br_r.x, y: cy + br_r.y },
      rot: { x: cx + rot_r.x, y: cy + rot_r.y },
      del: { x: cx + del_r.x, y: cy + del_r.y },
    }
  };
};

const getActionForHandle = (x: number, y: number, element: CanvasElement) => {
  const handles = getTransformHandles(element);
  if (!handles) return null;

  const handleRadius = 8; // Larger click area for handles
  for (const [key, p] of Object.entries(handles.points)) {
    if (Math.hypot(p.x - x, p.y - y) < handleRadius) {
      return key; // 'tl', 'tr', 'bl', 'br', 'rot', 'del'
    }
  }
  return null;
};

const findElementAtPosition = (x: number, y: number) => {
  // 從後往前找，確保點擊到最上層的元素
  return [...imagesStore.elements].reverse().find(el => {
    if ((el.type === 'sticker' || el.type === 'text') && el.rotation) {
      // For rotated stickers, we need to check against the rotated bounding box
      // A simpler way is to transform the click point into the element's local coordinate system
      const angle = el.rotation || 0;
      const dx = x - el.x;
      const dy = y - el.y;
      const localX = dx * Math.cos(-angle) - dy * Math.sin(-angle);
      const localY = dx * Math.sin(-angle) + dy * Math.cos(-angle);

      const box = getElementBoundingBox(el);
      if (!box) return false;
      return Math.abs(localX) < box.width / 2 && Math.abs(localY) < box.height / 2;
    } else {
      // For other elements, use the axis-aligned bounding box
      const box = getElementBoundingBox(el);
      return box && isPointInBox(x, y, box);
    }
  });
};

// --- Canvas 事件處理 ---

const onCanvasMouseDown = (event: MouseEvent) => {
  if (!imagesStore.imageUrl || !canvas.value) return;
  const x = event.offsetX;
  const y = event.offsetY;

  // Check for sticker handle interaction first
  const isTransformable = imagesStore.selectedElement?.type === 'sticker' || imagesStore.selectedElement?.type === 'text';
  if (imagesStore.selectedElement && isTransformable) {
    const action = getActionForHandle(x, y, imagesStore.selectedElement);
    if (action) {
      if (action === 'del') {
        // 執行刪除操作
        imagesStore.elements = imagesStore.elements.filter(el => el.id !== imagesStore.selectedElement!.id);
        imagesStore.selectedElement = null; // 清除選取
        redrawCanvas();
        return;
      }
      handleTransformStart(x, y, action, imagesStore.selectedElement);
      return;
    }
  }

  const clickedElement = findElementAtPosition(x, y);

  // Handle element selection
  imagesStore.selectedElement = clickedElement || null;

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

const handleTransformStart = (x: number, y: number, action: string, element: CanvasElement) => {
  dragStart.x = x;
  dragStart.y = y;
  dragStart.elementX = element.x;
  dragStart.elementY = element.y;
  // For text, we scale fontSize. For stickers, we scale size.
  dragStart.elementSize = element.fontSize || element.size || 0;
  dragStart.elementRotation = element.rotation || 0;

  if (action === 'rot') {
    isRotating.value = true;
    // Calculate initial angle between center and mouse
    dragStart.angle = Math.atan2(y - element.y, x - element.x) - dragStart.elementRotation;
  } else {
    isResizing.value = action; // 'tl', 'tr', 'bl', 'br'
  }
  redrawCanvas();
};

const onCanvasMouseMove = (event: MouseEvent) => {
  if (!imagesStore.imageUrl || !canvas.value) return;
  const x = event.offsetX;
  const y = event.offsetY;

  // 處理元素拖曳
  if (isDraggingElement.value && imagesStore.selectedElement) {
    canvas.value.style.cursor = "move";
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;
    imagesStore.selectedElement.x = dragStart.elementX + dx;
    imagesStore.selectedElement.y = dragStart.elementY + dy;
    redrawCanvas();
    return;
  }

  // 處理貼圖旋轉
  if (isRotating.value && imagesStore.selectedElement) {
    canvas.value.style.cursor = "grabbing";
    const currentAngle = Math.atan2(y - imagesStore.selectedElement.y, x - imagesStore.selectedElement.x);
    imagesStore.selectedElement.rotation = currentAngle - dragStart.angle;
    redrawCanvas();
    return;
  }

  // 處理貼圖縮放
  if (isResizing.value && imagesStore.selectedElement) {
    // canvas.value.style.cursor = "nesw-resize"; // This could be more specific
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;

    // Project mouse movement onto the vector from center to corner
    const angle = dragStart.elementRotation;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Get the vector for the dragged corner in its un-rotated state
    let cornerVectorX = isResizing.value.includes('r') ? 1 : -1;
    let cornerVectorY = isResizing.value.includes('b') ? 1 : -1;

    // Rotate the corner vector
    const rotatedCornerVectorX = cornerVectorX * cos - cornerVectorY * sin;
    const rotatedCornerVectorY = cornerVectorX * sin + cornerVectorY * cos;

    // Dot product of mouse delta and corner vector to find projected distance
    const projectedDistance = (dx * rotatedCornerVectorX + dy * rotatedCornerVectorY);

    // New size (maintaining aspect ratio)
    const newSize = Math.max(10, dragStart.elementSize + projectedDistance * Math.SQRT2);

    if (imagesStore.selectedElement.type === 'sticker') {
      imagesStore.selectedElement.size = newSize;
    } else if (imagesStore.selectedElement.type === 'text') {
      imagesStore.selectedElement.fontSize = newSize;
    }

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
  const isTransformable = imagesStore.selectedElement?.type === 'sticker' || imagesStore.selectedElement?.type === 'text';
  if (imagesStore.selectedElement && isTransformable) {
    const action = getActionForHandle(x, y, imagesStore.selectedElement);
    if (action === 'del') {
      canvas.value.style.cursor = 'pointer';
      return;
    } else if (action === 'rot') {
      canvas.value.style.cursor = 'grabbing'; // Or a custom rotation cursor
      return;
    } else if (action) {
      // Set cursor based on corner
      // const rotation = (imagesStore.selectedElement.rotation || 0) * 180 / Math.PI;
      if (action === 'tl' || action === 'br') canvas.value.style.cursor = 'nwse-resize';
      if (action === 'tr' || action === 'bl') canvas.value.style.cursor = 'nesw-resize';
      // Note: Rotating the cursor itself is complex, this is a good approximation.
      return;
    }
  }

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
  if (!imagesStore.imageUrl) return;
  const clickedElement = findElementAtPosition(event.offsetX, event.offsetY);

  // 只有文字元素可以雙擊編輯
  if (clickedElement && clickedElement.type === 'text') {
    imagesStore.setSelectedElement(null);
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
  isResizing.value = null;
  isRotating.value = false;
  if (canvas.value) {
    // 恢復指標樣式，讓mousemove事件下次可以重新判斷
    canvas.value.style.cursor = "default";
  }
};

// --- 文字編輯方法 ---
const finishEditing = () => {
  if (isComposing.value) return;
  if (!editingElement.value) return;
  // 如果編輯後文字為空，則移除該元素
  if (editingElement.value.content.trim() === '') {
    imagesStore.elements = imagesStore.elements.filter(el => el.id !== editingElement.value!.id);
  }
  editingElement.value = null;
  redrawCanvas();
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
  if (!canvas.value || !imagesStore.imageUrl) {
    ErrorMessage('請先上傳一張圖片！');
    return;
  }

  if (element.type === 'text') {
    imagesStore.elements.push({
      id: Date.now(),
      type: 'text',
      name: element.name || '新文字',
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
      rotation: 0,
      gradientEnabled: element.gradientEnabled,
      gradientStartColor: element.gradientStartColor,
      gradientEndColor: element.gradientEndColor,
      gradientAngle: element.gradientAngle,
    });
    redrawCanvas();
  } else if (element.type === 'icon') {
    imagesStore.elements.push({
      id: Date.now(),
      type: 'icon',
      name: element.name || '新貼圖',
      content: element.content || '',
      x: canvas.value.width / 2,
      y: canvas.value.height / 2,
      size: 50, // 預設圖示大小
      color: 'black',
    });
    redrawCanvas();
  } else if (element.type === 'sticker') {
    const img = new Image();
    img.onload = () => {
      if (!canvas.value) return;
      imagesStore.elements.push({
        id: Date.now(),
        type: 'sticker',
        name: element.name || '新貼圖',
        content: element.payload, // URL
        x: canvas.value.width / 2,
        y: canvas.value.height / 2,
        size: 100, // Default sticker size
        img: img,
        rotation: 0,
        color: '', // Not used, but to satisfy interface
      });
      redrawCanvas();
    };
    img.src = element.payload;
  }
};

const updateSelectedElement = (newProps: Partial<CanvasElement>) => {
  if (!imagesStore.selectedElement) return;

  // Merge the new properties into the selected element
  Object.assign(imagesStore.selectedElement, newProps);
  
  redrawCanvas();
};

// 點擊容器時，觸發隱藏的 file input
const onContainerClick = () => {
  fileInput.value?.click();
};

// 處理透過點擊選擇的檔案
const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const info = await processFile(target.files[0]);
    const index = imagesStore.addImage(info.image);
    console.log('index', index);
    imagesStore.setOriginalImage(index);
    resetCropMarks();
    redrawCanvas(); // 進行初次繪製
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
      @compositionstart="compositionStart"
      @compositionend="compositionEnd"
      @focus="finishEditing"
      @keydown.enter.prevent="finishEditing"
    />
    <!-- 上傳提示變成一個覆蓋層 -->
    <div v-if="!imagesStore.imageUrl" class="upload-prompt-overlay">
      <div class="prompt-content">
        <p>點擊下方按鈕上傳圖片</p>
      </div>
    </div>
  </div>
    <div class="actions-bar">
      <button class="upload-button" @click="onContainerClick">
        上傳圖片
      </button>
      <button v-if="imagesStore.imageUrl" class="save-button" @click="saveImage">
        儲存圖片
      </button>
      <!-- 裁切框控制項 -->
      <div v-if="imagesStore.imageUrl" class="crop-controls">
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
  width: 100%;
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