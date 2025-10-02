import { defineStore } from 'pinia';
import type { CanvasElement } from "../components/useImageEditor.ts";

export const useImagesStore = defineStore('images', {
  state: (): {
    imageList: HTMLImageElement[],
    originalImage: HTMLImageElement | null | undefined,
    elements: CanvasElement[],
    selectedElement: CanvasElement | null,
    editingElement: CanvasElement | null,
    imageUrl: string | null,
    deleteIcon: HTMLImageElement,
  } => ({
    imageList: [],
    originalImage: null,
    // 畫布上的元素 (文字、圖形等)
    elements: [],
    // --- 互動狀態管理 ---
    selectedElement: null,
    editingElement: null,
    imageUrl: '',
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
    // 設定選擇的物件
    setSelectedElement(element: CanvasElement | null) {
      this.selectedElement = element;
    },
  },
});
