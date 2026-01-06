import { useEditorStore } from "../store/editorStore.ts";
import { gradientStartAndEndPoints } from "./GradientLayer.ts";
import {
  type ICanvasElement,
  type ITextConfig,
  type IImageConfig,
  type ISVGConfig,
  ElementTypesEnum,
  type ITextSegment
} from "../types.ts";
import stageTheme from "@/styles/stageTheme.ts";
import { advancedDefaults } from "@/config/settings.ts";

// 初始化鎖定圖示 (lock.png)
const lockIcon = new Image();
const lockIconSVG = `
<svg width="24" height="24" viewBox="0 0 0.72 0.72" xmlns="http://www.w3.org/2000/svg">
    <path fill="white" d="M.51.27V.21a.15.15 0 0 0-.3 0v.06a.09.09 0 0 0-.09.09v.21a.09.09 0 0 0 .09.09h.3A.09.09 0 0 0 .6.57V.36A.09.09 0 0 0 .51.27M.27.21a.09.09 0 0 1 .18 0v.06H.27Zm.27.36A.03.03 0 0 1 .51.6h-.3A.03.03 0 0 1 .18.57V.36A.03.03 0 0 1 .21.33h.3a.03.03 0 0 1 .03.03Z"/></svg>`;
lockIcon.src = `data:image/svg+xml;base64,${btoa(lockIconSVG)}`;

/**
 * 把上傳的圖片繪製到底圖
 * @param canvasEl
 * @param ctx
 * @param img
 */
export const drawBackground = (
  canvasEl: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement
) => {
  const canvasRatio: number = canvasEl.width / canvasEl.height;
  const imgRatio = img.width / img.height;
  let drawWidth: number;
  let drawHeight: number;
  let x: number;
  let y: number;
  // 檢查比例
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
  // ctx.drawImage.apply(ctx, arguments)
};
/**
 * 繪製裁切框
 * @param canvasEl
 * @param ctx
 * @param cropBox
 */
export const drawCropMarks = (
  canvasEl: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  cropBox: { x: number; y: number; width: number; height: number }
) => {
  ctx.save();
  // 使用 "evenodd" 填充規則來建立一個有孔的矩形（遮罩）
  ctx.fillStyle = "#EEEEEE"; //"rgba(0, 0, 0, 0.5)";
  ctx.beginPath();
  ctx.rect(0, 0, canvasEl.width, canvasEl.height); // 外矩形
  ctx.rect(cropBox.x, cropBox.y, cropBox.width, cropBox.height); // 內矩形 (孔)
  ctx.fill("evenodd"); // XOR
  ctx.restore();

  // 繪製裁切框的邊框
  ctx.strokeStyle = stageTheme.dropBoxColor;
  ctx.lineWidth = stageTheme.dropBoxBorderWidth;
  ctx.strokeRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height);
};
/**
 * 繪製文字物件
 * @param ctx
 * @param element
 */
