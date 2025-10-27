import {
    calculateConstrainedSize,
    drawBackground,
    drawControls,
    drawCropMarks,
    drawSticker,
    drawSVG,
    drawText,
    getElementBoundingBox,
    getTransformHandles,
} from './useImageEditor.ts';
import {ErrorMessage} from "./AlertMessage.ts";
import {createCanvasElement} from "./useCreateCanvasElement.ts";
import {nextTick} from "vue";
// 引入 store 的類型，但不直接使用 useImagesStore()
import type {ImagesStore} from '../store/images';
import {pasteImage} from "./useClipboard.ts";
import {ElementTypesEnum, type ICanvasElement, type IImageConfig, type ISVGConfig, type ITextConfig} from "../types.ts";

interface ICanvasViewport {
    width: number;
    height: number;
    scale: number;
    originalWidth: number;
    originalHeight: number;
}

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
}

interface IContextMenuEvent {
    x: number; // 螢幕 X 座標
    y: number; // 螢幕 Y 座標
    element: ICanvasElement | null;
}

// 這個類別將取代大部分 useImageEditor.ts 和 ImageUploader.vue 中的邏輯
export class CanvasEditor {
    private handlePaste:((event: ClipboardEvent) => Promise<void>) | null = null;
    protected divContainer?: HTMLDivElement | null = null;
    protected canvas?: HTMLCanvasElement;
    protected ctx?: CanvasRenderingContext2D;
    protected store: ImagesStore; // 儲存 Pinia store 的引用
    public editingElement?: ICanvasElement | null = null;
    // 回應右鍵選單監聽事件
    public onContextMenu: ((event: IContextMenuEvent) => void) | null = null;
    // 點擊兩下編輯的輸入框
    public textInput: HTMLInputElement | null = null;
    // 狀態屬性
    public cropBox: { x: number, y: number, width: number, height: number };

    // 縮放與平移狀態
    public scale: number = 1;
    public viewOffsetX: number = 0;
    public viewOffsetY: number = 0;

    public viewport: ICanvasViewport = {
        width: 800,
        height: 600,
        scale: 1,
        originalWidth: 0,
        originalHeight: 0
    }

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


    constructor(store: ImagesStore) {
        this.store = store;
        // 初始化裁切框
        this.cropBox = {
            x: 0,
            y: 0,
            width: 800,
            height: 600,
        }
    }

    private setupEventListeners() {
        this.canvas?.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas?.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas?.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        this.canvas?.addEventListener('mouseup', this.handleMouseUpOrLeave.bind(this));
        this.canvas?.addEventListener('contextmenu', this.handleContextMenu.bind(this));
        this.canvas?.addEventListener('mouseleave', this.handleMouseUpOrLeave.bind(this));
        // this.canvas?.addEventListener('wheel', this.handleWheel.bind(this));
    }

    public setup(canvas: HTMLCanvasElement, div: HTMLDivElement | null, store?: ImagesStore) {
        this.canvas = canvas;
        this.divContainer = div;
        if (store) this.store = store;
        const context:CanvasRenderingContext2D | null = canvas.getContext('2d');
        if (!context) {
            throw new Error('Failed to get 2D context');
        }
        this.ctx = context;
        this.setupEventListeners();
    }

    // --- 座標轉換 ---
    private screenToWorld(x: number, y: number): { x: number, y: number } {
        return {
            x: (x - this.viewOffsetX) / this.scale,
            y: (y - this.viewOffsetY) / this.scale,
        };
    }

    // --- 公開方法 (API) ---
    public resetCropMarks() {
        const { canvas, cropBox } = this;
        // 將裁切框重設到畫布中心
        if (canvas) {
            cropBox.x = (canvas.width - cropBox.width) / 2;
            cropBox.y = (canvas.height - cropBox.height) / 2;
        }
    }

    public setImage(image: HTMLImageElement) {
        // const index:number = this.store.addImage(image);
        // this.store.setOriginalImage(index);
        // this.render();
        if (!this.canvas) return;
        // 根據當前 viewport 的縮放比例來調整新貼圖的初始尺寸
        const initialScale = this.viewport.scale || 1;

        this.store.addImage(image);
        this.store.addElement({
            id: Date.now(),
            type: ElementTypesEnum.Image,
            name:  '新貼圖',
            config: {
                content: image.src,
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                width: image.width * initialScale,
                height: image.height * initialScale,
                img: image,
                rotation: 0,
            }
        } as ICanvasElement);
        this.store.imageUrl = image.src;
        this.render();
    }

