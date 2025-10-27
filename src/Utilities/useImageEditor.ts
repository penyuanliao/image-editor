
import { useImagesStore } from "../store/images.ts";
import {gradientStartAndEndPoints} from "./GradientLayer.ts";
import {
    type ICanvasElement,
    type ITextConfig,
    type IImageConfig,
    type ISVGConfig,
    ElementTypesEnum
} from "../types.ts";

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
export const drawText = (ctx: CanvasRenderingContext2D, element: ICanvasElement) => {
    if (!element) return;
    const config: ITextConfig = element.config as ITextConfig;

    ctx.save();
    // Translate to the element's center, rotate, and then draw the text
    ctx.translate(config.x, config.y);
    ctx.rotate(config.rotation || 0);

    // Common text styles
    ctx.font = `${config.fontWeight || 'normal'} ${config.fontSize || 32}px ${config.fontFamily || 'Arial'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Apply shadow if properties exist
    ctx.shadowColor = config.shadowColor || 'transparent';
    ctx.shadowBlur = config.shadowBlur || 0;
    ctx.shadowOffsetX = config.shadowOffsetX || 0;
    ctx.shadowOffsetY = config.shadowOffsetY || 0;
    const lines = config.content.split('\n');
    const lineHeight = config.lineHeight || 1.2;
    const fontSize = config.fontSize || 32;
    const totalTextHeight = lines.length * fontSize * lineHeight;

    // Calculate text block's width for gradient calculation
    const textMetrics = lines.map(line => ctx.measureText(line));
    const textWidth = Math.max(...textMetrics.map(m => m.width));

    // Apply gradient or solid color fill
    if (config.gradientEnabled && config.gradientStartColor && config.gradientEndColor) {
        let gradient: CanvasGradient;

        if (config.gradientType === 'radial') {
            const centerX = 0; // 相對於旋轉後的中心點
            const centerY = 0;
            const startRadius = 0;
            const endRadius = Math.max(textWidth, totalTextHeight) / 2;
            gradient = ctx.createRadialGradient(centerX, centerY, startRadius, centerX, centerY, endRadius);
        } else { // 預設為 linear
            // 三角函數角度轉換弧度
            const { startPoint, endPoint } = gradientStartAndEndPoints(config.gradientAngle || 0, textWidth, totalTextHeight);
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

    // Draw relative to the new (0,0) origin
    let currentLineY = -totalTextHeight / 2 + (fontSize * lineHeight) / 2;

    lines.forEach((line) => {
        // Apply stroke if properties exist
        if (config.strokeColor && config.strokeWidth) {
            ctx.strokeStyle = config.strokeColor;
            ctx.lineWidth = config.strokeWidth;
            ctx.strokeText(line, 0, currentLineY);
        }

        // Apply fill (already set to gradient or solid color)
        ctx.fillText(line, 0, currentLineY);

        currentLineY += fontSize * lineHeight;
    });

    ctx.restore();
}
export const drawSVG = (ctx: CanvasRenderingContext2D, element: ICanvasElement) => {
    if (!element) return;
    const config: ISVGConfig = element.config as ISVGConfig;

    const path = new Path2D(config.content);
    ctx.fillStyle = config.color;

    ctx.save();
    ctx.translate(config.x, config.y);
    ctx.translate(0, 0);
    ctx.fill(path);
    ctx.restore();
}
/**
 * 繪製圖示
 * @param ctx
 * @param element
 */
export const drawSticker = (ctx: CanvasRenderingContext2D, element: ICanvasElement) => {
    if (!element) return;
    const config: IImageConfig = element.config as IImageConfig;

    if (config.img && config.width && config.height) {
        ctx.save();
        // Translate to the element's center, rotate, and then draw the image
        ctx.translate(config.x, config.y);
        ctx.rotate(config.rotation || 0);
        // Draw the image centered on the new (0,0) origin
        ctx.drawImage(config.img, -config.width / 2, -config.height / 2, config.width, config.height);
        ctx.restore();
    }
}
// --- 元素互動輔助函式 ---
export const getElementBoundingBox = (ctx: CanvasRenderingContext2D, el: ICanvasElement) => {
    if (!ctx || !el) return null;
    let width: number = 0;
    let height: number = 0;
    let x: number = 0;
    let y: number = 0;

    if (el.type === ElementTypesEnum.Text) {
        const config: ITextConfig = el.config as ITextConfig;
        ctx.font = `${config.fontWeight || 'normal'} ${config.fontSize}px ${config.fontFamily}`;
        const lines = config.content.split('\n');
        const metrics = lines.map(line => ctx.measureText(line));
        width = Math.max(...metrics.map(m => m.width));
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
        height,
    };
}
//
export const getTransformHandles = (ctx: CanvasRenderingContext2D, element: ICanvasElement) => {
    if (!element) return null;
    const box = getElementBoundingBox(ctx, element as ICanvasElement);
    if (!box) return null;
    const config = element.config;
    if (!config) return null;
    const { width: w, height: h } = box;
    const cx = config.x;
    const cy = config.y;
    const angle = config.rotation || 0;

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
export const drawTransformHandles = (ctx: CanvasRenderingContext2D, element: ICanvasElement, multiple: boolean = false) => {
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

        // 不支援多選編輯
        if (multiple) return ctx.restore();

        if (key === 'del') {
            // 繪製 'X' (使用預載入的 SVG 圖示)
            const iconSize:number = 16; // 圖示在按鈕中的大小

            // 繪製刪除按鈕
            ctx.beginPath();
            ctx.arc(0, 0, iconSize - 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#f56c6c'; // Element Plus danger color
            ctx.fill();

            if (imagesStore.deleteIcon.complete) { // 確保圖片已載入完成
                ctx.drawImage(imagesStore.deleteIcon, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
            }
        } else if (sideHandles.includes(key)) {
            // 繪製長方形的側邊控制點
            const rectWidth = 12;
            const rectHeight = 6;
            ctx.rotate(element.config.rotation || 0); // 與元素一同旋轉
 
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
 * @param multiple
 */
export const drawControls = (ctx: CanvasRenderingContext2D,
                             element: ICanvasElement,
                             box: { x: number, y: number, width: number, height: number } | null,
                             multiple: boolean = false
) => {
    if (box) { // Draw a simple dashed box for non-sticker elements
        ctx.strokeStyle = '#409eff';
        ctx.lineWidth = 2;
        const isTransformable = element.type === ElementTypesEnum.Image || element.type === ElementTypesEnum.Text;
        if (isTransformable) {
            drawTransformHandles(ctx, element, multiple);
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
): { width: number; height: number, scale: number, originalWidth: number, originalHeight: number } => {
    const widthRatio = maxWidth / originalWidth;
    const heightRatio = maxHeight / originalHeight;

    // 取較小的縮放比例，以確保寬和高都不會超過限制
    const scale = Math.floor((Math.min(widthRatio, heightRatio) * 10000)) / 10000;

    // 如果原始尺寸已經在限制內，則不需要縮放，直接回傳原始尺寸
    if (scale >= 1) {
        return { width: originalWidth, height: originalHeight, scale: 1, originalWidth, originalHeight };
    }

    // 使用較小的比例計算新的寬高
    const newWidth = Math.round(originalWidth * scale);
    const newHeight = Math.round(originalHeight * scale);

    return {width: newWidth, height: newHeight, scale, originalWidth, originalHeight};
}