export const drawText = (ctx: CanvasRenderingContext2D, element: ICanvasElement) => {
  if (!element) return;
  const config: ITextConfig = element.config as ITextConfig;

  ctx.save();
  // Translate to the element's center, rotate, and then draw the text
  ctx.translate(config.x, config.y);
  ctx.rotate(config.rotation || 0);
  // Common text styles
  ctx.font = `${config.fontWeight || "normal"} ${config.fontItalic ? "italic" : ""} ${config.fontSize || 32}px ${config.fontFamily || "Arial"}`;
  ctx.letterSpacing = `${config.letterSpacing || 0}px`;
  ctx.textAlign = config.textAlign || "center";
  ctx.textBaseline = "middle";

  // Apply shadow if properties exist
  ctx.shadowColor = config.shadowColor || "transparent";
  ctx.shadowBlur = config.shadowBlur || 0;
  ctx.shadowOffsetX = config.shadowOffsetX || 0;
  ctx.shadowOffsetY = config.shadowOffsetY || 0;
  const lines = config.content.split("\n");
  const lineHeight = config.lineHeight || 1.2;
  const fontSize = config.fontSize || 32;
  const totalTextHeight = lines.length * fontSize * lineHeight;
  // Calculate text block's width for gradient calculation
  const textMetrics = lines.map((line) => ctx.measureText(line));
  const textWidth = Math.max(...textMetrics.map((m) => m.width));

  const scaleX: number = typeof config.scaleX === "number" ? config.scaleX : 1;
  const scaleY: number = typeof config.scaleY === "number" ? config.scaleY : 1;
  ctx.scale(scaleX, scaleY);
  if (typeof config.opacity === "number") ctx.globalAlpha = config.opacity;

  // 繪圖時候在塞入寬高
  element.config.height = totalTextHeight * 2;
  element.config.width = textWidth * 2;
  config._countLines = lines.length;
  config._lineSpacing = fontSize * lineHeight;

  if (config.segments) return drawMultiText(ctx, element);

  // console.log(`
  // lines: ${config._countLines}
  // lineSpacing: ${config._lineSpacing}
  // totalTextHeight: ${totalTextHeight}
  // lineY: ${-totalTextHeight / 2 + (fontSize * lineHeight) / 2}`);
  // Apply gradient or solid color fill
  if (config.gradientEnabled && config.gradientStartColor && config.gradientEndColor) {
    let gradient: CanvasGradient;

    if (config.gradientType === "radial") {
      const centerX = 0; // 相對於旋轉後的中心點
      const centerY = 0;
      const startRadius = 0;
      const endRadius = Math.max(textWidth, totalTextHeight) / 2;
      gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        startRadius,
        centerX,
        centerY,
        endRadius
      );
    } else {
      // 預設為 linear
      // 三角函數角度轉換弧度
      const { startPoint, endPoint } = gradientStartAndEndPoints(
        config.gradientAngle || 0,
        textWidth,
        totalTextHeight
      );
      // 建立漸層
      gradient = ctx.createLinearGradient(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
    }

    // 應用顏色停止點
    if (config.gradientStops && config.gradientStops.length > 0) {
      for (let i = 0; i < config.gradientStops.length; i += 2) {
        const stop = config.gradientStops[i] as number;
        const color = config.gradientStops[i + 1] as string;
        gradient.addColorStop(stop, color);
      }
    } else {
      // 如果沒有 stops，則使用舊的 start/end color 做為備用
      gradient.addColorStop(0, config.gradientStartColor);
      gradient.addColorStop(1, config.gradientEndColor);
    }

    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = config.color;
  }

  // 根據 textAlign 計算繪製的起始 x 座標
  let drawX = 0;
  const textAlign = config.textAlign || "center";
  if (textAlign === "left") {
    drawX = -textWidth / 2;
  } else if (textAlign === "right") {
    drawX = textWidth / 2;
  }

  // Draw relative to the new (0,0) origin
  // To vertically center the entire text block, the center of the first line should be
  // at a position of (-totalBlockHeight / 2) + (singleLineHeight / 2).
  // This formula correctly positions the text block for both single and multiple lines.
  let currentLineY = -totalTextHeight / 2 + (fontSize * lineHeight) / 2;
  lines.forEach((line) => {
    // Apply stroke if properties exist
    if (config.strokeColor && config.strokeWidth) {
      // 注意：strokeText 也需要使用計算好的 x 座標
      ctx.strokeStyle = config.strokeColor;
      ctx.lineWidth = config.strokeWidth;
      ctx.strokeText(line, drawX, currentLineY);
    }

    // Apply fill (already set to gradient or solid color)
    ctx.fillText(line, drawX, currentLineY);

    currentLineY += fontSize * lineHeight;
  });

  ctx.restore();
};

