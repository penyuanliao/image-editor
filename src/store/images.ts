import { defineStore } from 'pinia';
import type { CanvasElement } from "../components/useImageEditor.ts";

export const useImagesStore = defineStore('images', {
  state: () => ({
    imageList: [] as HTMLImageElement[],
    originalImage: null as HTMLImageElement | null | undefined,
    // 畫布上的元素 (文字、圖形等)
    elements: [] as CanvasElement[],
    // --- 互動狀態管理 ---
    selectedElement: null as CanvasElement | null,
    editingElement: null as CanvasElement | null,
  }),
  actions: {
    // 取得圖片
    addImage(image: HTMLImageElement) {
      this.imageList.push(image);
    },
    // 設定原始圖像
    setOriginalImage(index: number) {
      if (index >= 0 && index < this.imageList.length) {
        this.originalImage = this.imageList[index];
      }
    },
    // 設定選擇的物件
    setSelectedElement(element: CanvasElement | null) {
      this.selectedElement = element;
    },
  },
});
