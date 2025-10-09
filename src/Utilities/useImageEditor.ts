
import { useImagesStore } from "../store/images.ts";

export interface AbsoluteElement {
    id: number;
    type: 'text' | 'icon' | 'sticker';
    name?: string;
    x: number;
    y: number;
    rotation?: number; // 旋轉角度 (radians)
}
export interface StickerElement extends AbsoluteElement {
    width: number;
    height: number;
    img?: HTMLImageElement;
    url?: string;
}
export interface TextElement extends AbsoluteElement {
    content: string;
    color: string;
    // 文字屬性
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: 'normal' | 'bold';
    lineHeight?: number;
    // 陰影屬性
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    // 外框屬性
    strokeColor?: string;
    strokeWidth?: number;
    // 漸層屬性
    gradientEnabled?: boolean;
    gradientStartColor?: string;
    gradientEndColor?: string;
    gradientAngle?: number;
}
export interface SVGElement extends AbsoluteElement {
    content: string;
    color: string;
    size?: number;
}
export interface CanvasElement extends StickerElement, TextElement, SVGElement {
    id: number;
    type: 'text' | 'icon' | 'sticker';
}
/**
 * 把上傳的圖片繪製到底圖
 * @param canvasEl
 * @param ctx
 * @param img
 */
export const drawBackground = (canvasEl: HTMLCanvasElement, ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
    const canvasRatio:number = canvasEl.width / canvasEl.height;
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
}
/**
 * 繪製裁切框
 * @param canvasEl
 * @param ctx
 * @param cropBox
 */
export const drawCropMarks = (canvasEl: HTMLCanvasElement, ctx: CanvasRenderingContext2D, cropBox: { x: number, y: number, width: number, height: number  }) => {
    ctx.save();
    // 使用 "evenodd" 填充規則來建立一個有孔的矩形（遮罩）
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.rect(0, 0, canvasEl.width, canvasEl.height); // 外矩形
    ctx.rect(cropBox.x, cropBox.y, cropBox.width, cropBox.height); // 內矩形 (孔)
    ctx.fill("evenodd"); // XOR
    ctx.restore();

    // 繪製裁切框的邊框
    ctx.strokeStyle = "#409eff";
    ctx.lineWidth = 2;
    ctx.strokeRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height);
}
/**
 * 繪製文字物件
 * @param ctx
 * @param element
 */
