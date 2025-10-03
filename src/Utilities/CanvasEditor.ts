import {
    type CanvasElement,
    drawSVG, getTransformHandles,
    type StickerElement,
    type SVGElement,
    type TextElement
} from './useImageEditor.ts';
import {
    drawBackground,
    drawControls,
    drawCropMarks,
    drawSticker,
    drawText,
    getElementBoundingBox
} from './useImageEditor.ts';
import {ErrorMessage} from "./AlertMessage.ts";
import {createCanvasElement} from "./useCreateCanvasElement.ts";
import {useImagesStore} from "../store/images.ts";
import {nextTick} from "vue";

interface IDragStart {
    x: number,
    y: number,
    boxX: number,
    boxY: number,
    elementX: number,
    elementY: number,
    elementWidth: number,
    elementHeight: number,
    aspectRatio: number,
    elementRotation: number,
    angle: number,
    elementSize: number, // for text and icons
};

// 這個類別將取代大部分 useImageEditor.ts 和 ImageUploader.vue 中的邏輯
export class CanvasEditor {
    protected canvas?: HTMLCanvasElement;
    protected ctx?: CanvasRenderingContext2D;
    public editingElement?: CanvasElement | null = null;
    // 點擊兩下編輯的輸入框
    public textInput: HTMLInputElement | null = null;
    // 狀態屬性
    public cropBox: { x: number, y: number, width: number, height: number };

    public dragStart:IDragStart = {
        x: 0,
        y: 0,
        boxX: 0,
        boxY: 0,
        elementX: 0,
        elementY: 0,
        elementWidth: 0,
        elementHeight: 0,
        aspectRatio: 1,
        elementRotation: 0,
        angle: 0,
        elementSize: 0, // for text and icons
    };
    public textInputStyle: any = {
        top: '0px',
        left: '0px',
        width: '0px',
        height: '0px',
        fontSize: '32px',
        fontFamily: 'Arial',
    };

    // 拖曳裁切框相關的狀態
    public isDraggingCropBox: boolean = false;
    public isDraggingElement: boolean = false;
    public isResizing: string|null = null;
    public isRotating: boolean = false;


    constructor() {
        // 初始化裁切框
        this.cropBox = {
            x: 0,
            y: 0,
            width: 800,
            height: 400,
        }
    }

    private setupEventListeners() {
        this.canvas?.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas?.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas?.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        this.canvas?.addEventListener('mouseup', this.handleMouseUpOrLeave.bind(this));
        this.canvas?.addEventListener('mouseleave', this.handleMouseUpOrLeave.bind(this));
    }

    public setup(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context:CanvasRenderingContext2D | null = canvas.getContext('2d');
        if (!context) {
            throw new Error('Failed to get 2D context');
        }
        this.ctx = context;
        this.setupEventListeners();
    }
    // --- 公開方法 (API) ---
    public resetCropMarks() {
        const { canvas, cropBox } = this;
        console.log('resetCropMarks');
        // 將裁切框重設到畫布中心
        if (canvas) {
            cropBox.x = (canvas.width - cropBox.width) / 2;
            cropBox.y = (canvas.height - cropBox.height) / 2;
        }
    }

    public setImage(image: HTMLImageElement) {
        const imagesStore = useImagesStore();
        const index:number = imagesStore.addImage(image);
        imagesStore.setOriginalImage(index);
        this.render();
    }

