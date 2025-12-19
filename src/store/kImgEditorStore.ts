import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import { calculateConstrainedSize } from "@/Utilities/Algorithm.ts";

export interface KonvaShadowProps {
  shadowEnabled?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
}

export interface KonvaStrokeProps {
  enabled?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface KonvaTextGradientProps {
  fillPriority?: "linear-gradient" | string;
  fillLinearGradientStartPoint?: {
    x: number;
    y: number;
  };
  fillLinearGradientEndPoint?: {
    x: number;
    y: number;
  };
  fillLinearGradientColorStops?: [number, string, number, string];
}

export interface KonvaTextProps extends KonvaShadowProps, KonvaTextGradientProps, KonvaStrokeProps {
  text: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontFamily?: string;
  fontSize?: number;
  fontStyle?: "normal" | "italic" | "bold" | string;
  // 旋轉角度 (radians)
  rotation?: number;
}
export interface KonvaImageProps extends KonvaShadowProps, KonvaStrokeProps {
  x: number;
  y: number;
  width?: number;
  height?: number;
  // 旋轉角度 (radians)
  rotation?: number;
  image?: HTMLImageElement | null;
  // 裁剪參數
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
}

export interface KonvaTextConfig extends KonvaTextProps {
  draggable: boolean; // 是否可以拖拉
  name: string; // 收尋檢查用名稱
  dragBoundFunc?: Function; // 應用拖曳限制
  url?: string; // 圖片連結
  base64?: string; // 圖片產生的 base64 字串
  categoryId?: number; // 類別 ID: AI 產圖使用
  id?: number; // 圖庫來源編號: AI 產圖使用
}
export interface KonvaImageConfig extends KonvaImageProps {
  draggable: boolean; // 是否可以拖拉
  name: string; // 收尋檢查用名稱
  dragBoundFunc?: Function; // 應用拖曳限制
}

export interface KElementImage {
  type: "image";
  id: string;
  config: KonvaImageConfig;
}
export interface KElementText {
  type: "text";
  id: string;
  config: KonvaTextConfig;
}
// 場景大小
export interface KStageConfig {
  width: number;
  height: number;
}
export interface KArtboardConfig {
  width: number;
  height: number;
  x: number;
  y: number;
  image: HTMLImageElement | null;
  listening: boolean;
  fill: string;
}

export const useKImgEditorStore = defineStore("kImgEditorStore", () => {
  // 圖片陣列
  const imageList = ref<HTMLImageElement[]>([]);
  // 物件陣列
  const elements = ref<Array<KElementImage | KElementText>>([]);
  // 背景圖片
  const backgroundImage = ref<HTMLImageElement | null>(null);

  // 整個場景大小
  const stageConfig = reactive<KStageConfig>({
    width: 800,
    height: 600
  });
  // 定義固定的畫板尺寸
  const artboardSize = reactive<{ width: number; height: number; scale: number }>({
    width: 800,
    height: 600,
    scale: 1
  });

  // 計算畫布在 Stage 中的置中位置
  const artboardOffset = computed(() => ({
    x: (stageConfig.width - artboardSize.width) / 2,
    y: (stageConfig.height - artboardSize.height) / 2
  }));

  const workspaceConfig: {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    listening: boolean;
  } = reactive({
    x: 0,
    y: 0,
    width: 800,
    height: 600,
    fill: "white",
    listening: false
  });

  const artboardBackgroundConfig = computed(() => {
    return {
      ...artboardOffset.value,
      width: artboardSize.width,
      height: artboardSize.height,
      image: backgroundImage.value,
      listening: false, // 讓背景不回應滑鼠事件，很重要！
      fill: "white" // 如果沒有背景圖，顯示為白色
    };
  });
  // 畫板裁切群組設定
  const artboardClipConfig = computed(() => {
    return {
      // 這個 group 不需要 x, y，因為它在 layer 內部是相對 (0,0)
      width: artboardSize.width,
      height: artboardSize.height,
      clearBeforeDraw: true,
      clip: {
        x: 0,
        y: 0,
        width: artboardSize.width,
        height: artboardSize.height
      }
    };
  });

  const setup = (width: number, height: number) => {
    // 場景設定
    stageConfig.width = width;
    stageConfig.height = height;
    // 場景工作區大小
    workspaceConfig.width = stageConfig.width;
    workspaceConfig.height = stageConfig.height;
    workspaceConfig.fill = "#f0f0f0"; // 在這裡設定你想要的背景顏色
    workspaceConfig.listening = false; // 讓背景不回應滑鼠事件，很重要！
    // workspaceConfig.x = artboardOffset.value.x;
    // workspaceConfig.y = artboardOffset.value.y;
  };
  // 設定編輯區大小
  const setArtBoardSize = (width: number, height: number) => {
    // 畫板裁切群組設定
    const {
      width: scaleW,
      height: scaleH,
      scale
    } = calculateConstrainedSize(width, height, stageConfig.width, stageConfig.height);
    artboardSize.width = scaleW;
    artboardSize.height = scaleH;
    artboardSize.scale = scale;
    console.log("setArtBoardSize: %s", scale);
  };

  const addElement = (el: KElementImage | KElementText) => {
    elements.value.push(el);
  };
  const addImage = (image: HTMLImageElement) => {
    if (image) imageList.value.push(image);
  };

  return {
    stageConfig,
    workspaceConfig,
    artboardSize,
    artboardOffset,
    artboardClipConfig,
    artboardBackgroundConfig,
    setup,
    setArtBoardSize,
    elements,
    imageList,
    backgroundImage,
    addElement,
    addImage
  };
});