export const drawMultiText = (ctx: CanvasRenderingContext2D, element: ICanvasElement) => {
  const config: ITextConfig = element.config as ITextConfig;
  const fontSize = config.fontSize || 32;
  const lineHeight = config.lineHeight || 1.2;

  // START: Multi-color and line-by-line processing logic
  // 1. Process content into lines of segments
  const contentSegments: ITextSegment[] | null = config.segments || null;
  if (contentSegments) {
    const lines: { segments: { text: string; color: string }[]; width: number }[] = [];
    let currentLine: { segments: { text: string; color: string }[]; width: number } = {
      segments: [],
      width: 0
    };
    contentSegments.forEach((segment) => {
      const segmentColor: string = segment.color || config.color;
      const textParts: string[] = segment.text.split("\n");
      textParts.forEach((part, index) => {
        if (part) {
          const metrics = ctx.measureText(part); // 寬度
          currentLine.segments.push({ text: part, color: segmentColor });
          currentLine.width += metrics.width;
        }
        // 換行
        if (index < textParts.length - 1) {
          lines.push(currentLine);
          currentLine = { segments: [], width: 0 };
        }
      });
    });
    lines.push(currentLine); // 增加最後一行

    const totalTextHeight: number = lines.length * fontSize * lineHeight;

    const textWidth: number = Math.max(...lines.map((line) => line.width));

    // 不支援漸層
    // END: Multi-color and line-by-line processing logic

    let currentLineY: number = -totalTextHeight / 2 + (fontSize * lineHeight) / 2;
    lines.forEach((info) => {
      let currentX: number;
      if (config.textAlign === "left") {
        currentX = -textWidth / 2;
      } else if (config.textAlign === "right") {
        currentX = textWidth / 2 - info.width;
      } else {
        currentX = -info.width / 2;
      }
      // Draw each segment in the line
      info.segments.forEach((segment) => {
        const segmentWidth = ctx.measureText(segment.text).width;
        // START: 選取文字繪製背景顏色
        // ctx.fillStyle = stageTheme.borderColor;
        // ctx.fillRect(currentX, currentLineY - fontSize * lineHeight/2, segmentWidth, fontSize * lineHeight);
        // ENDED: 選取文字繪製背景顏色
        // console.log(
        //   `text: ${segment.text} x: ${currentX} segmentMetrics: ${segmentWidth} max: ${ctx.measureText("新增内文文本").width}`
        // );

        ctx.fillStyle = segment.color;
        if (config.textAlign === "center") {
          ctx.fillText(segment.text, currentX + segmentWidth / 2, currentLineY);
        } else if (config.textAlign === "right") {
          ctx.fillText(segment.text, currentX + segmentWidth, currentLineY);
        } else {
          ctx.fillText(segment.text, currentX, currentLineY);
        }
        currentX += segmentWidth;
      });

      currentLineY += fontSize * lineHeight;
    });

    ctx.restore();
  }
};

export const drawSVG = (ctx: CanvasRenderingContext2D, element: ICanvasElement) => {
  if (!element) return;
  const config: ISVGConfig = element.config as ISVGConfig;
  if (!config.content) return;

  const path = new Path2D(config.content);

  ctx.save();
  // 1. 移動到元素的中心點
  ctx.translate(config.x, config.y);

  // 2. 計算縮放比例
  const scaleX = config.width / config.baseWidth;
  const scaleY = config.height / config.baseHeight;

  const offsetX = config.offsetX || 0;
  const offsetY = config.offsetY || 0;

  ctx.scale(scaleX, scaleY);

  ctx.rotate(config.rotation || 0);

  // 3. 從中心點移動到左上角 (在縮放後的座標系中) ，再減去路徑本身的偏移
  ctx.translate(-config.baseWidth / 2 - offsetX, -config.baseHeight / 2 - offsetY);

  ctx.fillStyle = config.color;
  ctx.fill(path);
  ctx.restore();
};
/**
 * 繪製圖示
 * @param ctx
 * @param element
 * @param forceDrawFullImage - 如果為 true，則強制繪製完整圖片，忽略剪裁設定。用於剪裁模式。
 */
