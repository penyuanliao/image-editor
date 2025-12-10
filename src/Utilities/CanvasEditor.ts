import {
    calculateConstrainedSize,
    drawBackground,
    drawControls,
    drawCropControls,
    getActionForCropHandle,
    drawCropMarks,
    drawImage,
    drawSVG,
    drawText,
    getElementBoundingBox,
    getTransformHandles,
} from './useImageEditor.ts';
import {ErrorMessage} from "./AlertMessage.ts";
import {createCanvasElement} from "./useCreateCanvasElement.ts";
// 引入 store 的類型，但不直接使用 useEditorStore()
import type { EditorStore } from '../store/editorStore.ts';
import {clipboardPaste, validationPermissions} from "./useClipboard.ts";
import {
    ElementTypesEnum,
    type ICanvasElement,
    type IImageConfig,
    type ISVGConfig,
    type ITextConfig,
} from "../types.ts";
import {processUrl} from "./FileProcessor.ts";
import {advancedDefaults, generalDefaults} from "@/config/settings.ts";
import {nanoid} from "nanoid";
import {nextTick} from "vue";

interface ICanvasViewport {
    width: number;
    height: number;
    scale: number;
    originalWidth: number;
    originalHeight: number;
    color: string;
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
    startHandleDistance?: number;
}

interface IContextMenuEvent {
    x: number; // 螢幕 X 座標
    y: number; // 螢幕 Y 座標
    element: ICanvasElement | null;
    visible?: boolean;
}

// 這個類別將取代大部分 useImageEditor.ts 和 ImageUploader.vue 中的邏輯
export class CanvasEditor {
    private handlePaste:((event: ClipboardEvent) => Promise<void>) | null = null;
    private handleCopy:((event: ClipboardEvent) => Promise<void>) | null = null;
    protected wheelElement?: HTMLDivElement | null = null;
    protected divContainer?: HTMLDivElement | null = null;
    protected canvas?: HTMLCanvasElement;
    protected ctx?: CanvasRenderingContext2D;
    protected store: EditorStore; // 儲存 Pinia store 的引用
    public editingElement?: ICanvasElement | null = null;
    // 回應右鍵選單監聽事件
    public onContextMenu: ((event: IContextMenuEvent) => void) | null = null;
    public onPopOverMenu: ((event: IContextMenuEvent) => void) | null = null;
    public onStartEditText: ((element: ICanvasElement) => void) | null = null;
    // 點擊兩下編輯的輸入框
    public textInput: HTMLInputElement | null = null;
    // 狀態屬性
    public cropBox: { x: number, y: number, width: number, height: number, scale: number; };

    // 縮放與平移狀態
    get scale(): number {
        return this.store?.viewTranslate.scale || 1;
    }
    get viewOffsetX(): number {
        return this.store?.viewTranslate.x || 0;
    }
    get viewOffsetY(): number {
        return this.store?.viewTranslate.y || 0;
    }
    public autoScale: boolean = true;

    public viewport: ICanvasViewport = {
        width: 800,
        height: 600,
        scale: 1,
        originalWidth: 0,
        originalHeight: 0,
        color: "transparent"
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
        startHandleDistance: 0,
    };
    public textInputStyle: any = {
        top: '0px',
        left: '0px',
        width: '0px',
        height: '0px',
        fontSize: '32px',
        fontFamily: 'Arial',
        letterSpacing: '0px',
        lineHeight: 1.2,
        textAlign: 'center'
    };

    // 拖曳裁切框相關的狀態
    public isDraggingCropBox: boolean = false;
    public isDraggingElement: boolean = false;
    // 縮放
    public isResizing: string|null = null;
    // 剪裁事件
    public isCroppingAction: string|null = null; // 新增：用於標記正在進行的剪裁操作
    // 旋轉
    public isRotating: boolean = false;

    // 拖曳選擇相關狀態
    public isSelectionDragging: boolean = false;
    public selectionRect: { x: number, y: number, width: number, height: number } | null = null;
    public selectionStartPoint: { x: number, y: number } = { x: 0, y: 0 };
    public editingDropBox: boolean = false;
    // 圖片可以進行剪裁
    public imageCropEditEnabled: boolean = advancedDefaults.imageCropEditEnabled;
    // 對角線拉伸
    public isPivotPointEnabled: boolean = advancedDefaults.pivotPointEnabled;
    //
    public get artboardSize() {
        return {
            width: this.cropBox.width,
            height: this.cropBox.height,
            scale: this.cropBox.scale,
            x: this.cropBox.x,
            y: this.cropBox.y,
        }
    }

