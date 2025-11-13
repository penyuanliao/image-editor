import { defineStore } from 'pinia';
import {
  ElementTypesEnum,
  type ICanvasElement,
  type IImageConfig,
  type IUploadedImage,
  type StageConfig
} from "../types.ts";
import {calculateConstrainedSize} from "@/Utilities/useImageEditor.ts";

// 為了讓 CanvasEditor 能夠傳入 store，我們需要匯出 store 的類型
export type EditorStore = ReturnType<typeof useEditorStore>;

interface EditorStoreState {
  stage: ICanvasElement;
  imageList: IUploadedImage[];
  originalImage: HTMLImageElement | null | undefined;
  elements: ICanvasElement[];
  selectedElements: ICanvasElement[]; // 將用此完全取代 selectedElement
  editingElement: ICanvasElement | null;
  pageName: string | null;
  deleteIcon: HTMLImageElement;
  savingImage: boolean;
}

export const useEditorStore = defineStore('editor', {
  state: (): EditorStoreState => ({
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
    // 檔案名稱
    pageName: null,
    // --- 預載入控制項圖示 ---
    deleteIcon: new Image(),

    //狀態控制: 儲存中
    savingImage: false

  }),
  getters: {
    selectedElement(state): ICanvasElement | null {
      if (state.selectedElements.length <= 0) return null;
      if (state.selectedElements.length > 1) return null;
      const element = state.selectedElements[0];
      if (element) {
        return element as ICanvasElement;
      }
      return null;
    },
    selectedIndex(state): number {
      const selected = this.selectedElement;
      if (selected !== null) {
        return state.elements.findIndex(el => el.id === selected.id);
      }
      return -1;
    }
  },
  actions: {
    // 取得圖片
    addImage(image: IUploadedImage) {
      return this.imageList.push(image) - 1;
    },
    // 設定原始圖像
    setOriginalImage(index: number) {
      if (index >= 0 && index < this.imageList.length) {
        this.originalImage = this.imageList[index]?.image;
      }
    },
    addElement(element: ICanvasElement) {
      this.elements.push(element);
      this.selectedElements = [element]; // 新增後自動選取
    },
    addElements(elements: ICanvasElement[]) {
      this.elements.push(...elements);
      this.selectedElements = elements; // 新增後自動選取
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
    moveForwardElement(elementId: number) {
      const index = this.elements.findIndex(el => el.id === elementId);
      if (index >= 0 && index <= this.elements.length - 1) {
        const moveElement = this.elements.splice(index, 1)[0] as ICanvasElement;
        this.elements.splice(index + 1, 0, moveElement);
      }
    },
    // 往後一層
    moveBackwardElement(elementId: number) {
      const index = this.elements.findIndex(el => el.id === elementId);
      if (index >= 0 && index <= this.elements.length - 1) {
        const moveElement = this.elements.splice(index, 1)[0] as ICanvasElement;
        this.elements.splice(index - 1, 0, moveElement);
      }
    },
    // 推到最下層
    moveBottomElement(elementId: number) {
      const index = this.elements.findIndex(el => el.id === elementId);
      if (index >= 0 && index <= this.elements.length - 1) {
        const moveElement = this.elements.splice(index, 1)[0] as ICanvasElement;
        this.elements.unshift(moveElement)
      }
    },
    // 推到最上層
    moveTopElement(elementId: number) {
      const index = this.elements.findIndex(el => el.id === elementId);
      if (index >= 0 && index <= this.elements.length - 1) {
        const moveElement = this.elements.splice(index, 1)[0] as ICanvasElement;
        this.elements.push(moveElement);
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
    flipHorizontal() {
      if (this.selectedElement?.config) {
        if (typeof this.selectedElement.config.scaleX === "number") {
          this.selectedElement.config.scaleX *= -1;
        } else {
          this.selectedElement.config.scaleX = -1;
        }
      }
    },
    flipVertical() {
      if (this.selectedElement?.config) {
        if (typeof this.selectedElement.config.scaleY === "number") {
          this.selectedElement.config.scaleY *= -1
        } else {
          this.selectedElement.config.scaleY = -1;
        }
      }
    },
    // 替換圖片
    replaceSelectedElementImage(image: HTMLImageElement, base64?: string) {
      if (this.selectedElement) {
        const config = this.selectedElement.config as IImageConfig;

        const { width, height } = calculateConstrainedSize(image.naturalWidth, image.naturalHeight, config.width, config.height);
        image.width = width;
        image.height = height;
        config.img = image;
        config.url = image.src;
        config.base64 = base64;
      }
    }
  },
});