export const drawImage = (
  ctx: CanvasRenderingContext2D,
  element: ICanvasElement,
  forceDrawFullImage: boolean = false
) => {
  if (!element) return;
  const config: IImageConfig = element.config as IImageConfig;
  if (config.img && config.width && config.height) {
    ctx.save();
    // Translate to the element's center, rotate, and then draw the image
    ctx.translate(config.x, config.y);
    ctx.rotate(config.rotation || 0);
    // Draw the image centered on the new (0,0) origin
    if (typeof config.opacity === "number") ctx.globalAlpha = config.opacity;
    const scaleX: number = typeof config.scaleX === "number" ? config.scaleX : 1;
    const scaleY: number = typeof config.scaleY === "number" ? config.scaleY : 1;
    ctx.scale(scaleX, scaleY);

    // 支持圓角
    if (typeof config.radius === "number" || Array.isArray(config.radius)) {
      ctx.beginPath();
      ctx.roundRect(
        -config.width / 2,
        -config.height / 2,
        config.width,
        config.height,
        config.radius
      );
      ctx.clip();
    }

    const cropRect = config.cropConfig?.cropRect;
    // 如果不是強制繪製全圖，且存在剪裁設定，則繪製剪裁後的圖片
    if (!forceDrawFullImage && cropRect) {
      ctx.drawImage(
        config.img,
        cropRect.x, // 來源圖片的 x
        cropRect.y, // 來源圖片的 y
        cropRect.width, // 來源圖片的寬度
        cropRect.height, // 來源圖片的高度
        -config.width / 2, // 畫布上的 x
        -config.height / 2, // 畫布上的 y
        config.width, // 畫布上的寬度
        config.height // 畫布上的高度
      );
    } else {
      // 否則，繪製完整的圖片
      ctx.drawImage(config.img, -config.width / 2, -config.height / 2, config.width, config.height);
    }
    ctx.restore();
  }
};
// --- 元素互動輔助函式 ---
export const getElementBoundingBox = (
  ctx: CanvasRenderingContext2D,
  el: ICanvasElement,
  skipNotDraggable: boolean = true
) => {
  if (!ctx || !el || (!el.config.draggable && skipNotDraggable)) return null;
  let width: number = 0;
  let height: number = 0;
  let x: number = 0;
  let y: number = 0;

  if (el.type === ElementTypesEnum.Text) {
    const config: ITextConfig = el.config as ITextConfig;
    ctx.font = `${config.fontWeight || "normal"} ${config.fontSize}px ${config.fontFamily}`;
    ctx.letterSpacing = `${config.letterSpacing || 0}px`;
    const lines = config.content.split("\n");
    const metrics = lines.map((line) => ctx.measureText(line));
    width = Math.max(...metrics.map((m) => m.width));
    const lineHeight = config.lineHeight || 1.2;
    height = lines.length * (config.fontSize || 1) * lineHeight;
    x = config.x - width / 2;
    y = config.y - height / 2;
  } else if (el.type === ElementTypesEnum.Image) {
    const config: IImageConfig = el.config as IImageConfig;
    width = config.width || 1;
    height = config.height || 1;
    x = config.x - width / 2;
    y = config.y - height / 2;
  } else if (el.type === ElementTypesEnum.SVG) {
    const config: ISVGConfig = el.config as ISVGConfig;
    width = config.width || 1;
    height = config.height || 1;
    x = config.x - width / 2;
    y = config.y - height / 2;
  }

  // 因為文字是中心對齊的，所以要從中心點計算左上角座標
  return {
    x,
    y,
    width,
    height
  };
};
//
export const getTransformHandles = (ctx: CanvasRenderingContext2D, element: ICanvasElement) => {
  if (!element) return null;
  const box = getElementBoundingBox(ctx, element as ICanvasElement);
  if (!box) return null;
  const config = element.config;
  if (!config) return null;
  let { width: w, height: h } = box;
  const cx = config.x;
  const cy = config.y;
  const angle = config.rotation || 0;

  const rotatePoint = (x: number, y: number, angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: x * cos - y * sin,
      y: x * sin + y * cos
    };
  };

  const halfW = w / 2;
  const halfH = h / 2;

  const tl_r = rotatePoint(-halfW, -halfH, angle);
  const tr_r = rotatePoint(halfW, -halfH, angle);
  const bl_r = rotatePoint(-halfW, halfH, angle);
  const br_r = rotatePoint(halfW, halfH, angle);
  // Handles for sides
  const tm_r = rotatePoint(0, -halfH, angle); // Top-middle
  const bm_r = rotatePoint(0, halfH, angle); // Bottom-middle
  const ml_r = rotatePoint(-halfW, 0, angle); // Middle-left
  const mr_r = rotatePoint(halfW, 0, angle); // Middle-right
  const rot_r = rotatePoint(0, -halfH - 20, angle); // Rotation handle 20px above top-middle
  const del_r = rotatePoint(halfW + 20, -halfH - 20, angle); // Delete handle outside top-right

  const path = new Path2D();
  path.moveTo(cx + tl_r.x, cy + tl_r.y);
  path.lineTo(cx + tr_r.x, cy + tr_r.y);
  path.lineTo(cx + br_r.x, cy + br_r.y);
  path.lineTo(cx + bl_r.x, cy + bl_r.y);
  path.closePath();

  let eachSideHandles = {};
  if (advancedDefaults.eachSideHandlesEnabled && element.type === ElementTypesEnum.Image) {
    eachSideHandles = {
      tm: { x: cx + tm_r.x, y: cy + tm_r.y },
      bm: { x: cx + bm_r.x, y: cy + bm_r.y },
      ml: { x: cx + ml_r.x, y: cy + ml_r.y },
      mr: { x: cx + mr_r.x, y: cy + mr_r.y }
    };
  }

  return {
    path,
    points: {
      tl: { x: cx + tl_r.x, y: cy + tl_r.y },
      tr: { x: cx + tr_r.x, y: cy + tr_r.y },
      bl: { x: cx + bl_r.x, y: cy + bl_r.y },
      br: { x: cx + br_r.x, y: cy + br_r.y },
      ...eachSideHandles,
      rot: { x: cx + rot_r.x, y: cy + rot_r.y },
      del: { x: cx + del_r.x, y: cy + del_r.y }
    }
  };
};
// 產生編輯用的邊框
export const drawTransformHandles = (
  ctx: CanvasRenderingContext2D,
  element: ICanvasElement,
  multiple: boolean = false,
  isResizing: string | null = null
) => {
  const handles = getTransformHandles(ctx, element);
  if (!handles) return null;

  ctx.strokeStyle = stageTheme.borderColor;
  ctx.lineWidth = stageTheme.borderStrokeWidth;

  // Draw bounding box
  ctx.stroke(handles.path);
  const editorStore = useEditorStore();

  // Draw handles
  Object.entries(handles.points).forEach(([key, p]) => {
    if (!p) return;

    // 如果正在縮放，則高亮顯示對應的控制點
    const isActiveHandle = isResizing === key;

    const sideHandles = ["tm", "bm", "ml", "mr"];
    ctx.save();
    // 將原點移動到控制點中心以便繪製和旋轉
    ctx.translate(p.x, p.y);

    // 不支援多選編輯
    if (multiple) return ctx.restore();

    if (key === "del") {
      // 繪製 'X' (使用預載入的 SVG 圖示)
      const iconSize: number = 16; // 圖示在按鈕中的大小

      // 繪製刪除按鈕
      ctx.beginPath();
      ctx.arc(0, 0, iconSize - 4, 0, 2 * Math.PI);
      ctx.fillStyle = "#f56c6c"; // Element Plus danger color
      ctx.fill();

      if (editorStore.deleteIcon.complete) {
        // 確保圖片已載入完成
        ctx.drawImage(editorStore.deleteIcon, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
      }
    } else if (sideHandles.includes(key)) {
      // 繪製長方形的側邊控制點
      const rectWidth = 12;
      const rectHeight = 6;
      ctx.rotate(element.config.rotation || 0); // 與元素一同旋轉

      ctx.beginPath();
      // 根據是水平還是垂直控制點來決定長方形方向
      if (key === "tm" || key === "bm") {
        ctx.rect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight);
      } else {
        // 'ml' or 'mr'
        ctx.rect(-rectHeight / 2, -rectWidth / 2, rectHeight, rectWidth);
      }
      ctx.fillStyle = isActiveHandle ? stageTheme.borderColor : stageTheme.anchorColor;
      ctx.fill();
      ctx.strokeStyle = stageTheme.anchorBorderColor;
      ctx.lineWidth = stageTheme.anchorBorderWidth;
      ctx.stroke();
    } else {
      // 繪製圓形的角落和旋轉控制點
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, 2 * Math.PI);
      ctx.fillStyle = isActiveHandle ? stageTheme.borderColor : stageTheme.anchorColor;
      ctx.fill();
      ctx.strokeStyle = stageTheme.anchorBorderColor;
      ctx.lineWidth = stageTheme.anchorBorderWidth;
      ctx.stroke();
    }
    ctx.restore();
  });
};
/**
 * 控制選取框
 * @param ctx
 * @param element
 * @param box
 * @param multiple
 * @param isResizing - 正在縮放的控制點 key ('tl', 'br', etc.)
 */
