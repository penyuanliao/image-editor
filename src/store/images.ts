import { defineStore } from 'pinia';
import type { CanvasElement } from "../Utilities/useImageEditor.ts";

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
  imageList: HTMLImageElement[];
  originalImage: HTMLImageElement | null | undefined;
  elements: CanvasElement[];
  selectedElement: CanvasElement | null;
  editingElement: CanvasElement | null;
  imageUrl: string | null;
  deleteIcon: HTMLImageElement;
}

export const useImagesStore = defineStore('images', {
  state: (): ImagesStoreState => ({
    imageList: [],
    originalImage: null,
    // 畫布上的元素 (文字、圖形等)
    elements: [],
    // --- 互動狀態管理 ---
    selectedElement: null,
    editingElement: null,
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
    addElement(element: CanvasElement) {
      this.elements.push(element);
      this.selectedElement = element; // 新增後自動選取
    },
    // 執行刪除操作
    removeElement(elementId: number) {
      this.elements = this.elements.filter(el => el.id !== elementId);
      if (this.selectedElement?.id === elementId) {
        this.selectedElement = null;
      }
    },
    updateElement(elementId: number, props: Partial<CanvasElement>) {
      const element = this.elements.find(el => el.id === elementId);
      if (element) {
        Object.assign(element, props);
      }
    },
    // 往前一層
    forwardElement(elementId: number) {
      const index = this.elements.findIndex(el => el.id === elementId);
      if (index > 0 && index < this.elements.length - 1) {
        const moveElement = this.elements.splice(index, 1)[0] as CanvasElement;
        this.elements.splice(index - 1, 0, moveElement);
      }
    },
    // 往後一層
    backwardElement(elementId: number) {
      const index = this.elements.findIndex(el => el.id === elementId);
      if (index > 0 && index < this.elements.length - 1) {
        const moveElement = this.elements.splice(index, 1)[0] as CanvasElement;
        this.elements.splice(index + 1, 0, moveElement);
      }
    },
    reorderElements(elements: CanvasElement[]) {
      this.elements = elements;
    },
    // 設定選擇的物件
    setSelectedElement(element: CanvasElement | null) {
      this.selectedElement = element;
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