    public async addElement(element: any):Promise<boolean> {
        if (!this.canvas || !this.store.imageUrl) {
            ErrorMessage('請先上傳一張圖片！');
            return false;
        }
        const el = await createCanvasElement(element, this.canvas, this.viewport.scale);
        if (el) {
            this.store.addElement(el); // 使用 action 新增
            this.render();
            return true;
        }
        return false;
    };
    // --- 統一的約束與重繪邏輯 ---
    public constrainCropBox(size?: { width: number, height: number }) {
        if (!this.canvas) return false;
        const { canvas, cropBox } = this;
        const original = { ...this.cropBox };
        const minSize = 0;
        // 使用 Math.round 避免拖曳時產生小數
        let w = Math.round(Math.max(minSize, cropBox.width));
        let h = Math.round(Math.max(minSize, cropBox.height));

        let width: number = size?.width || canvas.width;
        let height: number = size?.height || canvas.height;
        // 確保尺寸不超過畫布
        w = Math.min(w, width);
        h = Math.min(h, height);

        // 確保位置在邊界內
        let x = Math.round(Math.max(0, Math.min(cropBox.x, width - w)));
        let y = Math.round(Math.max(0, Math.min(cropBox.y, height - h)));

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

        const { ctx, canvas, cropBox, store } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // 1. 清除畫布
        ctx.fillStyle = "transparent";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // 2. 儲存 context 狀態並套用視圖變換 (縮放/平移)
        ctx.save();
        ctx.translate(this.viewOffsetX, this.viewOffsetY);
        ctx.scale(this.scale, this.scale);


        // --- 以下所有繪圖都在世界座標系中進行 ---
        // 3. 繪製背景圖
        if (store.originalImage) {
            drawBackground(this.canvas, this.ctx, store.originalImage);
        }

        // 3. 繪製裁切框
        drawCropMarks(canvas, ctx, cropBox);

        // 4. 繪製所有元素
        store.elements.forEach(element => {

            // 如果元素正在被編輯，則不在 canvas 上繪製它，由 input 框取代
            if (this.editingElement?.id === element.id) return;

            if (element.type === ElementTypesEnum.Text) {
                drawText(ctx, element);
            } else if (element.type === ElementTypesEnum.SVG) {
                drawSVG(ctx, element);
            } else if (element.type === ElementTypesEnum.Image) {
                drawSticker(ctx, element);
            }
        });

        // 5. 繪製控制項
        if (store.selectedElements.length > 0 && !this.editingElement) {
            store.selectedElements.forEach(selected => {
                const box = getElementBoundingBox(ctx, selected);
                drawControls(ctx, selected, box, store.selectedElements.length > 1);
            });
        }

        // 6. 恢復 context 狀態，移除視圖變換
        ctx.restore();
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
        const ctx = this.ctx;
        if (!ctx) return null;

        // 從後往前找，確保點擊到最上層的元素
        return [...this.store.elements].reverse().find(el => {
            if ((el.type === ElementTypesEnum.Text || el.type === ElementTypesEnum.Image) && el.config.rotation) {
                // For rotated stickers, we need to check against the rotated bounding box
                // A simpler way is to transform the click point into the element's local coordinate system
                const angle = el.config.rotation || 0;
                const dx = x - (el.config.x || 0);
                const dy = y - (el.config.y || 0);
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
    public getActionForHandle(x: number, y: number, element: ICanvasElement) {
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
    private handleContextMenu(event: MouseEvent) {
        event.preventDefault(); // 阻止瀏覽器預設右鍵選單
        if (!this.canvas) return;

        const { x, y } = this.screenToWorld(event.offsetX, event.offsetY);
        const clickedElement = this.findElementAtPosition(x, y);

        // 如果點擊到元素，就將其設為單獨選取
        if (clickedElement) {
            this.store.setSelectedElements([clickedElement]);
            this.render();
        }

        // 觸發回呼，將事件資訊傳遞給 Vue 元件來顯示 UI
        this.onContextMenu?.({ x: event.clientX, y: event.clientY, element: clickedElement as ICanvasElement });
    }

    private handleMouseDown(event: MouseEvent) {
        if (!this.canvas) return;
        const { x, y } = this.screenToWorld(event.offsetX, event.offsetY);
        const isShiftPressed = event.shiftKey;

        // 優先處理控制項的點擊 (只有在單選時才允許變形)
        if (this.store.selectedElements.length === 1) {
            const selectedElement = this.store.selectedElements[0];
            if (!selectedElement) return;
            const action = this.getActionForHandle(x, y, selectedElement);
            if (action) {
                if (action === 'del') {
                    this.store.removeElements([selectedElement.id]);
                    this.render();
                    return;
                }
                this.handleTransformStart(x, y, action, selectedElement);
                return;
            }
        }

        const clickedElement = this.findElementAtPosition(x, y);

        if (isShiftPressed) {
            if (clickedElement) {
                // 按住 Shift 點擊物件
                if (this.store.selectedElements.some(el => el.id === clickedElement.id)) {
                    // 如果已選取，則取消選取
                    this.store.removeFromSelection(clickedElement.id);
                } else {
                    // 如果未選取，則加入選取
                    this.store.addToSelection(clickedElement);
                }
            }
            // 按住 Shift 點擊空白處，不做任何事
        } else {
            // 沒有按 Shift 點擊
            if (clickedElement) {
                // 如果點擊的物件未被選取，則只選取它
                if (!this.store.selectedElements.some(el => el.id === clickedElement.id)) {
                    this.store.setSelectedElements([clickedElement]);
                }
            } else {
                // 點擊空白處，取消所有選取
                this.store.clearSelection();
            }
        }

        if (clickedElement) {
            this.isDraggingElement = true;
            this.dragStart.x = x;
            this.dragStart.y = y;
            this.dragStart.elementX = clickedElement.config.x;
            this.dragStart.elementY = clickedElement.config.y;
        } else if (!isShiftPressed && this.isPointInCropBox(x, y)) {
            this.isDraggingCropBox = true;
            this.dragStart.x = event.offsetX;
            this.dragStart.y = event.offsetY;
            this.dragStart.boxX = this.cropBox.x;
            this.dragStart.boxY = this.cropBox.y;
        }

        this.render();
    }

    private handleTransformStart(x: number, y: number, action: string, element: ICanvasElement) {
        this.dragStart.x = x;
        this.dragStart.y = y;
        this.dragStart.elementX = element.config.x;
        this.dragStart.elementY = element.config.y;
        // For text, we scale fontSize. For stickers, we scale size.
        this.dragStart.elementRotation = element.config.rotation || 0;

        if (element.type === ElementTypesEnum.Image) {
            const image = element.config as IImageConfig;
            this.dragStart.elementWidth = image.width || 1;
            this.dragStart.elementHeight = image.height || 1;
            this.dragStart.aspectRatio = image.width && image.height ? image.width / image.height : 1;
        } else if (element.type === ElementTypesEnum.Text) {
            const text = element.config as ITextConfig;
            this.dragStart.elementSize = text.fontSize || 32;
        } else if (element.type === ElementTypesEnum.SVG) {
            const icon = element.config as ISVGConfig;
            this.dragStart.elementWidth = icon.width || 50;
            this.dragStart.elementHeight = icon.height || 50;
        }

        if (action === 'rot') {
            this.isRotating = true;
            // Calculate initial angle between center and mouse
            this.dragStart.angle = Math.atan2(y - element.config.y, x - element.config.x) - this.dragStart.elementRotation;
        } else {
            this.isResizing = action; // 'tl', 'tr', 'bl', 'br'
        }
        this.render();
    }
    private handleMouseMove(event: MouseEvent) {
        if (!this.canvas || !this.store.imageUrl) return;
        const { x, y } = this.screenToWorld(event.offsetX, event.offsetY);

        // 處理元素拖曳 (可多選)
        if (this.isDraggingElement && this.store.selectedElements.length > 0) {
            this.canvas.style.cursor = "move";
            const dx = x - this.dragStart.x;
            const dy = y - this.dragStart.y;

            // 遍歷所有選中的元素並移動它們
            this.store.selectedElements.forEach(el => {
                // 每個元素都基於它自己的初始位置進行移動
                // 注意：這裡假設所有元素一起拖動，所以我們需要儲存每個元素的初始位置。
                // 簡化：我們假設 dragStart 儲存的是第一個點擊元素的位置，然後所有元素都應用相同的位移。
                // 為了正確實現，handleMouseDown 應該記錄下所有選中元素的初始位置。
                // 目前的簡化實現：
                el.config.x += dx;
                el.config.y += dy;
            });
            // 更新 dragStart 以便下次 mousemove 計算增量
            this.dragStart.x = x;
            this.dragStart.y = y;
            this.render();
            return;
        }
        // 處理貼圖旋轉 (單選)
        if (this.isRotating && this.store.selectedElements.length === 1) {
            this.canvas.style.cursor = "grabbing";
            const selectedElement = this.store.selectedElements[0];
            if (selectedElement) {
                const currentAngle = Math.atan2(y - selectedElement.config.y, x - selectedElement.config.x);
                selectedElement.config.rotation = currentAngle - this.dragStart.angle;
            }
            this.render();
            return;
        }
        // 處理貼圖縮放 (單選)
        if (this.isResizing && this.store.selectedElements.length === 1) {
            const angle = this.dragStart.elementRotation;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const element = this.store.selectedElements[0];
            const dx = x - this.dragStart.x;
            const dy = y - this.dragStart.y;
            if (!element) return;
            // Side handles for non-proportional scaling (stickers only)
            if (element.type === ElementTypesEnum.Image && ['tm', 'bm', 'ml', 'mr'].includes(this.isResizing)) {
                const sticker = element.config as IImageConfig;
                if (this.isResizing === 'tm' || this.isResizing === 'bm') {
                    // Project mouse delta onto element's local Y-axis
                    const projectedDistance = -dx * sin + dy * cos;
                    const sign = this.isResizing === 'tm' ? -1 : 1;
                    const newHeight = Math.max(10, this.dragStart.elementHeight + projectedDistance * sign);
                    sticker.height = newHeight;
                    // Adjust position to keep the opposite edge in place
                    const deltaHeight = (newHeight - this.dragStart.elementHeight) / 2;
                    sticker.x = this.dragStart.elementX + deltaHeight * sin * sign;
                    sticker.y = this.dragStart.elementY + deltaHeight * cos * sign;
                } else { // 'ml' or 'mr'
                    // Project mouse delta onto element's local X-axis
                    const projectedDistance = dx * cos + dy * sin;
                    const sign = this.isResizing === 'ml' ? -1 : 1;
                    const newWidth = Math.max(10, this.dragStart.elementWidth + projectedDistance * sign);
                    sticker.width = newWidth;
                    // Adjust position to keep the opposite edge in place
                    const deltaWidth = (newWidth - this.dragStart.elementWidth) / 2;
                    sticker.x = this.dragStart.elementX + deltaWidth * cos * sign;
                    sticker.y = this.dragStart.elementY - deltaWidth * sin * sign;
                }
            } else {
                // Corner handles (proportional scaling for all types)
                // Project mouse movement onto the vector from center to corner

                // Get the vector for the dragged corner in its un-rotated state
                let cornerVectorX = this.isResizing.includes('r') ? 1 : -1;
                let cornerVectorY = this.isResizing.includes('b') ? 1 : -1;

                // Rotate the corner vector
                const rotatedCornerVectorX = cornerVectorX * cos - cornerVectorY * sin;
                const rotatedCornerVectorY = cornerVectorX * sin + cornerVectorY * cos;

                // Dot product of mouse delta and corner vector to find projected distance
                const projectedDistance = (dx * rotatedCornerVectorX + dy * rotatedCornerVectorY);

                if (element.type === ElementTypesEnum.Image) {
                    // For stickers, scale width and height proportionally
                    const newWidth = Math.max(10, this.dragStart.elementWidth + projectedDistance * Math.SQRT2);
                    const newHeight = newWidth / this.dragStart.aspectRatio;
                    (element.config as IImageConfig).width = newWidth;
                    (element.config as IImageConfig).height = newHeight;
                } else if (element.type === ElementTypesEnum.Text) {
                    // For text, scale font size
                    (element.config as ITextConfig).fontSize = Math.max(10, this.dragStart.elementSize + projectedDistance * Math.SQRT2);
                } else if (element.type === ElementTypesEnum.SVG) {
                    // For icons, scale size
                    (element.config as ISVGConfig).width = (element.config as ISVGConfig).height = Math.max(10, this.dragStart.elementSize + projectedDistance * Math.SQRT2);
                }
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
        // 只有單選時才顯示變形指標
        if (this.store.selectedElements.length === 1) {
            const selectedElement = this.store.selectedElements[0];
            if (!selectedElement) return;
            const action = this.getActionForHandle(x, y, selectedElement);
            if (action === 'del') {
                this.canvas.style.cursor = 'pointer';
                return;
            } else if (action === 'rot') {
                this.canvas.style.cursor = 'grabbing';
                return;
            } else if (action) {
                // Set cursor based on corner
                if (action === 'tl' || action === 'br') this.canvas.style.cursor = 'nwse-resize';
                else if (action === 'tr' || action === 'bl') this.canvas.style.cursor = 'nesw-resize';
                if (action === 'tm' || action === 'bm') {
                    this.canvas.style.cursor = 'ns-resize';
                }
                if (action === 'ml' || action === 'mr') {
                    this.canvas.style.cursor = 'ew-resize';
                }
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
        if (!this.store.imageUrl || !this.ctx) return;
        const { x, y } = this.screenToWorld(event.offsetX, event.offsetY);
        const clickedElement = this.findElementAtPosition(x, y);

        // 只有文字元素可以雙擊編輯
        if (clickedElement && clickedElement.type === ElementTypesEnum.Text) {
            this.store.clearSelection(); // 進入編輯模式時取消選取
            this.editingElement = clickedElement;
            const box = getElementBoundingBox(this.ctx, clickedElement)!;
            
            // 將世界座標轉換回螢幕座標來定位 HTML input
            const viewX = box.x * this.scale + this.viewOffsetX;
            const viewY = box.y * this.scale + this.viewOffsetY;

            // 設定 input 的樣式和位置
            this.textInputStyle.left = `${viewX}px`;
            this.textInputStyle.top = `${viewY}px`;
            this.textInputStyle.width = `${(box.width + 20) * this.scale}px`; // 寬高也要縮放
            this.textInputStyle.height = `${box.height * this.scale}px`;
            this.textInputStyle.fontSize = `${(clickedElement.config as ITextConfig).fontSize}px`;
            this.textInputStyle.fontFamily = (clickedElement.config as ITextConfig).fontFamily || '';

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

    private handleWheel(event: WheelEvent) {
        event.preventDefault();
        if (!this.canvas) return;

        const zoomIntensity = 0.05;
        const delta = -event.deltaY * zoomIntensity;
        const newScale = this.scale + delta;

        // 限制縮放範圍
        const minScale = 0.2;
        const maxScale = 5;
        const clampedScale = Math.max(minScale, Math.min(newScale, maxScale));

        if (clampedScale === this.scale) return; // 縮放比例未改變

        // 改為使用畫布中心點作為縮放中心
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // 計算縮放前，畫布中心點對應的世界座標
        const worldCenterX = (centerX - this.viewOffsetX) / this.scale;
        const worldCenterY = (centerY - this.viewOffsetY) / this.scale;

        this.scale = clampedScale;
        // 更新 viewOffset，使得畫布中心的世界座標點在縮放後仍在畫布中心
        this.viewOffsetX = centerX - worldCenterX * this.scale;
        this.viewOffsetY = centerY - worldCenterY * this.scale;

        this.render();
    }
    // 同步更新 canvas 的繪圖表面尺寸
    updateViewportSize(width: number, height: number) {
        const { canvas, divContainer } = this;
        this.viewport = calculateConstrainedSize(width, height, 800, 600);
        if (canvas) {
            canvas.width = this.viewport.width;
            canvas.height = this.viewport.height;
        }
        if (divContainer) {
            divContainer.style.width = `${this.viewport.width}px`;
            divContainer.style.height = `${this.viewport.height}px`;
        }
        console.log(this.viewport);
    }
    public enablePasteSupport() {

        if (this.handlePaste) return;

        this.handlePaste = async () => {
            const image = await pasteImage();
            if (image) {
                this.setImage(image);
                this.render();
            }
        }
        document.addEventListener('paste', this.handlePaste);
    }
    public disablePasteSupport() {
        if (!this.handlePaste) return;
        document.removeEventListener('paste', this.handlePaste);
    }

    // 銷毀時要移除監聽器
    public destroy() {
        this.textInput = null;
        this.canvas?.removeEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas?.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas?.removeEventListener('dblclick', this.handleDoubleClick.bind(this));
        this.canvas?.removeEventListener('mouseup', this.handleMouseUpOrLeave.bind(this));
        this.canvas?.removeEventListener('mouseleave', this.handleMouseUpOrLeave.bind(this));
        this.canvas?.removeEventListener('contextmenu', this.handleContextMenu.bind(this));
        this.canvas?.removeEventListener('wheel', this.handleWheel.bind(this));
        this.disablePasteSupport();
        this.canvas = undefined;
        this.ctx = undefined;
    }
}