export const drawControls = (
  ctx: CanvasRenderingContext2D,
  element: ICanvasElement,
  box: { x: number; y: number; width: number; height: number } | null,
  multiple: boolean = false,
  isResizing: string | null = null
) => {
  if (box) {
    // Draw a simple dashed box for non-sticker elements
    ctx.strokeStyle = stageTheme.borderColor;
    ctx.lineWidth = stageTheme.borderStrokeWidth;
    const isTransformable =
      element.type === ElementTypesEnum.Image || element.type === ElementTypesEnum.Text;
    if (isTransformable && element.config.draggable) {
      drawTransformHandles(ctx, element, multiple, isResizing);
    } else {
      // Draw simple dashed box for other types like 'icon'
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      ctx.setLineDash([]);
    }
  }
};
/**
 * 繪製框線滑入時候會用到
 * @param ctx
 * @param element
 * @param box
 */
export const drawViewer = (
  ctx: CanvasRenderingContext2D,
  element: ICanvasElement,
  box: { x: number; y: number; width: number; height: number } | null
) => {
  if (box) {
    ctx.strokeStyle = element.config.draggable ? stageTheme.hoverColor : stageTheme.hoverLockColor;
    ctx.lineWidth = stageTheme.borderStrokeWidth;
    // ctx.setLineDash([6, 3]);
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    ctx.setLineDash([]);

    if (!element.config.draggable && lockIcon.complete && lockIcon.naturalWidth > 0) {
      const iconSize = 24;
      const iconBackgroundSize = iconSize + 4;
      const iconRect = {
        x: box.x,
        y: box.y + (box.height)
      }
      // 背景色
      ctx.beginPath();
      ctx.roundRect(iconRect.x, iconRect.y - iconBackgroundSize, iconBackgroundSize, iconBackgroundSize, [0, 4, 0, 0]);
      ctx.fillStyle = stageTheme.hoverLockColor;
      ctx.fill();
      // 圖示
      ctx.drawImage(lockIcon, iconRect.x + 2, iconRect.y - iconSize - 2, iconSize, iconSize);
    }
  }
};
/**
 * 計算剪裁框在畫布上的顯示資訊 (位置、尺寸、旋轉等)
 * @param element - 要計算的圖片元素
 */
