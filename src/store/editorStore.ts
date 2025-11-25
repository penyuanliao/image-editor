import { defineStore } from 'pinia';
import {computed, reactive, ref } from "vue";
import {
  ElementTypesEnum,
  type ICanvasElement,
  type IImageConfig,
  type IUploadedImage,
  type StageConfig
} from "../types.ts";
import {calculateConstrainedSize} from "@/Utilities/useImageEditor.ts";
import {degrees, radians} from "@/Utilities/Algorithm.ts";
import {advancedDefaults, generalDefaults} from "@/config/settings.ts";
import {deepCloneElements} from "@/Utilities/clone.ts";

// 為了讓 CanvasEditor 能夠傳入 store，我們需要匯出 store 的類型
export type EditorStore = ReturnType<typeof useEditorStore>;

export const useEditorStore = defineStore('editor', () => {
  // --- State ---
  const stage = reactive<ICanvasElement>({
    id: 0,
    name: '畫布',
    type: ElementTypesEnum.Stage,
    config: {
      width: generalDefaults.viewport.width,
      height: generalDefaults.viewport.height,
      x: 0,
      y: 0,
      color: generalDefaults.viewport.color
    } as StageConfig
  });
  // 圖片列表
  const imageList = ref<IUploadedImage[]>([]);
  // 原始圖像
  const originalImage = ref<HTMLImageElement | null | undefined>(null);
  // 畫布上的元素 (文字、圖形等)
  const elements = ref<ICanvasElement[]>([]);
  // --- 歷史紀錄 (Undo/Redo) ---
  const historyStack = ref<ICanvasElement[][]>([]); // 儲存 elements 的 JSON 字串快照
  const redoStack = ref<ICanvasElement[][]>([]);
  const isRestoring = ref(false); // 用於防止在 undo/redo 時觸發 watch

  // --- 互動狀態管理 ---

  const selectedElements = ref<ICanvasElement[]>([]);
  // 用於文字雙擊編輯
  const editingElement = ref<ICanvasElement | null>(null);
  // 檔案名稱
  const pageName = ref<string | null>(`edited-image-${Date.now()}.png`);
  // --- 預載入控制項圖示 ---
  const deleteIcon = ref(new Image());
  //狀態控制: 儲存中
  const savingImage = ref(false);

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
      return elements.value.findIndex(el => el.id === selectedElement.value!.id);
    }
    return -1;
  });

  // --- Actions ---
  // 取得圖片
  function addImage(image: IUploadedImage) {
    return imageList.value.push(image) - 1;
  }
  // 設定原始圖像
  function setOriginalImage(index: number) {
    if (index >= 0 && index < imageList.value.length) {
      originalImage.value = imageList.value[index]?.image;
    }
  }

  function addElement(element: ICanvasElement) {
    elements.value.push(element);
    selectedElements.value = [element]; // 新增後自動選取
  }

  function addElements(newElements: ICanvasElement[]) {
    elements.value.push(...newElements);
    selectedElements.value = newElements; // 新增後自動選取
  }
  // 執行刪除操作
  function removeElements(elementIds: number[]) {
    elements.value = elements.value.filter(el => !elementIds.includes(el.id));
    selectedElements.value = selectedElements.value.filter(
      el => !elementIds.includes(el.id)
    );
  }

  function updateElement(elementId: number, props: Partial<ICanvasElement>) {
    const element = elements.value.find(el => el.id === elementId);
    if (element) {
      Object.assign(element, props);
    }
  }
  // 往前一層
  function moveForwardElement(elementId: number) {
    const index = elements.value.findIndex(el => el.id === elementId);
    if (index >= 0 && index < elements.value.length - 1) {
      const [moveElement] = elements.value.splice(index, 1);
      if (moveElement) elements.value.splice(index + 1, 0, moveElement);
    }
  }
  // 往後一層
  function moveBackwardElement(elementId: number) {
    const index = elements.value.findIndex(el => el.id === elementId);
    if (index > 0) {
      const [moveElement] = elements.value.splice(index, 1);
      if (moveElement) elements.value.splice(index - 1, 0, moveElement);
    }
  }
  // 推到最下層
  function moveBottomElement(elementId: number) {
    const index = elements.value.findIndex(el => el.id === elementId);
    if (index > 0) {
      const [moveElement] = elements.value.splice(index, 1);
      if (moveElement) elements.value.unshift(moveElement);
    }
  }
  // 推到最上層
  function moveTopElement(elementId: number) {
    const index = elements.value.findIndex(el => el.id === elementId);
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
    selectedElements.value = elements.filter(el => el.config.draggable);
  }

  function addToSelection(element: ICanvasElement) {
    if (element && !element.config.draggable) return;
    if (!selectedElements.value.some(el => el.id === element.id)) {
      selectedElements.value.push(element);
    }
  }

  function removeFromSelection(elementId: number) {
    selectedElements.value = selectedElements.value.filter(el => el.id !== elementId);
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
  function replaceSelectedElementImage(elementId: number, image: HTMLImageElement, base64?: string) {
    const element = elements.value.find(el => el.id === elementId);
    if (element) {
      const config = element.config as IImageConfig;
      const { width, height } = calculateConstrainedSize(image.naturalWidth, image.naturalHeight, config.width, config.height);
      image.width = width;
      image.height = height;
      config.img = image;
      // config.url = image.src;
      config.base64 = base64;
      config.width = width;
      config.height = height;
    }
  }

  // --- 歷史紀錄相關 Actions ---
  function undo() {
    if (!advancedDefaults.undoRedoEnabled) return;
    console.log('undo');
    if (historyStack.value.length > 0) {
      // 從 history 堆疊中取出上一個狀態並還原
      const previousState = historyStack.value.pop();
      if (previousState) {
        isRestoring.value = true; // 標記正在還原，避免觸發 watch
        // 將當前狀態推入 redo 堆疊
        const currentStack = deepCloneElements(selectedElements.value);
        redoStack.value.push(currentStack);

        previousState.forEach(el => {
          const index = elements.value.findIndex(e => e.id === el.id);
          if (index !== -1) {
            const newProps = el.config;
            if (elements.value[index]) {
              Object.assign(elements.value[index].config, newProps);
            }
          } else {
            addElement(el);
          }
        });
        clearSelection(); // 還原後清除選取，避免懸空的選取狀態
        isRestoring.value = false;
      }
    }
  }

  function redo() {
    console.log('redo');
    if (!advancedDefaults.undoRedoEnabled) return;

    if (redoStack.value.length > 0) {

      // 從 redo 堆疊中取出下一個狀態並還原
      const nextState = redoStack.value.pop();
      if (nextState) {
        isRestoring.value = true; // 標記正在還原，避免觸發 watch
        const currentStack: ICanvasElement[] = [];
        nextState.forEach(el => {
          const index = elements.value.findIndex(e => e.id === el.id);
          if (index !== -1) {
            const newProps = el.config;
            if (elements.value[index]) {
              const current = deepCloneElements([elements.value[index]])[0];
              if (current) currentStack.push(current);
              Object.assign(elements.value[index].config, newProps);
            }
          }
        });
        // 將當前狀態推入 history 堆疊
        historyStack.value.push(currentStack);
        clearSelection(); // 還原後清除選取
        isRestoring.value = false;
      }
    }
  }
  function recording(elements: ICanvasElement[]) {
    if (!advancedDefaults.undoRedoEnabled) return;
    // 如果是正在執行 undo/redo，則不記錄歷史
    if (isRestoring.value) {
      return;
    }
    // 將舊狀態（變化前的狀態）的深拷貝存入歷史紀錄
    // 使用 JSON.stringify 來做深拷貝和序列化
    const clone = deepCloneElements(elements);
    historyStack.value.push(clone);
    // 當有新的操作時，清空 redo 堆疊
    redoStack.value = [];

    // 可以設定歷史紀錄的上限，避免記憶體佔用過多
    if (historyStack.value.length > generalDefaults.undoRedoStackMax) {
      historyStack.value.shift(); // 移除最舊的紀錄
    }
  }

  /**
   * 上下撐滿
   */
  const elEqualStageHeight = () => {
    if (selectedElement.value && selectedElement.value.config) {
      const config = selectedElement.value.config as IImageConfig;
      config.height = stage.config.height || 1;
      config.y = config.height / 2;
    }
  }
  /**
   * 左右撐滿
   */
  const elEqualStageWidth = () => {
    console.log('elEqualStageWidth');
    if (selectedElement.value && selectedElement.value.config) {
      const config = selectedElement.value.config as IImageConfig;
      config.width = stage.config.width || 1;
      config.x = config.width / 2;
    }
  }
  /**
   * 預設選取屬性面板
   */
  const defaultPropsPanel = () => {
    const el = {
      id: Date.now(),
      type: ElementTypesEnum.Stage,
      name: 'stage',
      config: {
        width: stage.config.width,
        height: stage.config.height,
        x: 0,
        y: 0,
      }
    } as ICanvasElement;
    setSelectedOnce(el);
  }

  return {
    // State
    stage,
    imageList,
    originalImage,
    elements,
    selectedElements,
    editingElement,
    pageName,
    deleteIcon,
    savingImage,
    // Getters
    selectedElement,
    selectedIndex,
    rotationInDegrees,
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
    undo,
    redo,
    recording,
    elEqualStageWidth,
    elEqualStageHeight,
    defaultPropsPanel
  };
});