    constructor(store: EditorStore) {
        this.store = store;
        // 初始化裁切框
        this.cropBox = {
            x: 0,
            y: 0,
            width: 550,
            height: 240,
            scale: 1,
        }
    }
    /**
     * 初始化滑鼠事件
     * @private
     */
    private setupEventListeners() {
        this.canvas?.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas?.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas?.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        this.canvas?.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas?.addEventListener('contextmenu', this.handleContextMenu.bind(this));
        this.canvas?.addEventListener('mouseleave', this.handleMouseLeave.bind(this));

    }
    public setupZoomView(wheelElement: HTMLDivElement) {
        if (wheelElement) {
            this.wheelElement = wheelElement;
            this.store.setViewport(wheelElement);
            this.store.updateViewTranslate();
            // 因為滑鼠滾輪放大無法觸發scrollbar顯示事件這邊透過:key改變強制 Vue 重掛載該 DOM
            this.wheelElement?.addEventListener('wheel', this.handleWheel.bind(this));
        }
    }

    public setup(canvas: HTMLCanvasElement, div: HTMLDivElement | null, store?: EditorStore) {
        this.canvas = canvas;
        this.divContainer = div;
        if (store) {
            this.store = store;
        }
        this.store?.setCanvas(canvas);
        const context:CanvasRenderingContext2D | null = canvas.getContext('2d');
        if (!context) {
            throw new Error('Failed to get 2D context');
        }
        this.ctx = context;
        this.setupEventListeners();
    }