const getCropDisplayInfo = (element: ICanvasElement) => {
  const config = element.config as IImageConfig;
  const cropRect = config.cropConfig?.cropRect;
  if (!config || !cropRect) return null;

  // 獲取元素在畫布上的實際邊界
  const elementWidth = config.width || 0;
  const elementHeight = config.height || 0;

  // 將相對於原始圖片的 cropRect 轉換為相對於畫布上顯示的元素尺寸
  const originalImgWidth = config.img?.naturalWidth || elementWidth;
  const originalImgHeight = config.img?.naturalHeight || elementHeight;

  const scaleX = elementWidth / originalImgWidth;
  const scaleY = elementHeight / originalImgHeight;

  // 剪裁框在元素本地座標系中的位置和大小 (中心點為 0,0)
  const displayCropX = cropRect.x * scaleX - elementWidth / 2;
  const displayCropY = cropRect.y * scaleY - elementHeight / 2;
  const displayCropWidth = cropRect.width * scaleX;
  const displayCropHeight = cropRect.height * scaleY;

  return {
    displayCropX,
    displayCropY,
    displayCropWidth,
    displayCropHeight,
    elementWidth,
    elementHeight,
    centerX: config.x,
    centerY: config.y,
    angle: config.rotation || 0
  };
};
/**
 * 獲取剪裁框的控制點
 */
