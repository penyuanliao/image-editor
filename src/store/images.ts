import { defineStore } from 'pinia';
import {ElementTypesEnum, type ICanvasElement, type StageConfig} from "../types.ts";

// 建立一個代表 800x600 白色像素的 Data URL
const WHITE_BG_SRC = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// 建立一個虛擬的白色圖片物件，用於預設狀態
const createWhiteImage = (): HTMLImageElement => {
  const img = new Image();
  img.src = WHITE_BG_SRC;
  return img;
};

// 為了讓 CanvasEditor 能夠傳入 store，我們需要匯出 store 的類型
export type ImagesStore = ReturnType<typeof useImagesStore>;

interface ImagesStoreState {
  stage: ICanvasElement;
  imageList: HTMLImageElement[];
  originalImage: HTMLImageElement | null | undefined;
  elements: ICanvasElement[];
  selectedElements: ICanvasElement[]; // 將用此完全取代 selectedElement
  editingElement: ICanvasElement | null;
  imageUrl: string | null;
  deleteIcon: HTMLImageElement;
}

export const useImagesStore = defineStore('images', {
  state: (): ImagesStoreState => ({
    stage: {
      id: 0,
      name: '畫布',
      type: ElementTypesEnum.Stage,
      config: {
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        color: 'transparent'
      } as StageConfig
    },
    imageList: [],
    originalImage: null,
    // 畫布上的元素 (文字、圖形等)
    elements: [],
    // --- 互動狀態管理 ---
    selectedElements: [],
    editingElement: null, // 用於文字雙擊編輯
    imageUrl: 'xxxxx',
    // --- 預載入控制項圖示 ---
    deleteIcon: new Image(),
  }),
  actions: {
    // 取得圖片
    addImage(image: HTMLImageElement) {
      return this.imageList.push(image) - 1;
    },
    // 設定原始圖像
    setOriginalImage(index: number) {
      if (index >= 0 && index < this.imageList.length) {
        this.originalImage = this.imageList[index];
        this.imageUrl = this.imageList[index]?.src || null;
      }
    },
    addElement(element: ICanvasElement) {
      this.elements.push(element);
      this.selectedElements = [element]; // 新增後自動選取
    },
    // 執行刪除操作
    removeElements(elementIds: number[]) {
      this.elements = this.elements.filter(el => !elementIds.includes(el.id));
      this.selectedElements = this.selectedElements.filter(
        el => !elementIds.includes(el.id)
      );
    },
    updateElement(elementId: number, props: Partial<ICanvasElement>) {
      const element = this.elements.find(el => el.id === elementId);
      if (element) {
        Object.assign(element, props);
      }
    },
    // 往前一層
    forwardElement(elementId: number) {
      const index = this.elements.findIndex(el => el.id === elementId);
      if (index > 0 && index < this.elements.length - 1) {
        const moveElement = this.elements.splice(index, 1)[0] as ICanvasElement;
        this.elements.splice(index - 1, 0, moveElement);
      }
    },
    // 往後一層
    backwardElement(elementId: number) {
      const index = this.elements.findIndex(el => el.id === elementId);
      if (index > 0 && index < this.elements.length - 1) {
        const moveElement = this.elements.splice(index, 1)[0] as ICanvasElement;
        this.elements.splice(index + 1, 0, moveElement);
      }
    },
    reorderElements(elements: ICanvasElement[]) {
      this.elements = elements;
    },
    /**
     * 這邊不阻擋draggable事件不然無法解開選擇
     * @param element
     */
    setSelectedOnce(element: ICanvasElement) {
      this.selectedElements = [element];
    },
    setSelectedElements(elements: ICanvasElement[]) {
      this.selectedElements = elements.filter(el => el.config.draggable);
    },
    addToSelection(element: ICanvasElement) {
      if (element && !element.config.draggable) return;
      if (!this.selectedElements.some(el => el.id === element.id)) {
        this.selectedElements.push(element);
      }
    },
    removeFromSelection(elementId: number) {
      this.selectedElements = this.selectedElements.filter(el => el.id !== elementId);
    },
    clearSelection() {
      this.selectedElements = [];
    },


    setDefaultBackground() {
      this.originalImage = createWhiteImage();
      this.imageUrl = WHITE_BG_SRC;
    },
    setBackgroundSize(width: number, height: number) {
      this.originalImage = new Image(width, height);
      this.imageUrl = 'xxxx';
    }
  },
});