    // --- 座標轉換 ---
    private screenToWorld(x: number, y: number): { x: number, y: number } {
        if (!this.canvas) {
            return { x, y };
        }
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        const panX = this.viewOffsetX;
        const panY = this.viewOffsetY;
        const scale = this.scale;

        const worldX = (x - panX - cx) / scale + cx;
        const worldY = (y + panY - cy) / scale + cy;

        return {
            x: worldX,
            y: worldY,
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

    public setImage(image: HTMLImageElement, base64: string) {
        if (!this.canvas) return;
        const shrink: number = 0.9;

        const info = calculateConstrainedSize(
            image.naturalWidth,
            image.naturalHeight,
            this.artboardSize.width,
            this.artboardSize.height
        );

        this.store.addImage({
            imageUrl: image.src,
            image: image,
            name: 'new image 1',
            base64
        });
        this.store.addElement({
            id: nanoid(12),
            type: ElementTypesEnum.Image,
            name:  '新貼圖',
            config: {
                content: image.src,
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                width: info.width * shrink,
                height: info.height * shrink,
                img: image,
                url: image.src,
                base64,
                rotation: 0,
                draggable: true
            }
        } as ICanvasElement);
        this.render();
    }

    public async addElement(element: any):Promise<boolean> {
        if (!this.canvas ) {
            ErrorMessage('畫布並未被建立!!');
            return false;
        }
        const el = await createCanvasElement(element, this.canvas, this);
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
        ctx.fillStyle = this.viewport.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // 2. 儲存 context 狀態並套用視圖變換 (縮放/平移)
        ctx.save();
        ctx.translate(this.viewOffsetX * -1, this.viewOffsetY * -1);
        // 中心點縮放
        const cx = canvas?.width / 2;
        const cy = canvas?.height / 2;
        ctx.translate(cx, cy);
        ctx.scale(this.scale, this.scale);
        ctx.translate(-cx, -cy);


        // --- 以下所有繪圖都在世界座標系中進行 ---
        // 3. 繪製背景圖
        if (store.originalImage) {
            drawBackground(this.canvas, this.ctx, store.originalImage);
        }

        // 4. 繪製所有元素
        store.elements.forEach(element => {

            const isCroppingThisElement = (element.config as IImageConfig).cropConfig?.isCropping;

            // 如果元素正在被編輯，則不在 canvas 上繪製它，由 input 框取代
            // 如果圖片正在剪裁，我們依然要繪製它，但之後會蓋上遮罩
            // 增加條件：如果正在縮放或旋轉，則強制繪製，忽略編輯狀態
            if (this.editingElement?.id === element.id && !isCroppingThisElement && !this.isResizing && !this.isRotating) return;

            if (element.type === ElementTypesEnum.Text) {
                drawText(ctx, element);
            } else if (element.type === ElementTypesEnum.SVG) {
                drawSVG(ctx, element);
            } else if (element.type === ElementTypesEnum.Image) {
                // 如果正在剪裁，則繪製完整的圖片，並在上面蓋上剪裁UI
                if (isCroppingThisElement) {
                    drawImage(ctx, element, true); // forceDrawFullImage = true
                    drawCropControls(ctx, element);
                    return; // 避免下面再繪製一次控制項
                }
                drawImage(ctx, element);
            }
        });
        // 3. 繪製裁切框
        drawCropMarks(canvas, ctx, cropBox);

        // 5. 繪製控制項
        if (store.selectedElements.length > 0 && !this.editingElement) {
            store.selectedElements.forEach(selected => {
                // 如果元素正在剪裁，則不繪製普通的控制項
                if ((selected.config as IImageConfig).cropConfig?.isCropping) return;

                const box = getElementBoundingBox(ctx, selected);
                drawControls(ctx, selected, box, store.selectedElements.length > 1, this.isResizing);
            });
        }
        // 6. 顯示提示選單
        // 7. 繪製拖曳選擇框
        if (this.isSelectionDragging && this.selectionRect) {
            ctx.fillStyle = "rgba(64, 158, 255, 0.2)"; // 淡藍色半透明填充
            ctx.strokeStyle = "rgba(64, 158, 255, 0.8)"; // 藍色邊框
            ctx.lineWidth = 1;
            ctx.fillRect(this.selectionRect.x, this.selectionRect.y, this.selectionRect.width, this.selectionRect.height);
            ctx.strokeRect(this.selectionRect.x, this.selectionRect.y, this.selectionRect.width, this.selectionRect.height);
        }

        this.showPopOverMenu(store.selectedElements.length != 0);
        // 7. 恢復 context 狀態，移除視圖變換
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
    //開始剪裁圖片編輯狀態
    private startImageCropperEditing(clickedElement: ICanvasElement) {
        const config = clickedElement.config as IImageConfig;

        // 初始化 cropConfig
        if (!config.cropConfig) {
            config.cropConfig = {};
        }

        // 切換剪裁狀態
        config.cropConfig.isCropping = !config.cropConfig.isCropping;

        if (config.cropConfig.isCropping) {
            // 進入剪裁模式，選取此元素
            // 如果 cropRect 不存在，則初始化為完整圖片大小
            if (!config.cropConfig.cropRect && config.img) {
                config.cropConfig.cropRect = {
                    x: 0,
                    y: 0,
                    width: config.img.naturalWidth,
                    height: config.img.naturalHeight,
                };
            }
            this.store.setSelectedElements([clickedElement]);
        } else {
            // 結束剪裁模式
            this.store.clearSelection();
        }
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
        this.onContextMenu?.({ x: event.offsetX, y: event.offsetY, element: clickedElement as ICanvasElement });
    }
    public showPopOverMenu(visible: boolean) {
        if (!this.canvas || !this.ctx) return;

        const selectedElements = this.store.selectedElements;

        if (visible && selectedElements.length > 0) {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

            // 1. 遍歷所有選取物件，計算它們共同的邊界框
            selectedElements.forEach(el => {
                const handles = getTransformHandles(this.ctx!, el);
                if (handles) {
                    // 考慮旋轉後的情況，檢查所有控制點來確定邊界
                    // 排除 del 和 rot 控制點，只計算物件本身的邊界
                    Object.entries(handles.points).forEach(([key, p]) => {
                        if (p && key !== 'del') {
                            minX = Math.min(minX, p.x);
                            minY = Math.min(minY, p.y);
                            maxX = Math.max(maxX, p.x);
                            maxY = Math.max(maxY, p.y);
                        }
                    });
                }
            });

            if (isFinite(minX)) {
                // 2. 計算邊界框的總寬度和中心點
                const totalWidth = maxX - minX;
                const centerX = minX + totalWidth / 2;

                // console.log(`選取了 ${selectedElements.length} 個物件，總寬度: ${totalWidth.toFixed(2)} x: ${centerX} y: ${minY}`);

                // 3. 觸發 onPopOverMenu 事件，傳遞計算後的位置
                this.onPopOverMenu?.({ visible: true, x: centerX, y: minY, element: null });
            }
        } else {
            // 如果沒有選取物件或要隱藏 Popover，則發送隱藏事件
            this.onPopOverMenu?.({
                visible: false,
                x: 0,
                y: 0,
                element: null
            });
        }
    }

    private handleMouseDown(event: MouseEvent) {
        if (!this.canvas) return;
        const { x, y } = this.screenToWorld(event.offsetX, event.offsetY);
        const isShiftPressed = event.shiftKey;
        this.showPopOverMenu(false);

        // 檢查是否正在剪裁
        const croppingElement = this.store.elements.find(el => (el.config as IImageConfig).cropConfig?.isCropping);
        if (croppingElement) {
            const action = getActionForCropHandle(this.ctx!, x, y, croppingElement);
            if (action) {
                this.handleCropTransformStart(x, y, action, croppingElement);
                return; // 攔截事件，不再往下執行
            }
            // 如果點擊在剪裁框外，則結束剪裁
            (croppingElement.config as IImageConfig).cropConfig!.isCropping = false;
            this.store.clearSelection();
            this.render();
            return; // 結束剪裁後直接返回
        }

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
                // 開始拖曳元素
                this.isDraggingElement = true;
                this.dragStart.x = x;
                this.dragStart.y = y;
                this.dragStart.elementX = clickedElement.config.x;
                this.dragStart.elementY = clickedElement.config.y;
            } else if (this.editingDropBox && this.isPointInCropBox(x, y)) {
                // 點擊在裁切框內，開始拖曳裁切框
                this.isDraggingCropBox = true;
                this.dragStart.x = x;
                this.dragStart.y = y;
                this.dragStart.boxX = this.cropBox.x;
                this.dragStart.boxY = this.cropBox.y;
            } else {
                // 點擊空白處，開始拖曳選擇
                this.isSelectionDragging = true;
                this.selectionStartPoint = { x, y };
                this.selectionRect = { x, y, width: 0, height: 0 };
                // 先清除當前的選取
                this.store.clearSelection();
            }
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
            // 為了讓 pivot point 邏輯能運作，我們也需要文字的初始寬高
            if (this.ctx) {
                const box = getElementBoundingBox(this.ctx, element);
                this.dragStart.elementWidth = box?.width || 1;
                this.dragStart.elementHeight = box?.height || 1;
                this.dragStart.aspectRatio = box && box.width && box.height ? box.width / box.height : 1;
            }
        } else if (element.type === ElementTypesEnum.SVG) {
            const icon = element.config as ISVGConfig;
            this.dragStart.elementWidth = icon.width || 50;
            this.dragStart.elementHeight = icon.height || 50;
            this.dragStart.aspectRatio = icon.width && icon.height ? icon.width / icon.height : 1;
        }

        if (action === 'rot') {
            this.isRotating = true;
            // Calculate initial angle between center and mouse
            this.dragStart.angle = Math.atan2(y - element.config.y, x - element.config.x) - this.dragStart.elementRotation;
        } else {
            this.isResizing = action; // 'tl', 'tr', 'bl', 'br'
            // 在這裡計算並儲存初始拖曳時，控制點到中心的距離
            if (this.ctx && !['tm', 'bm', 'ml', 'mr'].includes(action)) {
                const handleKey = action as 'tl' | 'tr' | 'bl' | 'br';
                const handles = getTransformHandles(this.ctx, element);
                if (handles) {
                    const startHandlePos = handles.points[handleKey];
                    this.dragStart.startHandleDistance = Math.hypot(startHandlePos.x - element.config.x, startHandlePos.y - element.config.y);
                }
            }
        }
        this.render();
    }

    private handleCropTransformStart(x: number, y: number, action: string, element: ICanvasElement) {
        this.isCroppingAction = action;
        this.dragStart.x = x;
        this.dragStart.y = y;

        const config = element.config as IImageConfig;
        const cropRect = config.cropConfig?.cropRect;
        if (cropRect) {
            this.dragStart.boxX = cropRect.x;
            this.dragStart.boxY = cropRect.y;
            this.dragStart.elementWidth = cropRect.width;
            this.dragStart.elementHeight = cropRect.height;
        }
    }
    private handleMouseMove(event: MouseEvent) {
        if (!this.canvas) return;
        const { x, y } = this.screenToWorld(event.offsetX, event.offsetY);

        // 處理拖曳選擇
        if (this.isSelectionDragging) {
            this.canvas.style.cursor = "crosshair";
            if (this.selectionRect) {
                // 根據滑鼠當前位置和起始點，計算選擇框的 x, y, width, height
                // 這樣可以支援從任何方向拖曳
                this.selectionRect.x = Math.min(x, this.selectionStartPoint.x);
                this.selectionRect.y = Math.min(y, this.selectionStartPoint.y);
                this.selectionRect.width = Math.abs(x - this.selectionStartPoint.x);
                this.selectionRect.height = Math.abs(y - this.selectionStartPoint.y);
            }
            this.render();
            return;
        }

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

        // 處理剪裁框的拖曳與縮放
        if (this.isCroppingAction && this.store.selectedElements.length === 1) {
            const element = this.store.selectedElements[0];
            if (!element) return;
            const config = element.config as IImageConfig;
            const cropRect = config.cropConfig?.cropRect;
            if (!cropRect || !config.img) return;

            // 將滑鼠位移從畫布座標系轉換為原始圖片座標系
            const originalImgWidth = config.img.naturalWidth;
            const elementWidthOnCanvas = config.width;
            const scaleRatio = originalImgWidth / elementWidthOnCanvas;

            const dx = (x - this.dragStart.x) * scaleRatio;
            const dy = (y - this.dragStart.y) * scaleRatio;

            let newX = this.dragStart.boxX;
            let newY = this.dragStart.boxY;
            let newWidth = this.dragStart.elementWidth;
            let newHeight = this.dragStart.elementHeight;

            if (this.isCroppingAction === 'move') {
                newX += dx;
                newY += dy;
            } else {
                // 處理縮放
                if (this.isCroppingAction.includes('t')) {
                    newY += dy;
                    newHeight -= dy;
                }
                if (this.isCroppingAction.includes('b')) {
                    newHeight += dy;
                }
                if (this.isCroppingAction.includes('l')) {
                    newX += dx;
                    newWidth -= dx;
                }
                if (this.isCroppingAction.includes('r')) {
                    newWidth += dx;
                }
            }

            // 邊界約束，確保剪裁框不會超出原始圖片範圍
            if (newWidth < 10) newWidth = 10;
            if (newHeight < 10) newHeight = 10;

            cropRect.x = Math.max(0, Math.min(newX, originalImgWidth - newWidth));
            cropRect.y = Math.max(0, Math.min(newY, config.img.naturalHeight - newHeight));
            cropRect.width = Math.min(newWidth, originalImgWidth - cropRect.x);
            cropRect.height = Math.min(newHeight, config.img.naturalHeight - cropRect.y);

            // 更新 dragStart 以便下次計算
            this.dragStart.x = x;
            this.dragStart.y = y;
            this.dragStart.boxX = cropRect.x;
            this.dragStart.boxY = cropRect.y;
            this.dragStart.elementWidth = cropRect.width;
            this.dragStart.elementHeight = cropRect.height;

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
            if (!element) return;
            // Side handles for non-proportional scaling (stickers only)
            if (element.type === ElementTypesEnum.Image && this.isResizing && ['tm', 'bm', 'ml', 'mr'].includes(this.isResizing)) {
                // 這邊是計算方向的縮放
                const sticker = element.config as IImageConfig;
                const sign = ['tm', 'ml'].includes(this.isResizing) ? -1 : 1;

                if (this.isResizing === 'tm' || this.isResizing === 'bm') {
                    // 1. 計算固定邊的中點 (pivot)
                    const pivotX = this.dragStart.elementX - this.dragStart.elementHeight / 2 * sin * sign;
                    const pivotY = this.dragStart.elementY - this.dragStart.elementHeight / 2 * cos * sign;

                    // 2. 計算從 pivot 到滑鼠的向量，並投影到元素的局部 Y 軸上，得到新高度
                    const dx = x - pivotX;
                    const dy = y - pivotY;
                    const newHeight = Math.max(10, Math.abs(-dx * sin + dy * cos));
                    sticker.height = newHeight;

                    // 3. 根據新高度和 pivot 重新計算元素中心點
                    sticker.x = this.dragStart.elementX + (newHeight / 2 - this.dragStart.elementHeight / 2) * sin * sign;
                    sticker.y = this.dragStart.elementY + (newHeight / 2 - this.dragStart.elementHeight / 2) * cos * sign;

                } else { // 'ml' or 'mr'
                    // 1. 計算固定邊的中點 (pivot)
                    const pivotX = this.dragStart.elementX - this.dragStart.elementWidth / 2 * cos * sign;
                    const pivotY = this.dragStart.elementY + this.dragStart.elementWidth / 2 * sin * sign;

                    // 2. 計算從 pivot 到滑鼠的向量，並投影到元素的局部 X 軸上，得到新寬度
                    const dx = x - pivotX;
                    const dy = y - pivotY;
                    const newWidth = Math.max(10, Math.abs(dx * cos + dy * sin));
                    sticker.width = newWidth;

                    // 3. 根據新寬度和 pivot 重新計算元素中心點
                    sticker.x = this.dragStart.elementX + (newWidth / 2 - this.dragStart.elementWidth / 2) * cos * sign;
                    sticker.y = this.dragStart.elementY - (newWidth / 2 - this.dragStart.elementWidth / 2) * sin * sign;
                }
            } else {
                if (this.isPivotPointEnabled && (element.type === ElementTypesEnum.Image || element.type === ElementTypesEnum.Text || element.type === ElementTypesEnum.SVG)) {
                    // Corner handles (proportional scaling for all types)
                    // 1. Determine the pivot point (the opposite corner)
                    const w = this.dragStart.elementWidth;
                    const h = this.dragStart.elementHeight;
                    // 元素拖曳點決定定位點位置
                    let pivotSignX = 0;
                    let pivotSignY = 0;
                    // 上面角落
                    if (this.isResizing.includes('t')) pivotSignY = 1; // top handle -> bottom pivot
                    // 下面角落
                    if (this.isResizing.includes('b')) pivotSignY = -1; // bottom handle -> top pivot
                    // 左邊角落
                    if (this.isResizing.includes('l')) pivotSignX = 1; // left handle -> right pivot
                    // 右邊角落
                    if (this.isResizing.includes('r')) pivotSignX = -1; // right handle -> left pivot

                    // Calculate pivot point in element's local coordinate system and rotate it
                    const pivotLocalX = (w / 2) * pivotSignX;
                    const pivotLocalY = (h / 2) * pivotSignY;
                    const pivotX = this.dragStart.elementX + pivotLocalX * cos - pivotLocalY * sin;
                    const pivotY = this.dragStart.elementY + pivotLocalX * sin + pivotLocalY * cos;

                    // 2. Project the vector from pivot to mouse onto the element's rotated axes
                    const dx = x - pivotX;
                    const dy = y - pivotY;
                    const projectedWidth = dx * cos + dy * sin;
                    const projectedHeight = -dx * sin + dy * cos;

                    // 3. Calculate scale ratio based on the larger projection to maintain aspect ratio
                    const scaleRatioX = w ? Math.abs(projectedWidth / w) : 0;
                    const scaleRatioY = h ? Math.abs(projectedHeight / h) : 0;
                    const scaleRatio = Math.max(scaleRatioX, scaleRatioY);

                    // 4. Apply the new scaled dimensions
                    if (element.type === ElementTypesEnum.Image) {
                        const newWidth = Math.max(10, w * scaleRatio);
                        const newHeight = newWidth / this.dragStart.aspectRatio;
                        (element.config as IImageConfig).width = newWidth;
                        (element.config as IImageConfig).height = newHeight;
                    } else if (element.type === ElementTypesEnum.Text) {
                        (element.config as ITextConfig).fontSize = Math.max(10, this.dragStart.elementSize * scaleRatio);
                    } else if (element.type === ElementTypesEnum.SVG) {
                        const newWidth = Math.max(10, w * scaleRatio);
                        const newHeight = newWidth / this.dragStart.aspectRatio;
                        (element.config as ISVGConfig).width = newWidth;
                        (element.config as ISVGConfig).height = newHeight;
                    }

                    // 5. Recalculate the center based on the new dimensions and pivot
                    // 二維空間中點的旋轉公式 x = x1 * cos + y1 * sin, y = x1 * sin - y1 * cos
                    element.config.x = pivotX - (pivotLocalX * scaleRatio * cos) + (pivotLocalY * scaleRatio * sin);
                    element.config.y = pivotY - (pivotLocalX * scaleRatio * sin) - (pivotLocalY * scaleRatio * cos);
                } else {
                    // 計算滑鼠到元素中心的距離，以確保縮放不受旋轉影響
                    const distFromCenterX = x - element.config.x;
                    const distFromCenterY = y - element.config.y;
                    const currentDistance = Math.hypot(distFromCenterX, distFromCenterY);

                    // 獲取拖曳開始時，控制點到中心的距離
                    const startDistance = this.dragStart.startHandleDistance;
                    if (!startDistance) return;

                    // 計算縮放比例
                    const scaleRatio = currentDistance / startDistance;
                    if (element.type === ElementTypesEnum.Image) {
                        (element.config as IImageConfig).width = Math.max(10, this.dragStart.elementWidth * scaleRatio);
                        (element.config as IImageConfig).height = (element.config as IImageConfig).width! / this.dragStart.aspectRatio;
                    } else if (element.type === ElementTypesEnum.Text) {
                        (element.config as ITextConfig).fontSize = Math.max(10, this.dragStart.elementSize * scaleRatio);
                    } else if (element.type === ElementTypesEnum.SVG) {
                        const newWidth = Math.max(10, this.dragStart.elementWidth * scaleRatio);
                        (element.config as ISVGConfig).width = newWidth;
                        (element.config as ISVGConfig).height = newWidth / this.dragStart.aspectRatio;
                    }
                }


            }

            this.render();
            return;
        }

        // 處理裁切框拖曳
        if (this.isDraggingCropBox) {
            this.canvas.style.cursor = "move";
            const dx = x - this.dragStart.x; // 使用世界座標計算位移
            const dy = y - this.dragStart.y; // 使用世界座標計算位移

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
        if (!this.ctx) return;
        const { x, y } = this.screenToWorld(event.offsetX, event.offsetY);
        const clickedElement = this.findElementAtPosition(x, y) as ICanvasElement;

        // 檢查是否有其他元素正在剪裁，若有則先結束它
        this.clearEditing(clickedElement);

        // 只有文字元素可以雙擊編輯
        if (clickedElement && clickedElement.type === ElementTypesEnum.Text) {
            const box = getElementBoundingBox(this.ctx, clickedElement)!;
            this.updateTextInputStyle(clickedElement, box);
            this.onStartEditText?.(clickedElement);
        } else if (this.imageCropEditEnabled && clickedElement && clickedElement.type === ElementTypesEnum.Image) {
            this.startImageCropperEditing(clickedElement);
        }
        this.render();
    }
    private handleMouseUp(_: MouseEvent) {
        // 如果正在拖曳選擇
        if (this.isSelectionDragging && this.selectionRect) {
            const selectedElementsInRect: ICanvasElement[] = [];
            const rect = this.selectionRect;

            this.store.elements.forEach(el => {
                const box = getElementBoundingBox(this.ctx!, el);
                if (box) {
                    // 檢查物件的邊界框是否與選擇框相交
                    if (rect.x < box.x + box.width &&
                        rect.x + rect.width > box.x &&
                        rect.y < box.y + box.height &&
                        rect.y + rect.height > box.y) {
                        selectedElementsInRect.push(el);
                    }
                }
            });

            if (selectedElementsInRect.length > 0) {
                this.store.setSelectedElements(selectedElementsInRect);
            }
        } else {
            if (this.isDraggingElement || this.isResizing || this.isRotating) {
                this.store.saveHistory();
            }
        }
        this.clear();
        this.showPopOverMenu(true);
        this.render(); // 新增：重繪畫布以清除選擇框
    }
    private handleMouseLeave(_: MouseEvent) {
        this.clear();
        // this.showPopOverMenu(false);
    }
    // 清除狀態
    public clear() {
        this.isDraggingCropBox = false;
        this.isDraggingElement = false;
        this.isResizing = null;
        this.isCroppingAction = null;
        this.isRotating = false;
        if (this.canvas) {
            this.isSelectionDragging = false;
            this.selectionRect = null;
            // 恢復指標樣式，讓mousemove事件下次可以重新判斷
            this.canvas.style.cursor = "default";
        }
    }
    // 檢查是否有其他元素正在剪裁，若有則先結束它
    private clearEditing(clickedElement?: ICanvasElement) {
        const currentlyCroppingElement = this.store.elements.find(el => (el.config as IImageConfig).cropConfig?.isCropping);
        if (currentlyCroppingElement && currentlyCroppingElement.id !== clickedElement?.id) {
            (currentlyCroppingElement.config as IImageConfig).cropConfig!.isCropping = false;
            this.store.clearSelection(); // 清除選取以隱藏控制項
        }
    }

    public async handleWheel(event: WheelEvent) {
        // 檢查要有物件
        if (this.store.elements.length === 0) return;
        // 檢查 Ctrl 鍵 (或 Mac 上的 Command 鍵) 是否被按下
        if (!event.ctrlKey && !event.metaKey) {
            return; // 如果沒有按下，則不執行縮放
        }
        event.preventDefault();
        if (!this.canvas) return;
        const zoomIntensity = 0.05;
        const delta = -event.deltaY * zoomIntensity;
        const newScale = this.scale + delta;

        this.store.setScale(newScale);
        this.autoScale = false;
        await nextTick();

        // clientWidth/Height 不會包含 transform: scale 的效果。
        // 我們需要手動計算縮放後的可滾動範圍。
        if (this.canvas && this.wheelElement) {
            this.store.updateViewTranslate();
        }

        this.render();
    }

    public updateTextInputStyle(element: ICanvasElement, box: { x: number, y: number, width: number, height: number }) {
        if (!this.canvas) return;

        const scale = this.scale;
        const panX = this.viewOffsetX;
        const panY = this.viewOffsetY;
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        // 將世界座標轉換回螢幕座標來定位 HTML input
        const screenX = (box.x - cx) * scale + cx + panX;
        const screenY = (box.y - cy) * scale + cy - panY;

        const config = element.config as ITextConfig;

        // 設定 input 的樣式和位置
        this.textInputStyle.left = `${screenX}px`;
        this.textInputStyle.top = `${screenY - 3}px`; // 微調
        this.textInputStyle.width = `${box.width * scale}px`;
        this.textInputStyle.height = `${box.height * scale}px`;
        this.textInputStyle.fontSize = `${(config.fontSize || 12 ) * scale}px`; // 字體大小也需要縮放
        this.textInputStyle.fontFamily = config.fontFamily || '';
        this.textInputStyle.letterSpacing = `${(config.letterSpacing || 0) * scale}px`; // 字距也需要縮放
        this.textInputStyle.lineHeight = config.lineHeight || 1.2; // 行高是相對值，通常不需要乘以 scale
        this.textInputStyle.color = config.color || 'black';
        this.textInputStyle.textAlign = config.textAlign || 'left';

        // 旋轉中心也需要是轉換後的
        this.textInputStyle.transformOrigin = 'center center';
        if (config.rotation) {
            this.textInputStyle.transform = `rotate(${config.rotation}rad)`;
        } else {
            this.textInputStyle.transform = 'none';
        }
    }
    // 同步更新 canvas 的繪圖表面尺寸
    public updateViewportSize(width: number, height: number, color: string = "transparent") {
        const { canvas, divContainer } = this;
        if (canvas) {
            canvas.width = this.viewport.width;
            canvas.height = this.viewport.height;
        }
        if (divContainer) {
            divContainer.style.width = `${this.viewport.width}px`;
            divContainer.style.height = `${this.viewport.height}px`;
        }
        this.viewport.color = color;

        const constrained = calculateConstrainedSize(width, height, generalDefaults.viewport.maxWidth, generalDefaults.viewport.maxHeight);

        this.cropBox.width = constrained.width;
        this.cropBox.height = constrained.height;
        this.cropBox.scale = constrained.scale;
        this.resetCropMarks();
        // 重新取得位置
        this.store.stage.config.x = this.artboardSize.x;
        this.store.stage.config.y = this.artboardSize.y;
        this.store.stage.config.scaleY = constrained.scale;
        this.store.stage.config.scaleX = constrained.scale;
    }
    public enableCopyAndPasteSupport() {

        if (this.handlePaste) return;

        this.handlePaste = async () => {
            const valid: boolean = await validationPermissions();
            if (valid) {
                const { texts, images } = await clipboardPaste();
                for (const {image, base64 } of images) {
                    // 新增上傳的圖片
                    if (image) this.setImage(image, base64);
                }
                // 這邊是複製自己的Elements
                for (const str of texts) {
                    const jsonString:RegExpMatchArray | null = str.toString().match(/({.+?})(?={|$)/g);
                    if (!jsonString) continue;
                    const jsonData = JSON.parse(jsonString[0]);
                    console.log('Clipboard JSON:', jsonData.value, Array.isArray(jsonData.value));
                    const elements: ICanvasElement[] = [];
                    if (Array.isArray(jsonData.value)) {
                        for (let i = 0; i < jsonData.value.length; i++) {
                            const el: any = jsonData.value[i];
                            const image = await processUrl(el.config.url);
                            el.id = nanoid(12);
                            if (el.type === ElementTypesEnum.Image) {
                                el.config.img = image;
                            }
                            el.config.x += 10;
                            el.config.y += 10;
                            elements.push(el);
                        }
                        this.store.addElements(elements);
                    }
                }

                this.render();
            }

        }
        this.handleCopy = async (event: ClipboardEvent) => {
            // 在文字編輯模式不copy
            if (!this.editingElement) {
                const data: string = JSON.stringify({
                    key: 'canvaElements',
                    value: this.store.selectedElements
                });
                event.clipboardData?.setData('text/plain', data);
                console.log('copy', data, this.editingElement);
                event.preventDefault();
            }
        };
        document.addEventListener('paste', this.handlePaste);
        document.addEventListener('copy', this.handleCopy);
    }
    public disableCopyAndPasteSupport() {
        if (this.handlePaste)
            document.removeEventListener('paste', this.handlePaste);
        if (this.handleCopy)
            document.removeEventListener('copy', this.handleCopy);
    }
    // 對齊物件
    public align(horizontally: 'left' | 'center' | 'right' | string | null, vertically: 'top' | 'middle' | 'bottom' | string | null) {
        const selectedElements = this.store.selectedElements;
        if (selectedElements.length < 2 || !this.ctx) {
            return; // Alignment requires at least two elements
        }

        // 1. Find the bounding box of the entire selection
        let selectionMinX = Infinity;
        let selectionMaxX = -Infinity;
        let selectionMinY = Infinity;
        let selectionMaxY = -Infinity;

        selectedElements.forEach(element => {
            const box = getElementBoundingBox(this.ctx!, element);
            if (box) {
                selectionMinX = Math.min(selectionMinX, box.x);
                selectionMaxX = Math.max(selectionMaxX, box.x + box.width);
                selectionMinY = Math.min(selectionMinY, box.y);
                selectionMaxY = Math.max(selectionMaxY, box.y + box.height);
            }
        });

        // 2. Calculate target alignment positions
        const alignCenterTargetX = selectionMinX + (selectionMaxX - selectionMinX) / 2;
        const alignMiddleTargetY = selectionMinY + (selectionMaxY - selectionMinY) / 2;

        // 3. Apply alignment to each element
        selectedElements.forEach(element => {
            const box = getElementBoundingBox(this.ctx!, element);
            if (!box) return;

            // Horizontal alignment
            if (horizontally) {
                if (horizontally === 'left') {
                    element.config.x = selectionMinX + box.width / 2;
                } else if (horizontally === 'center') {
                    element.config.x = alignCenterTargetX;
                } else if (horizontally === 'right') {
                    element.config.x = selectionMaxX - box.width / 2;
                }
            }

            // Vertical alignment
            if (vertically) {
                if (vertically === 'top') {
                    element.config.y = selectionMinY + box.height / 2;
                } else if (vertically === 'middle') {
                    element.config.y = alignMiddleTargetY;
                } else if (vertically === 'bottom') {
                    element.config.y = selectionMaxY - box.height / 2;
                }
            }
        });

        // 4. Re-render the canvas to show changes
        this.render();
    }
    // 對齊場景
    public stageAlign(horizontally: 'left' | 'center' | 'right' | string | null, vertically: 'top' | 'middle' | 'bottom' | string | null) {

        const selectedElements = this.store.selectedElements;
        if (selectedElements.length < 1 || !this.ctx || !this.canvas) {
            return; // Requires at least one element and a canvas context
        }

        const stageWidth = this.canvas.width;
        const stageHeight = this.canvas.height;

        // Apply alignment to each selected element relative to the stage
        selectedElements.forEach(element => {
            const box = getElementBoundingBox(this.ctx!, element);
            if (!box) return;

            // Horizontal alignment relative to the stage
            if (horizontally) {
                if (horizontally === 'left') {
                    element.config.x = box.width / 2;
                } else if (horizontally === 'center') {
                    element.config.x = stageWidth / 2;
                } else if (horizontally === 'right') {
                    element.config.x = stageWidth - box.width / 2;
                }
            }

            // Vertical alignment relative to the stage
            if (vertically) {
                if (vertically === 'top') {
                    element.config.y = box.height / 2;
                } else if (vertically === 'middle') {
                    element.config.y = stageHeight / 2;
                } else if (vertically === 'bottom') {
                    element.config.y = stageHeight - box.height / 2;
                }
            }
        });

        // Re-render the canvas to show changes
        this.render();
    }
    // 更新Canvas大小時候需要動態調整Element位置
    public regulateElements(x: number, y: number) {
        this.store.selectedElements.forEach((el) => {
            el.config.x += x;
            el.config.y += y;
        })
    };
    // 銷毀時要移除監聽器
    public destroy() {
        this.textInput = null;
        this.canvas?.removeEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas?.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas?.removeEventListener('dblclick', this.handleDoubleClick.bind(this));
        this.canvas?.removeEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas?.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.canvas?.removeEventListener('contextmenu', this.handleContextMenu.bind(this));
        this.wheelElement?.removeEventListener('wheel', this.handleWheel.bind(this));
        this.disableCopyAndPasteSupport();
        this.canvas = undefined;
        this.ctx = undefined;
    }
}