export const getCropHandles = (_: CanvasRenderingContext2D, element: ICanvasElement) => {
  const config = element.config as IImageConfig;
  const cropRect = config.cropConfig?.cropRect;
  if (!config || !cropRect) return null;

  const displayInfo = getCropDisplayInfo(element);
  if (!displayInfo) return null;
  const {
    displayCropX,
    displayCropY,
    displayCropWidth,
    displayCropHeight,
    centerX,
    centerY,
    angle
  } = displayInfo;

  const rotatePoint = (x: number, y: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: centerX + (x * cos - y * sin),
      y: centerY + (x * sin + y * cos)
    };
  };

  const halfW = displayCropWidth / 2;
  const halfH = displayCropHeight / 2;
  const cropCenterX = displayCropX + halfW;
  const cropCenterY = displayCropY + halfH;

  return {
    box: { x: displayCropX, y: displayCropY, width: displayCropWidth, height: displayCropHeight },
    points: {
      tl: rotatePoint(cropCenterX - halfW, cropCenterY - halfH),
      tr: rotatePoint(cropCenterX + halfW, cropCenterY - halfH),
      bl: rotatePoint(cropCenterX - halfW, cropCenterY + halfH),
      br: rotatePoint(cropCenterX + halfW, cropCenterY + halfH),
      tm: rotatePoint(cropCenterX, cropCenterY - halfH),
      bm: rotatePoint(cropCenterX, cropCenterY + halfH),
      ml: rotatePoint(cropCenterX - halfW, cropCenterY),
      mr: rotatePoint(cropCenterX + halfW, cropCenterY)
    }
  };
};

export const getActionForCropHandle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  element: ICanvasElement
) => {
  const handles = getCropHandles(ctx, element);
  if (!handles) return null;

  const handleRadius = 10; // 點擊區域半徑
  for (const [key, p] of Object.entries(handles.points)) {
    if (Math.hypot(p.x - x, p.y - y) < handleRadius) {
      return key; // 'tl', 'tr', 'tm', etc.
    }
  }
  // 檢查是否點擊在剪裁框內部 (用於拖曳)
  // 這裡需要一個點擊測試，考慮到旋轉，最簡單的方式是將點擊座標轉換到元素本地座標系
  // 暫時簡化為檢查未旋轉的邊界框
  return null;
};

/**
 * 繪製圖片剪裁的控制項和遮罩
 * @param ctx
 * @param element
 */