export const drawText = (ctx: CanvasRenderingContext2D, element: TextElement) => {
    ctx.save();
    // Translate to the element's center, rotate, and then draw the text
    ctx.translate(element.x, element.y);
    ctx.rotate(element.rotation || 0);

    // Common text styles
    ctx.font = `${element.fontWeight || 'normal'} ${element.fontSize || 32}px ${element.fontFamily || 'Arial'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Apply shadow if properties exist
    ctx.shadowColor = element.shadowColor || 'transparent';
    ctx.shadowBlur = element.shadowBlur || 0;
    ctx.shadowOffsetX = element.shadowOffsetX || 0;
    ctx.shadowOffsetY = element.shadowOffsetY || 0;
    const lines = element.content.split('\n');
    const lineHeight = element.lineHeight || 1.2;
    const fontSize = element.fontSize || 32;
    const totalTextHeight = lines.length * fontSize * lineHeight;

    // Calculate text block's width for gradient calculation
    const textMetrics = lines.map(line => ctx.measureText(line));
    const textWidth = Math.max(...textMetrics.map(m => m.width));

    // Apply gradient or solid color fill
    if (element.gradientEnabled && element.gradientStartColor && element.gradientEndColor) {
        const mathAngleRad = ((element.gradientAngle || 90) - 90) * Math.PI / 180;
        const halfW = textWidth / 2;
        const halfH = totalTextHeight / 2;
        const c = Math.cos(mathAngleRad);
        const s = Math.sin(mathAngleRad);
        const len = Math.abs(halfW * c) + Math.abs(halfH * s);
        const x0 = -len * c;
        const y0 = -len * s;
        const x1 = len * c;
        const y1 = len * s;

        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
        gradient.addColorStop(0, element.gradientStartColor);
        gradient.addColorStop(1, element.gradientEndColor);
        ctx.fillStyle = gradient;
    } else {
        ctx.fillStyle = element.color;
    }

    // Draw relative to the new (0,0) origin
    let currentLineY = -totalTextHeight / 2 + (fontSize * lineHeight) / 2;

    lines.forEach((line) => {
        // Apply stroke if properties exist
        if (element.strokeColor && element.strokeWidth) {
            ctx.strokeStyle = element.strokeColor;
            ctx.lineWidth = element.strokeWidth;
            ctx.strokeText(line, 0, currentLineY);
        }

        // Apply fill (already set to gradient or solid color)
        ctx.fillText(line, 0, currentLineY);

        currentLineY += fontSize * lineHeight;
    });

    ctx.restore();
}
export const drawSVG = (ctx: CanvasRenderingContext2D, element: SVGElement) => {
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
/**
 * 繪製圖示
 * @param ctx
 * @param element
 * @param scale
 */
export const drawSticker = (ctx: CanvasRenderingContext2D, element: StickerElement, scale: number = 1) => {
    if (element.img && element.width && element.height) {
        ctx.save();
        // Translate to the element's center, rotate, and then draw the image
        ctx.translate(element.x * scale, element.y * scale);
        ctx.rotate(element.rotation || 0);
        // Draw the image centered on the new (0,0) origin
        ctx.drawImage(element.img, -element.width * scale / 2, -element.height * scale / 2, element.width * scale, element.height * scale);
        ctx.restore();
    }
}
// --- 元素互動輔助函式 ---
export const getElementBoundingBox = (ctx: CanvasRenderingContext2D, el: CanvasElement) => {
    if (!ctx) return null;
    let width: number = 0;
    let height: number = 0;
    let x: number = 0;
    let y: number = 0;

    if (el.type === 'text') {
        const element: TextElement = el as TextElement;
        ctx.font = `${element.fontWeight || 'normal'} ${element.fontSize}px ${element.fontFamily}`;
        const lines = element.content.split('\n');
        const metrics = lines.map(line => ctx.measureText(line));
        width = Math.max(...metrics.map(m => m.width));
        const lineHeight = element.lineHeight || 1.2;
        height = lines.length * (element.fontSize || 1) * lineHeight;
        x = el.x - width / 2;
        y = el.y - height / 2;

    } else if (el.type === 'sticker') {
        const element: StickerElement = el as StickerElement;
        width = element.width || 1;
        height = element.height || 1;
        x = element.x - width / 2;
        y = element.y - height / 2;
    } else if (el.type === 'icon') {
        const element: SVGElement = el as SVGElement;
        width = element.size || 1;
        height = element.size || 1;
        x = element.x - width / 2;
        y = element.y - height / 2;
    }

    // 因為文字是中心對齊的，所以要從中心點計算左上角座標
    return {
        x,
        y,
        width,
        height,
    };
}
//
export const getTransformHandles = (ctx: CanvasRenderingContext2D, element: TextElement | StickerElement) => {
    const box = getElementBoundingBox(ctx, element as CanvasElement);
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
    // Handles for sides
    const tm_r = rotatePoint(0, -halfH, angle); // Top-middle
    const bm_r = rotatePoint(0, halfH, angle);  // Bottom-middle
    const ml_r = rotatePoint(-halfW, 0, angle); // Middle-left
    const mr_r = rotatePoint(halfW, 0, angle);  // Middle-right
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
            tm: { x: cx + tm_r.x, y: cy + tm_r.y },
            bm: { x: cx + bm_r.x, y: cy + bm_r.y },
            ml: { x: cx + ml_r.x, y: cy + ml_r.y },
            mr: { x: cx + mr_r.x, y: cy + mr_r.y },
            rot: { x: cx + rot_r.x, y: cy + rot_r.y },
            del: { x: cx + del_r.x, y: cy + del_r.y },
        }
    };
};
// 產生編輯用的邊框
export const drawTransformHandles = (ctx: CanvasRenderingContext2D, element: TextElement | StickerElement) => {
    const handles = getTransformHandles(ctx, element);
    if (!handles) return null;

    ctx.strokeStyle = '#409eff';
    ctx.lineWidth = 1;

    // Draw bounding box
    ctx.stroke(handles.path);
    const imagesStore = useImagesStore();

    // Draw handles
    Object.entries(handles.points).forEach(([key, p]) => {
        if (!p) return;
 
        const sideHandles = ['tm', 'bm', 'ml', 'mr'];
        ctx.save();
        // 將原點移動到控制點中心以便繪製和旋轉
        ctx.translate(p.x, p.y);
 
        if (key === 'del') {
            // 繪製刪除按鈕
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, 2 * Math.PI);
            ctx.fillStyle = '#f56c6c'; // Element Plus danger color
            ctx.fill();
 
            // 繪製 'X' (使用預載入的 SVG 圖示)
            const iconSize = 8; // 圖示在按鈕中的大小
            if (imagesStore.deleteIcon.complete) { // 確保圖片已載入完成
                ctx.drawImage(imagesStore.deleteIcon, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
            }
        } else if (sideHandles.includes(key)) {
            // 繪製長方形的側邊控制點
            const rectWidth = 12;
            const rectHeight = 6;
            ctx.rotate(element.rotation || 0); // 與元素一同旋轉
 
            ctx.beginPath();
            // 根據是水平還是垂直控制點來決定長方形方向
            if (key === 'tm' || key === 'bm') {
                ctx.rect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight);
            } else { // 'ml' or 'mr'
                ctx.rect(-rectHeight / 2, -rectWidth / 2, rectHeight, rectWidth);
            }
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            ctx.strokeStyle = '#409eff';
            ctx.lineWidth = 1;
            ctx.stroke();
        } else {
            // 繪製圓形的角落和旋轉控制點
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, 2 * Math.PI);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            ctx.strokeStyle = '#409eff';
            ctx.lineWidth = 1;
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
 */
export const drawControls = (ctx: CanvasRenderingContext2D, element: AbsoluteElement, box: { x: number, y: number, width: number, height: number } | null) => {
    if (box) { // Draw a simple dashed box for non-sticker elements
        ctx.strokeStyle = '#409eff';
        ctx.lineWidth = 2;
        const isTransformable = element.type === 'sticker' || element.type === 'text';
        if (isTransformable) {
            drawTransformHandles(ctx, element as TextElement | StickerElement);
        } else { // Draw simple dashed box for other types like 'icon'
            ctx.setLineDash([6, 3]);
            ctx.strokeRect(box.x - 5, box.y - 5, box.width + 10, box.height + 10);
            ctx.setLineDash([]);
        }
    }
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
): { width: number; height: number, scale: number } => {
    const widthRatio = maxWidth / originalWidth;
    const heightRatio = maxHeight / originalHeight;

    // 取較小的縮放比例，以確保寬和高都不會超過限制
    const scale = Math.floor((Math.min(widthRatio, heightRatio) * 10000)) / 10000;

    // 如果原始尺寸已經在限制內，則不需要縮放，直接回傳原始尺寸
    if (scale >= 1) {
        return {width: originalWidth, height: originalHeight, scale};
    }

    // 使用較小的比例計算新的寬高
    const newWidth = Math.round(originalWidth * scale);
    const newHeight = Math.round(originalHeight * scale);

    return {width: newWidth, height: newHeight, scale};
}