    public async addElement(element: any) {
        const imagesStore = useImagesStore();
        if (!this.canvas || !imagesStore.originalImage) {
            ErrorMessage('請先上傳一張圖片！');
            return;
        }
        const el = await createCanvasElement(element, this.canvas);
        if (el) {
            imagesStore.elements.push(el);
            this.render();
        }
    };
    // --- 統一的約束與重繪邏輯 ---
    public constrainCropBox() {
        if (!this.canvas) return false;
        const { canvas, cropBox } = this;
        const original = { ...this.cropBox };
        const minSize = 10;
        // 使用 Math.round 避免拖曳時產生小數
        let w = Math.round(Math.max(minSize, cropBox.width));
        let h = Math.round(Math.max(minSize, cropBox.height));

        // 確保尺寸不超過畫布
        w = Math.min(w, canvas.width);
        h = Math.min(h, canvas.height);

        // 確保位置在邊界內
        let x = Math.round(Math.max(0, Math.min(cropBox.x, canvas.width - w)));
        let y = Math.round(Math.max(0, Math.min(cropBox.y, canvas.height - h)));

        // 應用約束後的值
        this.cropBox.width = w;
        this.cropBox.height = h;
        this.cropBox.x = x;
        this.cropBox.y = y;

        // 回傳是否有值被更改
        return original.x !== x || original.y !== y || original.width !== w || original.height !== h;
    }
    // 重新繪製整個畫布（背景、圖片、裁切框）
    public render() {
        if (!this.ctx || !this.canvas) return;

        const { ctx, canvas, cropBox } = this;
        const imagesStore = useImagesStore();

        // 1. 清除畫布並填上白色背景
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. 繪製背景圖
        if (imagesStore.originalImage) {
            drawBackground(this.canvas, this.ctx, imagesStore.originalImage);
        }

        // 3. 繪製裁切框
        drawCropMarks(canvas, ctx, cropBox);

        // 4. 繪製所有元素 (這就是多型的應用)
        imagesStore.elements.forEach(element => {

            // 如果元素正在被編輯，則不在 canvas 上繪製它，由 input 框取代
            if (this.editingElement?.id === element.id) return;

            if (element.type === 'text') {
                drawText(ctx, element as TextElement);
            } else if (element.type === 'icon') {
                drawSVG(ctx, element as SVGElement);
            } else if (element.type === 'sticker') {
                drawSticker(ctx, element as StickerElement);
            }
        });

        // 5. 繪製控制項
        if (imagesStore.selectedElement && !this.editingElement) {
            const box = getElementBoundingBox(ctx, imagesStore.selectedElement);
            drawControls(ctx, imagesStore.selectedElement, box);
        }
    }
    // 檢查是否在元素上面
    public isPointInBox(px: number, py: number, box: {x: number, y: number, width: number, height: number}) {
        return px >= box.x &&
            px <= box.x + box.width &&
            py >= box.y &&
            py <= box.y + box.height;
    }
    // --- 裁切框拖曳事件處理 ---
    public isPointInCropBox(x: number, y: number) {
        return (
            x >= this.cropBox.x &&
            x <= this.cropBox.x + this.cropBox.width &&
            y >= this.cropBox.y &&
            y <= this.cropBox.y + this.cropBox.height
        );
    }
    public findElementAtPosition(x: number, y: number) {
        const imagesStore = useImagesStore();
        const ctx = this.ctx;
        if (!ctx) return null;

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

                const box = getElementBoundingBox(ctx, el);
                if (!box) return false;
                return Math.abs(localX) < box.width / 2 && Math.abs(localY) < box.height / 2;
            } else {
                // For other elements, use the axis-aligned bounding box
                const box = getElementBoundingBox(ctx, el);
                return box && this.isPointInBox(x, y, box);
            }
        });
    }
    public getActionForHandle(x: number, y: number, element: CanvasElement) {
        const ctx = this.ctx;
        if (!ctx) return null;
        const handles = getTransformHandles(ctx, element);
        if (!handles) return null;
        const handleRadius = 8; // Larger click area for handles
        for (const [key, p] of Object.entries(handles.points)) {
            if (Math.hypot(p.x - x, p.y - y) < handleRadius) {
                return key; // 'tl', 'tr', 'bl', 'br', 'rot', 'del'
            }
        }
        return null;
    }

    // --- 事件處理方法 ---
    private handleMouseDown(event: MouseEvent) {
        if (!this.canvas) return;
        const x = event.offsetX;
        const y = event.offsetY;
        const imagesStore = useImagesStore();
        // Check for sticker handle interaction first
        const isTransformable = imagesStore.selectedElement?.type === 'sticker' || imagesStore.selectedElement?.type === 'text';
        if (imagesStore.selectedElement && isTransformable) {
            const action = this.getActionForHandle(x, y, imagesStore.selectedElement);
            if (action) {
                if (action === 'del') {
                    // 執行刪除操作
                    imagesStore.elements = imagesStore.elements.filter(el => el.id !== imagesStore.selectedElement!.id);
                    imagesStore.selectedElement = null; // 清除選取
                    this.render();
                    return;
                }
                this.handleTransformStart(x, y, action, imagesStore.selectedElement);
                return;
            }
        }

        const clickedElement = this.findElementAtPosition(x, y);

        // Handle element selection
        imagesStore.selectedElement = clickedElement || null;

        if (clickedElement) {
            this.isDraggingElement = true;
            this.dragStart.x = x;
            this.dragStart.y = y;
            this.dragStart.elementX = clickedElement.x;
            this.dragStart.elementY = clickedElement.y;
        } else if (this.isPointInCropBox(x, y)) {
            this.isDraggingCropBox = true;
            this.dragStart.x = event.offsetX;
            this.dragStart.y = event.offsetY;
            this.dragStart.boxX = this.cropBox.x;
            this.dragStart.boxY = this.cropBox.y;
        }

        this.render();
    }
    private handleTransformStart(x: number, y: number, action: string, element: CanvasElement) {
        this.dragStart.x = x;
        this.dragStart.y = y;
        this.dragStart.elementX = element.x;
        this.dragStart.elementY = element.y;
        // For text, we scale fontSize. For stickers, we scale size.
        this.dragStart.elementRotation = element.rotation || 0;

        if (element.type === 'sticker') {
            const sticker = element as StickerElement;
            this.dragStart.elementWidth = sticker.width;
            this.dragStart.elementHeight = sticker.height;
            this.dragStart.aspectRatio = sticker.width && sticker.height ? sticker.width / sticker.height : 1;
        } else if (element.type === 'text') {
            const text = element as TextElement;
            this.dragStart.elementSize = text.fontSize || 32;
        } else if (element.type === 'icon') {
            const icon = element as SVGElement;
            this.dragStart.elementSize = icon.size || 50;
        }

        if (action === 'rot') {
            this.isRotating = true;
            // Calculate initial angle between center and mouse
            this.dragStart.angle = Math.atan2(y - element.y, x - element.x) - this.dragStart.elementRotation;
        } else {
            this.isResizing = action; // 'tl', 'tr', 'bl', 'br'
        }
        this.render();
    }
    private handleMouseMove(event: MouseEvent) {
        const imagesStore = useImagesStore();
        if (!this.canvas || !imagesStore.imageUrl) return;
        const x = event.offsetX;
        const y = event.offsetY;

        // 處理元素拖曳
        if (this.isDraggingElement && imagesStore.selectedElement) {
            this.canvas.style.cursor = "move";
            const dx = x - this.dragStart.x;
            const dy = y - this.dragStart.y;
            imagesStore.selectedElement.x = this.dragStart.elementX + dx;
            imagesStore.selectedElement.y = this.dragStart.elementY + dy;
            this.render();
            return;
        }
        // 處理貼圖旋轉
        if (this.isRotating && imagesStore.selectedElement) {
            this.canvas.style.cursor = "grabbing";
            const currentAngle = Math.atan2(y - imagesStore.selectedElement.y, x - imagesStore.selectedElement.x);
            imagesStore.selectedElement.rotation = currentAngle - this.dragStart.angle;
            this.render();
            return;
        }
        // 處理貼圖縮放
        if (this.isResizing && imagesStore.selectedElement) {
            // canvas.value.style.cursor = "nesw-resize"; // This could be more specific
            const dx = x - this.dragStart.x;
            const dy = y - this.dragStart.y;

            // Project mouse movement onto the vector from center to corner
            const angle = this.dragStart.elementRotation;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            // Get the vector for the dragged corner in its un-rotated state
            let cornerVectorX = this.isResizing.includes('r') ? 1 : -1;
            let cornerVectorY = this.isResizing.includes('b') ? 1 : -1;

            // Rotate the corner vector
            const rotatedCornerVectorX = cornerVectorX * cos - cornerVectorY * sin;
            const rotatedCornerVectorY = cornerVectorX * sin + cornerVectorY * cos;

            // Dot product of mouse delta and corner vector to find projected distance
            const projectedDistance = (dx * rotatedCornerVectorX + dy * rotatedCornerVectorY);

            const element = imagesStore.selectedElement;
            if (element.type === 'sticker') {
                const newWidth = Math.max(10, this.dragStart.elementWidth + projectedDistance * Math.SQRT2);
                (element as StickerElement).width = newWidth;
                (element as StickerElement).height = newWidth / this.dragStart.aspectRatio;
            } else if (element.type === 'text') {
                (element as TextElement).fontSize = Math.max(10, this.dragStart.elementSize + projectedDistance * Math.SQRT2);
            } else if (element.type === 'icon') {
                (element as SVGElement).size = Math.max(10, this.dragStart.elementSize + projectedDistance * Math.SQRT2);
            }

            this.render();
            return;
        }

        // 處理裁切框拖曳
        if (this.isDraggingCropBox) {
            this.canvas.style.cursor = "move";
            const dx = event.offsetX - this.dragStart.x;
            const dy = event.offsetY - this.dragStart.y;

            // 直接更新值，讓 watcher 處理約束和重繪
            this.cropBox.x = this.dragStart.boxX + dx;
            this.cropBox.y = this.dragStart.boxY + dy;

            return;
        }

        // 根據滑鼠位置改變指標樣式 (Hover)
        const isTransformable = imagesStore.selectedElement?.type === 'sticker' || imagesStore.selectedElement?.type === 'text';

        if (imagesStore.selectedElement && isTransformable) {
            const action = this.getActionForHandle(x, y, imagesStore.selectedElement);
            if (action === 'del') {
                this.canvas.style.cursor = 'pointer';
                return;
            } else if (action === 'rot') {
                this.canvas.style.cursor = 'grabbing'; // Or a custom rotation cursor
                return;
            } else if (action) {
                // Set cursor based on corner
                if (action === 'tl' || action === 'br') this.canvas.style.cursor = 'nwse-resize';
                if (action === 'tr' || action === 'bl') this.canvas.style.cursor = 'nesw-resize';
                return;
            }
        }

        const hoveredElement = this.findElementAtPosition(x, y);
        if (hoveredElement) {
            this.canvas.style.cursor = 'move';
        } else if (this.isPointInCropBox(x, y)) {
            this.canvas.style.cursor = 'move';
        } else {
            this.canvas.style.cursor = 'default';
        }
    }
    private handleDoubleClick(event: MouseEvent) {
        const imagesStore = useImagesStore();
        if (!imagesStore.imageUrl || !this.ctx) return;
        const clickedElement = this.findElementAtPosition(event.offsetX, event.offsetY);

        // 只有文字元素可以雙擊編輯
        if (clickedElement && clickedElement.type === 'text') {
            imagesStore.setSelectedElement(null);
            this.editingElement = clickedElement;
            const box = getElementBoundingBox(this.ctx, clickedElement)!;

            // 設定 input 的樣式和位置
            this.textInputStyle.left = `${box.x}px`;
            this.textInputStyle.top = `${box.y}px`;
            this.textInputStyle.width = `${box.width + 20}px`; // 增加一點寬度方便輸入
            this.textInputStyle.height = `${box.height}px`;
            this.textInputStyle.fontSize = `${(clickedElement as TextElement).fontSize}px`;
            this.textInputStyle.fontFamily = (clickedElement as TextElement).fontFamily || '';

            this.render(); // 重新繪製，隱藏 canvas 上的文字

            nextTick(() => {
                this.textInput?.focus();
                this.textInput?.select();
            }).then(() => {});
        }
    }
    private handleMouseUpOrLeave() {
        this.isDraggingCropBox = false;
        this.isDraggingElement = false;
        this.isResizing = null;
        this.isRotating = false;
        if (this.canvas) {
            // 恢復指標樣式，讓mousemove事件下次可以重新判斷
            this.canvas.style.cursor = "default";
        }
    }
    // 銷毀時要移除監聽器
    public destroy() {
        this.textInput = null;
        this.canvas = undefined;
        this.ctx = undefined;
    }
}