export const drawCropControls = (ctx: CanvasRenderingContext2D, element: ICanvasElement) => {
  const displayInfo = getCropDisplayInfo(element);
  if (!displayInfo) return null;
  const {
    displayCropX,
    displayCropY,
    displayCropWidth,
    displayCropHeight,
    centerX,
    centerY,
    angle,
    elementWidth,
    elementHeight
  } = displayInfo;
  const config = element.config;

  ctx.save();
  // 變換到元素中心並旋轉，確保遮罩和控制項與圖片對齊
  ctx.translate(centerX, centerY);
  ctx.rotate(angle);

  // 1. 繪製半透明遮罩
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.beginPath();
  // 繪製一個覆蓋整個元素的大矩形
  ctx.rect(-elementWidth / 2, -elementHeight / 2, elementWidth, elementHeight);
  // 在大矩形中挖出剪裁框區域 (使用 evenodd 規則)
  ctx.rect(displayCropX, displayCropY, displayCropWidth, displayCropHeight);
  ctx.fill("evenodd");

  // 2. 繪製剪裁框的白色邊框
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 1;
  ctx.strokeRect(displayCropX, displayCropY, displayCropWidth, displayCropHeight);

  // 3. 繪製輔助線 (九宮格)
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  // 垂直線
  ctx.moveTo(displayCropX + displayCropWidth / 3, displayCropY);
  ctx.lineTo(displayCropX + displayCropWidth / 3, displayCropY + displayCropHeight);
  ctx.moveTo(displayCropX + (displayCropWidth / 3) * 2, displayCropY);
  ctx.lineTo(displayCropX + (displayCropWidth / 3) * 2, displayCropY + displayCropHeight);
  // 水平線
  ctx.moveTo(displayCropX, displayCropY + displayCropHeight / 3);
  ctx.lineTo(displayCropX + displayCropWidth, displayCropY + displayCropHeight / 3);
  ctx.moveTo(displayCropX, displayCropY + (displayCropHeight / 3) * 2);
  ctx.lineTo(displayCropX + displayCropWidth, displayCropY + (displayCropHeight / 3) * 2);
  ctx.stroke();

  // 4. 繪製角落和邊緣的控制點 (可選，為後續拖曳做準備)
  const handles = getCropHandles(ctx, element);
  if (handles) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    Object.values(handles.points).forEach((p) => {
      // 繪製控制點時，需要從世界座標轉換回元素的本地座標
      const localX = p.x - config.x;
      const localY = p.y - config.y;
      const invAngle = -angle;
      const rotatedX = localX * Math.cos(invAngle) - localY * Math.sin(invAngle);
      const rotatedY = localX * Math.sin(invAngle) + localY * Math.cos(invAngle);

      ctx.beginPath();
      ctx.arc(rotatedX, rotatedY, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  }
  ctx.restore();
};

/**
 * 計算在給定最大寬高限制下的新尺寸，並保持原始長寬比。
 * @param originalWidth - 原始寬度
 * @param originalHeight - 原始高度
 * @param maxWidth - 最大寬度限制 (例如 800)
 * @param maxHeight - 最大高度限制 (例如 600)
 * @returns {{width: number, height: number}} - 按比例縮放後的新尺寸
 */
export const calculateConstrainedSize = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): {
  width: number;
  height: number;
  scale: number;
  originalWidth: number;
  originalHeight: number;
  color: string;
} => {
  const widthRatio = maxWidth / originalWidth;
  const heightRatio = maxHeight / originalHeight;

  // 取較小的縮放比例，以確保寬和高都不會超過限制
  const scale = Math.floor(Math.min(widthRatio, heightRatio) * 10000) / 10000;

  // 如果原始尺寸已經在限制內，則不需要縮放，直接回傳原始尺寸
  if (scale >= 1) {
    return {
      width: originalWidth,
      height: originalHeight,
      scale: 1,
      originalWidth,
      originalHeight,
      color: "transparent"
    };
  }

  // 使用較小的比例計算新的寬高
  const newWidth = Math.round(originalWidth * scale);
  const newHeight = Math.round(originalHeight * scale);

  return {
    width: newWidth,
    height: newHeight,
    scale,
    originalWidth,
    originalHeight,
    color: "transparent"
  };
};
