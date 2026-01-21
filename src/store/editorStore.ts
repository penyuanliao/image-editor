import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import {
  ElementTypesEnum,
  type ICanvasElement,
  type IImageConfig,
  type IUploadedImage,
  type StageConfig
} from "../types.ts";
import { calculateConstrainedSize } from "@/Utilities/useImageEditor.ts";
import { degrees, radians } from "@/Utilities/Algorithm.ts";
import { advancedDefaults, generalDefaults } from "@/config/settings.ts";
import { nanoid } from "nanoid";

// 為了讓 CanvasEditor 能夠傳入 store，我們需要匯出 store 的類型
export type EditorStore = ReturnType<typeof useEditorStore>;

export const useEditorStore = defineStore("editor", () => {
  // --- State ---
  const stage = reactive<ICanvasElement>({
    id: "0",
    name: "畫布",
    type: ElementTypesEnum.Stage,
    config: {
      width: generalDefaults.viewport.width,
      height: generalDefaults.viewport.height,
      x: 0,
      y: 0,
      color: generalDefaults.viewport.color,
      scaleX: 1,
      scaleY: 1
    } as StageConfig
  });
  // 圖片列表
  const imageList = ref<IUploadedImage[]>([]);
  // 原始圖像
  const originalImage = ref<HTMLImageElement | null | undefined>(null);
  // 畫布上的元素 (文字、圖形等)
  const elements = ref<ICanvasElement[]>([]);
  // 用於undo/redo 暫存圖片HTMLImageElement
  const imageCache = new Map<string, HTMLImageElement | undefined>();
  // --- 歷史紀錄 (Undo/Redo) ---
  let historyStep = ref<number>(0); // 紀錄目前步驟
  // 儲存 elements 的 JSON 字串快照
  const history = ref<string[]>(["[]"]); // 每個步驟的資料
  // 正在還原狀態
  const isRestoring = ref(false); // 用於防止在 undo/redo 時觸發 watch
  // 預覽圖片
  const previewImage = ref<string>("");
  //
  const saveConfirm = ref<boolean>(false);

  // const saveFileOptions = ref<{
  //   fileName: string,
  //   mineType: string,
  //   quality: number
  // }>({
  //   fileName: `edited-image-${Date.now()}`,
  //   mineType: "image/png",
  //   quality: 1
  // })

  // --- 互動狀態管理 ---

  const selectedElements = ref<ICanvasElement[]>([]);
  // 用於文字雙擊編輯
  const editingElement = ref<ICanvasElement | null>(null);
  // 檔案名稱
  const pageName = ref<string | null>(`edited-image-${Date.now()}`);
  // --- 預載入控制項圖示 ---
  const deleteIcon = ref(new Image());
  //狀態控制: 儲存中
  const savingImage = ref(false);
  // Scrollbar 邊緣值
  const viewTranslate = ref<{
    scale: number;
    x: number;
    y: number;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    autoScale: boolean;
  }>({ scale: 1, x: 0, y: 0, minX: 0, minY: 0, maxX: 0, maxY: 0, autoScale: true });
  // 計算放大、位移使用
  const canvas = ref<HTMLCanvasElement>();
  // 計算放大、位移使用
  const viewportEl = ref<HTMLDivElement>();

  // --- Getters ---
  // 取得單一選擇物件
  const selectedElement = computed({
    get: (): ICanvasElement | null => {
      if (selectedElements.value.length !== 1 || !selectedElements.value[0]) return null;
      return selectedElements.value[0];
    },
    set: (element: ICanvasElement | null) => {
      selectedElements.value = element ? [element] : [];
    }
  });
  // Computed property to handle degree-radian conversion for the rotation slider
  const rotationInDegrees = computed({
    get() {
      if (selectedElement.value && selectedElement.value.config.rotation) {
        // Convert radians to degrees and round to nearest integer
        return degrees(selectedElement.value.config.rotation);
      }
      return 0;
    },
    set(degrees: number) {
      if (selectedElement.value) {
        // Convert degrees to radians
        selectedElement.value.config.rotation = radians(degrees);
      }
    }
  });
  // 單一選擇物件的索引
  const selectedIndex = computed<number>(() => {
    if (selectedElement.value) {
      return elements.value.findIndex((el) => el.id === selectedElement.value!.id);
    }
    return -1;
  });

  // --- Actions ---
  // Cache: 紀錄圖片
  function setCache(newElements: ICanvasElement[]) {
    newElements.forEach((element) => {
      if (element.type === ElementTypesEnum.Image) {
        const imageConfig = element.config as IImageConfig;
        if (imageConfig.img) {
          imageCache.set(element.id, imageConfig.img);
        }
      }
    });
  }
  // Cache: 更新圖片
  function updateCache(id: string, image: HTMLImageElement | undefined) {
    imageCache.set(id, image);
  }
  // Cache: 清除圖片暫存
  function delCache(elementIds: string[]) {
    elementIds.forEach((id) => imageCache.delete(id));
  }

  // 取得圖片
  function addImage(image: IUploadedImage) {
    // 只紀錄最近使用的20筆
    if (imageList.value.length + 1 >= generalDefaults.maxRecentFiles) {
      imageList.value.shift();
    }
    return imageList.value.push(image) - 1;
  }
  // 設定原始圖像
  function setOriginalImage(index: number) {
    if (index >= 0 && index < imageList.value.length) {
      originalImage.value = imageList.value[index]?.image;
    }
  }
  // 增加物件
  function addElement(element: ICanvasElement) {
    elements.value.push(element);
    selectedElements.value = [element]; // 新增後自動選取
    setCache([element]);
    saveHistory();
  }
  // 增加多個物件
  function addElements(newElements: ICanvasElement[]) {
    elements.value.push(...newElements);
    selectedElements.value = newElements; // 新增後自動選取
    setCache(newElements);
    saveHistory();
  }
  // 執行刪除操作
  function removeElements(elementIds: string[]) {
    elements.value = elements.value.filter((el) => !elementIds.includes(el.id));
    selectedElements.value = selectedElements.value.filter((el) => !elementIds.includes(el.id));
    saveHistory();
  }
  // 更新物件
  function updateElement(elementId: string, props: Partial<ICanvasElement>) {
    const element = elements.value.find((el) => el.id === elementId);
    if (element) {
      Object.assign(element, props);
      updateCache(elementId, (element.config as IImageConfig).img);
    }
  }
  // 往前一層
  function moveForwardElement(elementId: string) {
    const index = elements.value.findIndex((el) => el.id === elementId);
    if (index >= 0 && index < elements.value.length - 1) {
      const [moveElement] = elements.value.splice(index, 1);
      if (moveElement) elements.value.splice(index + 1, 0, moveElement);
    }
  }
  // 往後一層
  function moveBackwardElement(elementId: string) {
    const index = elements.value.findIndex((el) => el.id === elementId);
    if (index > 0) {
      const [moveElement] = elements.value.splice(index, 1);
      if (moveElement) elements.value.splice(index - 1, 0, moveElement);
    }
  }
  // 推到最下層
  function moveBottomElement(elementId: string) {
    const index = elements.value.findIndex((el) => el.id === elementId);
    if (index > 0) {
      const [moveElement] = elements.value.splice(index, 1);
      if (moveElement) elements.value.unshift(moveElement);
    }
  }
  // 推到最上層
  function moveTopElement(elementId: string) {
    const index = elements.value.findIndex((el) => el.id === elementId);
    if (index >= 0 && index < elements.value.length - 1) {
      const [moveElement] = elements.value.splice(index, 1);
      if (moveElement) elements.value.push(moveElement);
    }
  }

  function reorderElements(newElements: ICanvasElement[]) {
    elements.value = newElements;
  }
  /**
   * 這邊不阻擋draggable事件不然無法解開選擇
   * @param element
   */
  function setSelectedOnce(element: ICanvasElement) {
    selectedElements.value = [element];
  }

  function setSelectedElements(elements: ICanvasElement[]) {
    selectedElements.value = elements.filter((el) => el.config.draggable);
  }

  function addToSelection(element: ICanvasElement) {
    if (element && !element.config.draggable) return;
    if (!selectedElements.value.some((el) => el.id === element.id)) {
      selectedElements.value.push(element);
    }
  }

  function removeFromSelection(elementId: string) {
    selectedElements.value = selectedElements.value.filter((el) => el.id !== elementId);
  }

  function clearSelection() {
    selectedElements.value = [];
  }

  function flipHorizontal() {
    if (selectedElement.value?.config) {
      const config = selectedElement.value.config;
      config.scaleX = typeof config.scaleX === "number" ? config.scaleX * -1 : -1;
    }
  }

  function flipVertical() {
    if (selectedElement.value?.config) {
      const config = selectedElement.value.config;
      config.scaleY = typeof config.scaleY === "number" ? config.scaleY * -1 : -1;
    }
  }
  // 替換圖片
  function replaceSelectedElementImage(
    elementId: string,
    image: HTMLImageElement,
    base64?: string
  ) {
    const element = elements.value.find((el) => el.id === elementId);
    if (element) {
      const config = element.config as IImageConfig;
      const { width, height } = calculateConstrainedSize(
        image.naturalWidth,
        image.naturalHeight,
        config.width,
        config.height
      );
      image.width = width;
      image.height = height;
      config.img = image;
      config.url = image.src;
      config.base64 = base64;
      config.width = width;
      config.height = height;

      element.id = nanoid(12);
      updateCache(element.id, image);
      saveHistory();
      return element.id;
    }
    return "";
  }

  /**
   * 上下撐滿
   */
  const fitToHeight = () => {
    if (selectedElement.value && selectedElement.value.config) {
      const config = selectedElement.value.config as IImageConfig;
      config.height = (stage.config.height || 1) * (stage.config.scaleY || 1);
      config.y = config.height / 2 + stage.config.y;
      saveHistory();
    }
  };
  /**
   * 左右撐滿
   */
  const fitToWidth = () => {
    if (selectedElement.value && selectedElement.value.config) {
      const config = selectedElement.value.config as IImageConfig;
      config.width = (stage.config.width || 1) * (stage.config.scaleX || 1);
      config.x = config.width / 2 + stage.config.x;
      saveHistory();
    }
  };
  /**
   * 預設選取屬性面板
   */
  const defaultPropsPanel = () => {
    const el = {
      id: "0",
      type: ElementTypesEnum.Stage,
      name: "stage",
      config: {
        width: stage.config.width,
        height: stage.config.height,
        x: 0,
        y: 0
      }
    } as ICanvasElement;
    setSelectedOnce(el);
    return el;
  };
  const hasUndo = computed(() => {
    if (!advancedDefaults.undoRedoEnabled) return false;
    // 到底了
    if (historyStep.value === 0) return false;
    return !isRestoring.value;
  });
  const hasRedo = computed(() => {
    if (!advancedDefaults.undoRedoEnabled) return false;
    if (historyStep.value === history.value.length - 1) return false; // 沒有可重做的動作
    return !isRestoring.value;
  });
  /**
   * 儲存操作紀錄
   */
  const saveHistory = () => {
    if (!advancedDefaults.undoRedoEnabled) return false;
    console.log("saveHistory");

    const newHistory = history.value.slice(0, historyStep.value + 1);
    newHistory.push(
      JSON.stringify(elements.value, (key, value) => {
        if (key === "img") return undefined;
        return value;
      })
    );
    // 限制還原步驟
    if (newHistory.length > generalDefaults.maxUndoOperations) {
      const diff = newHistory.shift();
      const last = newHistory[0];
      if (diff) {
        const list = JSON.parse(diff).map((el: ICanvasElement) => el.id);

        if (last) {
          JSON.parse(last).forEach((el: ICanvasElement) => {
            if (list.includes(el.id)) list.splice(list.indexOf(el.id), 1);
          });
        }
        delCache(list);
      }
    }
    history.value = newHistory;
    historyStep.value = newHistory.length - 1;
  };
  /**
   * 還原操作紀錄
   */
  const undo = () => {
    if (!hasUndo.value) return false;
    // 從 history 堆疊中取出上一個狀態並還原
    historyStep.value--;
    const previousState: ICanvasElement[] = JSON.parse(history.value[historyStep.value] || "[]");

    const selectElementId = selectedElement.value?.id;

    if (previousState) {
      isRestoring.value = true; // 標記正在還原，避免觸發 watch
      previousState.forEach((el) => {
        if (el.type !== "image") return;
        const config = el.config as IImageConfig;
        config.img = imageCache.get(el.id);
      });
      elements.value = previousState;
      isRestoring.value = false;
    }
    clearSelection();
    if (selectElementId) {
      const element = elements.value.find((el) => el.id === selectElementId);
      if (element) setSelectedOnce(element);
    }
    return true;
  };
  /**
   * 重做操作紀錄
   */
  const redo = () => {
    if (!hasRedo.value) return false; // 沒有可重做的動作
    isRestoring.value = true; // 標記正在還原，避免觸發 watch
    historyStep.value++;
    const lastState: ICanvasElement[] = JSON.parse(history.value[historyStep.value] || "[]");
    lastState.forEach((el) => {
      if (el.type !== "image") return;
      const config = el.config as IImageConfig;
      config.img = imageCache.get(el.id);
    });
    elements.value = lastState;
    isRestoring.value = false;
    clearSelection();
    return true;
  };
  // ---- 處理畫布 Zoom-in & Zoom-out ----//
  // 縮放:回初始值
  function scaleClear() {
    setScale(1);
    viewTranslate.value.autoScale = true;
    updateViewTranslate();
  }
  // 縮放:縮放畫布數值
  function setScale(scale: number) {
    const { min, max } = generalDefaults.zoomLimits;
    if (viewTranslate.value.scale < 1 && scale > 1) scale = 1;

    viewTranslate.value.scale = Math.max(min, Math.min(scale, max));
  }
  // 縮放:更新 ScrollBar 邊緣數值
  function updateViewTranslate() {
    if (!viewportEl.value || !canvas.value) return;

    const viewportWidth = viewportEl.value.clientWidth;
    const viewportHeight = viewportEl.value.clientHeight;
    const canvasWidth = canvas.value.width;
    const canvasHeight = canvas.value.height;
    const scaledContentWidth = canvasWidth * viewTranslate.value.scale;
    const scaledContentHeight = canvasHeight * viewTranslate.value.scale;

    // 計算內容超出視窗的部分
    const overflowX = Math.max(0, scaledContentWidth - viewportWidth);
    const overflowY = Math.max(0, scaledContentHeight - viewportHeight);
    const edgeDistanceX: number = overflowX === 0 ? 0 : 20;
    const edgeDistanceY: number = overflowY === 0 ? 0 : 20;
    // NBaseScrollbar 的滾動範圍是基於中心點的偏移量

    viewTranslate.value.minX = -overflowX / 2 - edgeDistanceX;
    viewTranslate.value.maxX = overflowX / 2 + edgeDistanceX;
    viewTranslate.value.minY = -overflowY / 2 - edgeDistanceY;
    viewTranslate.value.maxY = overflowY / 2 + edgeDistanceY;
  }
  function setCanvas(value: HTMLCanvasElement) {
    canvas.value = value;
  }
  function setViewport(value: HTMLDivElement) {
    viewportEl.value = value;
  }
  function setPreviewImage(value: string) {
    previewImage.value = value;
  }
  function setCanvasSize(width: number, height: number) {
    stage.config.width = width;
    stage.config.height = height;
  }

  return {
    // State
    canvas,
    viewportEl,
    stage,
    imageList,
    originalImage,
    elements,
    selectedElements,
    editingElement,
    pageName,
    deleteIcon,
    savingImage,
    viewTranslate,
    // Getters
    selectedElement,
    selectedIndex,
    rotationInDegrees,
    hasUndo,
    hasRedo,
    previewImage,
    saveConfirm,
    // Actions
    addImage,
    setOriginalImage,
    addElement,
    addElements,
    removeElements,
    updateElement,
    moveForwardElement,
    moveBackwardElement,
    moveBottomElement,
    moveTopElement,
    reorderElements,
    setSelectedOnce,
    setSelectedElements,
    addToSelection,
    removeFromSelection,
    clearSelection,
    flipHorizontal,
    flipVertical,
    replaceSelectedElementImage,
    imageCache,
    fitToWidth,
    fitToHeight,
    defaultPropsPanel,
    saveHistory,
    undo,
    redo,
    scaleClear,
    setScale,
    updateViewTranslate,
    setCanvas,
    setViewport,
    setPreviewImage,
    setCanvasSize
  };
});
