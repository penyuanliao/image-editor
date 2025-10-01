import { defineStore } from 'pinia';
import type { CanvasElement } from "../components/useImageEditor.ts";

export const useImagesStore = defineStore('images', {
  state: () => ({
    imageList: [] as HTMLImageElement[],
    originalImage: null as HTMLImageElement | null | undefined,
    elements: [] as CanvasElement[],
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
  },
});
