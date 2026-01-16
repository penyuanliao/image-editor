<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useEditorStore } from "@/store/editorStore.ts";
import { CanvasEditor } from "@/Utilities/CanvasEditor.ts";
import { type CroppedExportOptions, exportCroppedArea } from "@/Utilities/useCanvasExporter.ts";
import {
  ElementTypesEnum,
  type ICanvasElement,
  type ITextConfig,
  type StageConfig
} from "@/types.ts";
import Popover from "./Popover.vue";
import KeyboardController from "../Basic/KeyboardController.vue";
import Symbols from "@/components/Basic/Symbols.vue";
import { advancedDefaults, generalDefaults } from "@/config/settings.ts";
import NBaseScrollbar from "@/components/Basic/NBaseScrollbar.vue";
import NContextMenu from "@/components/EditorArea/NContextMenu.vue";
import NTextEditable from "@/components/Basic/NTextEditable.vue";
import NTextArea from "@/components/Basic/NTextArea.vue";
import NZoomControl from "@/components/Basic/NZoomControl.vue";
import { useMainStore } from "@/store/useMainStore.ts";
import { getUrlParam } from "@/Utilities/urlHelper.ts";
import UndoRedo from "@/components/EditorArea/UndoRedo.vue";
// import {uploadImage} from "@/api/uploader.ts";

const editorStore = useEditorStore();
const mainStore = useMainStore();

const emit = defineEmits(["element-selected"]);

const canvas = ref<HTMLCanvasElement | null>(null);
const wheelerRef = ref<HTMLDivElement | null>(null);
const uploaderContainer = ref<HTMLDivElement | null>(null);
const popOverRef = ref<InstanceType<typeof Popover> | null>(null);

const editor = ref<CanvasEditor>(new CanvasEditor(editorStore));

// 使用 SVG 建立一個白色的 'X' 圖示
const deleteIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>`;
// 將 SVG 轉為 Base64 Data URL，讓 Image 物件可以載入
editorStore.deleteIcon.src = `data:image/svg+xml;base64,${btoa(deleteIconSVG)}`;

// 裁切框的狀態
const cropBox = reactive(editor.value.cropBox);

const selectedElement = computed(() => {
  if (editorStore.selectedElements.length <= 0) return null;
  if (editorStore.selectedElements.length > 1) return null;
  return editorStore.selectedElements[0];
});

// --- 互動狀態管理 ---
const textInput = ref<HTMLInputElement | null>(null);
// 文字編輯狀態
const isComposing = ref<boolean>(false);

const textInputStyle = reactive(editor.value.textInputStyle);

// 右鍵選單狀態
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  element: null as ICanvasElement | null,
  wordPosition: { x: 0, y: 0 }
});
const contextMenuPosition = ref({
  top: 0,
  left: 0,
  bottom: 0,
  right: 0
} as DOMRect);

// PopOver選單狀態
const popOverMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  offset: {
    x: 0,
    y: -40
  }
});
onMounted(async () => {
  if (!canvas.value) return;

  const { viewport } = generalDefaults;
  const config = editorStore.stage.config as StageConfig;
  const width: number = config.width || viewport.width;
  const height: number = config.height || viewport.height;
  const color: string = config.color || viewport.color;
  const windowSize: { width: number; height: number } = {
    width: (uploaderContainer.value?.parentElement?.clientWidth || 800) - 40,
    height: (uploaderContainer.value?.parentElement?.clientHeight || 600) - 40
  };
  editor.value.viewport.width = windowSize.width;
  editor.value.viewport.height = windowSize.height;
  editor.value.setup(canvas.value, uploaderContainer.value);
  if (wheelerRef.value?.parentElement && advancedDefaults.zoomEnabled)
    editor.value.setupZoomView(wheelerRef.value.parentElement as HTMLDivElement);
  // 預設畫布大小
  editor.value.updateViewportSize(width, height, color);
  // 支援貼圖Ctrl+C和Ctrl+V
  editor.value.enableCopyAndPasteSupport();
  // 尺寸變更後需要重新繪製所有內容
  editor.value.render();

  // 設定右鍵選單的回呼函式
  editor.value.onContextMenu = (event, wordPosition) => {
    // 這邊目前拿來同步用
    contextMenuPosition.value = DOMRect.fromRect({
      x: event.x,
      y: event.y
    });
    contextMenu.visible = true; //!!(event.element); // 如果沒有點擊到物件目前不顯示選單
    contextMenu.x = event.x;
    contextMenu.y = event.y;
    contextMenu.element = event.element;
    contextMenu.wordPosition = wordPosition;
  };
  // 設定PopOver選單的回呼函式
  editor.value.onPopOverMenu = (event) => {
    popOverMenu.visible = advancedDefaults.popupMenu && (event.visible || false);
    if (popOverMenu.visible) {
      const screenCoords = editor.value.worldToScreen(event.x, event.y);
      popOverMenu.x = screenCoords.x + popOverMenu.offset.x;
      popOverMenu.y = screenCoords.y + popOverMenu.offset.y;
    }
  };
  // 設定文字編輯的回呼函式
  editor.value.onStartEditText = (element) => {
    editor.value.editingElement = element;
    nextTick(() => {
      minWidth.value = textInput.value?.offsetWidth || 0; // 記錄初始寬度
      textInput.value?.focus();
      updateTextareaSize(); // 初始設定大小
    });
  };
  editor.value.on("selectionChanged", (el) => {
    emit("element-selected", el);
  })
  window.addEventListener("click", closeContextMenu);
  window.addEventListener("resize", updateCanvasScale);
});
onUnmounted(() => {
  editor.value.destroy();
  window.removeEventListener("click", closeContextMenu);
  window.removeEventListener("resize", updateCanvasScale);
});

// --- Event Emitters and Watchers ---
// 選擇物件刷新畫面
watch(
  () => editorStore.selectedElement,
  (newSelection) => {
    // Deep copy to avoid downstream mutations affecting the original object
    emit(
      "element-selected",
      newSelection
    );
    editor.value.render();
    // popOverMenu.visible = (newSelection.length === 1);
  },
  { deep: true }
);

// 這邊檢查物件有異動就刷新畫面
watch(
  () => editorStore.elements,
  () => {
    editor.value.render();
    updateCanvasScale();
  },
  { deep: true }
);

watch(
  () => editorStore.originalImage,
  () => {
    if (editorStore.originalImage) {
      editor.value.updateViewportSize(
        editorStore.originalImage.width,
        editorStore.originalImage.height
      );
    }
    editor.value.resetCropMarks();
    editor.value.render(); // 進行初次繪製
  },
  { deep: true }
);

// 監聽裁切框的任何變更（來自拖曳或輸入框）
watch(
  editor.value.cropBox,
  () => {
    // 當 cropBox 變更時，先套用約束
    const wasConstrained = editor.value.constrainCropBox();

    // 如果值沒有被約束（表示值是有效的），則直接重繪
    // 如果值被約束了，此函式會被再次觸發，屆時 wasConstrained 會是 false，然後再重繪
    if (!wasConstrained) {
      editor.value.render();
      updateCanvasScale();
    }
  },
  { deep: true }
);

// --- 文字編輯狀態 ---
let minWidth = ref(0);

// --- 文字編輯方法 ---
const updateTextareaSize = () => {
  const textarea = textInput.value as any;
  if (!textarea || !editor.value.editingElement) return;
  editor.value.render(); // 刷新Canvas
  const { x, y, height, width } = editor.value.getEditingElementRect; // 重新取得位置大小
  textInputStyle.top = `${ y - 3 }px`;
  textInputStyle.left = `${ x }px`;
  textInputStyle.height = `${ height }px`;
  textInputStyle.width = `${ width }px`;
};

// --- 文字編輯方法 ---
const finishEditing = () => {
  if (isComposing.value) return;
  if (!editor.value.editingElement) return;
  // 如果編輯後文字為空，則移除該元素
  if ((editor.value.editingElement.config as ITextConfig).content.trim() === "") {
    editorStore.elements = editorStore.elements.filter(
      (el) => el.id !== editor.value.editingElement!.id
    );
  }
  minWidth.value = 0; // 重設
  editor.value.editingElement = null;
  editor.value.render();
};
//
const preview = async (blob: boolean = false) => {
  // 計算比例
  const scaleFactor = 1 / editor.value.artboardSize.scale;
  // 輸出圖片的 URL
  return await exportCroppedArea({
    store: editorStore,
    editorCanvas: canvas.value,
    cropBox: {
      x: cropBox.x,
      y: cropBox.y,
      width: cropBox.width,
      height: cropBox.height
    },
    scaleFactor,
    type: "image/png",
    color: editor.value.viewport.color,
    blob
  } as CroppedExportOptions);
};
// 儲存裁切後的圖片
const saveImage = async () => {
  const href = await preview() as string;
  const imageByBlob = await preview(true);
  if (href && imageByBlob instanceof Blob) {
    const filename = getUrlParam('filename') || "image.png";
    await mainStore.startUploadAndDownload(imageByBlob, href, filename);
  }
};
const handleUploadImage = async () => {
  const filename = getUrlParam('filename') || "image.png";
  const href = await preview() as string;
  const imageByBlob = await preview(true);
  if (imageByBlob instanceof Blob) {
    await mainStore.startUpload(imageByBlob, href, filename);
  } else {
    // 產生圖片失敗
  }

}
// --- 右鍵選單方法 ---
// 共用鍵盤快捷鍵參數
const handleContextMenuCommand = (action: string) => {
  switch (action) {
    case "delete":
      deleteSelectedElement();
      break;
    case "lock":
    case "unlock":
      if (contextMenu?.element?.config) {
        contextMenu.element.config.draggable = !contextMenu.element.config.draggable;
      }
      break;
    case "copy":
      editor.value.copy();
      break;
    case "paste":
      editor.value.paste(contextMenu.visible ? contextMenu.wordPosition : undefined);
      break;
    case "undo":
      editorStore.undo();
      editor.value.render();
      break;
    case "redo":
      editorStore.redo();
      editor.value.render();
      break;
    case "sec":
      editorStore.clearSelection();
      break;
    case "all":
      editorStore.setSelectedElements(editorStore.elements);
      break;
  }
};
// 關閉右鍵選單
const closeContextMenu = () => {
  contextMenu.visible = false;
};
// 右鍵點擊刪除
const deleteSelectedElement = () => {
  if (contextMenu.element) {
    editorStore.removeElements([contextMenu.element.id]);
    editor.value.render();
  }
  closeContextMenu();
};
const handlePopOverMenuChange = (state: string) => {
  const multiple: boolean = editorStore.selectedElements.length > 1;
  switch (state) {
    case "left":
      if (multiple) editor.value.align("left", null);
      else editor.value.stageAlign("left", null);
      break;
    case "center":
      if (multiple) {
        editor.value.align("center", null);
      } else {
        editor.value.stageAlign("center", null);
      }
      break;
    case "right":
      if (multiple) {
        editor.value.align("right", null);
      } else {
        editor.value.stageAlign("right", null);
      }
      break;
    case "delete":
      handleDeleteSelected();
      break;
  }
};

// --- 供外部呼叫的方法 ---
const addElement = async (element: ICanvasElement) => {
  await editor.value.addElement(element);
};
// 更新在這邊處理
const updateSelectedElement = (newProps: Partial<any>) => {
  if (newProps.type === ElementTypesEnum.Stage) {
    const config = newProps.config;
    editor.value.updateViewportSize(config.width, config.height, config.color);
    editor.value.render();
    return;
  }

  // Now updates all selected elements
  if (editorStore.selectedElements.length === 0) return;
  editorStore.selectedElements.forEach((element) => {
    Object.assign(element.config, newProps);
  });
  editor.value.render();
  // css載入字體包監聽是否完成
  document.fonts.ready.then(() => {
    editor.value.render();
  });
};
// 這邊處理對齊
const alignSelectedElement = (horizontal: string, vertical: string) => {
  if (editorStore.selectedElements.length === 1) {
    editor.value.stageAlign(horizontal, vertical);
  } else {
    editor.value.align(horizontal, vertical);
  }
};
// 更新畫面
const refresh = () => {
  editor.value.render();
};
// 更新畫布比例
const updateCanvasScale = () => {
  if (wheelerRef.value && wheelerRef.value.parentElement && editorStore.viewTranslate.autoScale) {
    const { clientWidth, clientHeight } = wheelerRef.value.parentElement;
    const scaleX = Math.min(1, clientWidth / editor.value.artboardSize.width);
    const scaleY = Math.min(1, clientHeight / editor.value.artboardSize.height);
    const scale = Math.min(scaleX, scaleY);
    if (scale < 1) editorStore.setScale(scale);
    else editorStore.setScale(1);
  }
  // 計算視窗大小
  const windowSize: { width: number; height: number } = {
    width: (uploaderContainer.value?.parentElement?.clientWidth || 800) - 40,
    height: (uploaderContainer.value?.parentElement?.clientHeight || 600) - 40
  };
  const { width, height } = editorStore.stage.config as StageConfig;
  // 由小至大時候需要拉大canvas
  if (
    windowSize.width > editor.value.viewport.width ||
    windowSize.height > editor.value.viewport.height
  ) {
    const offsetX = (windowSize.width - editor.value.viewport.width) / 2;
    const offsetY = (windowSize.height - editor.value.viewport.height) / 2;
    editor.value.viewport.width = windowSize.width;
    editor.value.viewport.height = windowSize.height;
    editor.value.updateViewportSize(width, height);
    editor.value.regulateElements(offsetX, offsetY);
    // !Issue: 需要處理Elements的物件相對定增加x, y
    editor.value.render();
  }
};

// --- 鍵盤事件處理 ---
// 鍵盤快捷鍵:刪除
const handleDeleteSelected = () => {
  const selectedIds = editorStore.selectedElements.map((el) => el.id);
  if (selectedIds.length > 0) {
    editorStore.removeElements(selectedIds);
    if (editor.value.hoveredElement && selectedIds.includes(editor.value.hoveredElement?.id)) {
      editor.value.hoveredElement = null;
    }
    editor.value.render();
  }
};
// 鍵盤快捷鍵:移動
const handleMoveSelected = ({ dx, dy }: { dx: number; dy: number }) => {
  if (editorStore.selectedElements.length > 0) {
    editorStore.selectedElements.forEach((el) => {
      el.config.x += dx;
      el.config.y += dy;
    });
    editor.value.render();
  }
};
// 鍵盤快捷鍵:文字編輯
const handleTextEditing = (type: string, action: string) => {
  if (editorStore.selectedElements.length > 0) {
    editorStore.selectedElements.forEach((el) => {
      if (type === el.type) {
        if (action === "bold") {
          const { fontWeight } = el.config as ITextConfig;
          (el.config as ITextConfig).fontWeight = fontWeight === "bold" ? "normal" : "bold";
        }
      }
    });
    editor.value.render();
  }
};

const handleHelpClick = () => {
  window.open(generalDefaults.helpUrl, "_blank");
}

watch(
  () => editorStore.viewTranslate.x,
  () => {
    editor.value.render();
  }
);
watch(
  () => editorStore.viewTranslate.y,
  () => {
    editor.value.render();
  }
);
watch(
  () => editorStore.viewTranslate.scale,
  () => {
    editor.value.render();
  }
);

defineExpose({
  addElement,
  updateSelectedElement,
  alignSelectedElement,
  refresh,
  updateCanvasScale,
  preview,
  saveImage
});
</script>

<template>
  <NBaseScrollbar
    ref="wheelerRef"
    v-bind:minX="editorStore.viewTranslate.minX"
    v-bind:maxX="editorStore.viewTranslate.maxX"
    v-bind:minY="editorStore.viewTranslate.minY"
    v-bind:maxY="editorStore.viewTranslate.maxY"
  >
    <div class="editor-wrapper">
      <!-- 鍵盤控制器，用於處理快捷鍵 -->
      <KeyboardController
        @delete-selected="handleDeleteSelected"
        @move-selected="handleMoveSelected"
        @text-editing="handleTextEditing"
        @ctrl-event="handleContextMenuCommand"
      />
      <div class="uploader-container" ref="uploaderContainer">
        <canvas
          ref="canvas"
          :style="{
            opacity: editorStore.elements.length === 0 ? 0 : 1,
            'pointer-events': editorStore.elements.length !== 0 ? 'auto' : 'none'
          }"
          :class="{
            'editor-canvas': true,
            'grid-white': generalDefaults.gridBackground === 'white',
            'grid-black-white': generalDefaults.gridBackground === 'blackAndWhite'
          }"
          class="editor-canvas grid"
        ></canvas>
        <NTextArea
            v-if="editor.editingElement && !advancedDefaults.textMultiColorEnabled"
            ref="textInput"
            v-model:content="(editor.editingElement.config as ITextConfig).content"
            :style="textInputStyle"
            @change="updateTextareaSize"
            @finish="finishEditing"
        />
        <NTextEditable
            v-if="editor.editingElement && advancedDefaults.textMultiColorEnabled"
            ref="textInput"
            v-model:content="(editor.editingElement.config as ITextConfig).content"
            v-model:text-segments="(editor.editingElement.config as ITextConfig).segments"
            :style="textInputStyle"
            @change="updateTextareaSize"
            @finish="finishEditing"
        />
        <!-- 快速選單 -->
        <div
          :style="{ transform: `translate(${popOverMenu.x}px, ${popOverMenu.y}px)` }"
          class="pop-over-menu"
          ref="popOverRef"
        >
          <Popover
            v-show="
              popOverMenu.visible &&
              (selectedElement?.type === ElementTypesEnum.Image ||
                editorStore.selectedElements.length > 1)
            "
            @change="handlePopOverMenuChange"
            @alignElement="alignSelectedElement"
          />
        </div>
        <div
          class="upload-prompt-overlay"
          :style="{
            opacity: editorStore.elements.length === 0 ? 1 : 0,
            'pointer-events': editorStore.elements.length === 0 ? 'auto' : 'none',
            width: `${editor.artboardSize.width}px`,
            height: `${editor.artboardSize.height}px`,
            top: `${(editor.viewport.height - editor.artboardSize.height) / 2}px`, // 計算垂直置中位置
            left: `${(editor.viewport.width - editor.artboardSize.width) / 2}px` // 計算水平置中位置
          }"
        >
          <div class="prompt-content">
            <div class="prompt-icon"><Symbols name="picture" /></div>
            <h1>{{ `开始制作 ${ editor.artboardSize.width }x${ editor.artboardSize.height } 广宣图` }}</h1>
            <p>
              选择背景&ensp;<span><Symbols name="arrow-right"/></span>&ensp;添加素材
              &ensp;<span><Symbols name="arrow-right"/></span>&ensp;编辑文字
              &ensp;<span><Symbols name="arrow-right"/></span>&ensp;完成存档
            </p>
          </div>
        </div>
      </div>
      <div class="undo-redo-warp" v-if="advancedDefaults.undoRedoEnabled">
        <UndoRedo />
      </div>
      <!-- 自訂右鍵選單 -->
      <NContextMenu
        v-model:position="contextMenuPosition"
        v-bind:lock="editorStore.selectedElement?.config.draggable"
        :visible="contextMenu.visible"
        :element="contextMenu.element"
        @command="handleContextMenuCommand"
      />
      <div class="control-bar">
        <div v-if="editorStore.elements.length !== 0" style="display: flex; flex-direction: row;">
          <el-button class="file-ctrl-btn" @click="handleUploadImage">
            <el-icon size="16">
              <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.50453 4C7.88274 4 8.19008 4.30835 8.19008 4.68686V11.4845L9.99171 9.66581L10.0259 9.64848C10.0449 9.63898 10.1466 9.59193 10.2904 9.59193C10.4218 9.59193 10.6183 9.63155 10.807 9.82061C11.1226 10.1368 10.983 10.5182 10.8651 10.6755L10.8556 10.6883L7.64914 13.9422C7.64914 13.9422 7.60011 14 7.50453 14C7.40895 14 7.36363 13.9422 7.36363 13.9422L4.14435 10.6883L4.13488 10.6755C4.01705 10.5182 3.87738 10.1368 4.19297 9.82061C4.38166 9.63155 4.57818 9.59193 4.7096 9.59193C4.85297 9.59193 4.95474 9.63898 4.97369 9.64848L5.00788 9.66581L6.81857 11.4936V4.68686C6.81857 4.30793 7.12633 4 7.50412 4H7.50453Z" fill="black"/>
                <path d="M11.9974 16H3.00336C1.34721 16 0 14.6528 0 12.9967V4.00328C0 2.34718 1.34721 1 3.00336 1H6.99584C7.37031 1 7.67405 1.30372 7.67405 1.67819C7.67405 2.05265 7.37031 2.35637 6.99584 2.35637H3.00336C2.09536 2.35637 1.35681 3.0949 1.35681 4.00288V12.9963C1.35681 13.9043 2.09536 14.6428 3.00336 14.6428H11.997C12.905 14.6428 13.6436 13.9043 13.6436 12.9963V8.30218C13.6436 7.92772 13.9473 7.62399 14.3218 7.62399C14.6963 7.62399 15 7.92772 15 8.30218V12.9963C15 14.6524 13.6528 15.9996 11.9966 15.9996L11.9974 16Z" fill="black"/>
                <path d="M12.5 0C10.5668 0 9 1.56722 9 3.5C9 5.43278 10.5672 7 12.5 7C14.4328 7 16 5.43278 16 3.5C16 1.56722 14.4332 0 12.5 0ZM14.1752 4.54355C14.3497 4.71811 14.3497 5.0006 14.1752 5.17474C14.0006 5.3493 13.7181 5.3493 13.544 5.17474L12.5004 4.13119L11.4569 5.17474C11.2823 5.3493 10.9998 5.3493 10.8257 5.17474C10.6511 5.00018 10.6511 4.71768 10.8257 4.54355L11.8692 3.5L10.8257 2.45645C10.6511 2.28189 10.6511 1.9994 10.8257 1.82526C11.0002 1.6507 11.2827 1.6507 11.4569 1.82526L12.5004 2.86881L13.544 1.82526C13.7185 1.6507 14.001 1.6507 14.1752 1.82526C14.3497 1.99982 14.3497 2.28232 14.1752 2.45645L13.1316 3.5L14.1752 4.54355Z" fill="#231815"/>
              </svg>
            </el-icon>
            <span>存擋關閉</span>
          </el-button>
          <el-button class="file-ctrl-btn" @click="saveImage">
            <el-icon size="16">
              <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.00212 1.99997C8.37309 1.99997 8.67497 2.30185 8.67497 2.67283L8.67497 8.14618L9.9882 6.82308L10.0322 6.80087C10.0593 6.7873 10.1593 6.74288 10.2983 6.74288C10.427 6.74288 10.6187 6.78113 10.8005 6.96251C11.1131 7.27508 10.9749 7.6514 10.8585 7.80687L10.8461 7.82332L8.19994 10.5032C8.16498 10.5419 8.09383 10.5851 8.0017 10.5851C7.90958 10.5851 7.8413 10.5419 7.80676 10.5032L5.15028 7.82332L5.13794 7.80687C5.02155 7.6514 4.88377 7.27508 5.19594 6.96251C5.37731 6.78113 5.56938 6.74288 5.69811 6.74288C5.83712 6.74288 5.93665 6.7873 5.96421 6.80087L6.00822 6.82308L7.32885 8.15399L7.32885 2.67283C7.32885 2.30185 7.63073 1.99997 8.0017 1.99997L8.00212 1.99997Z" fill="black"/>
                <path d="M3.25628 15C1.46052 15 0 13.5544 0 11.7771V7.68354C0 7.3066 0.30977 7 0.690615 7C1.07146 7 1.38123 7.3066 1.38123 7.68354V11.7746C1.38123 12.7237 2.16141 13.4963 3.12071 13.4963H12.7922C13.7996 13.4963 14.6188 12.6851 14.6188 11.6884V7.68354C14.6188 7.3066 14.9285 7 15.3094 7C15.6902 7 16 7.3066 16 7.68354V11.5794C16 13.4658 14.4495 15 12.544 15H3.25628Z" fill="black"/>
              </svg>
            </el-icon>
            <span>存擋下載</span>
          </el-button>
        </div>

        <div class="zoom-controls">
          <NZoomControl  class="zoom" v-if="advancedDefaults.zoomEnabled && editorStore.elements.length !== 0" :visible="generalDefaults.zoomControlVisible"/>
          <el-button class="help-btn" @pointerup="handleHelpClick">
            <template #default>
              使用说明
            </template>
            <template #icon>
              <el-icon size="24">
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.3171 20.5035C21.2555 20.9217 20.7166 21.2431 19.8374 21.2431H5.46175C4.98903 21.2431 4.60574 20.8538 4.60574 20.3738C4.60574 19.8937 4.98903 19.5045 5.46175 19.5045H19.8043C19.8043 19.5045 20.378 19.4561 20.8287 19.0055C21.2131 18.621 21.2962 17.5842 21.2962 16.9939V3.17109C21.2962 1.97211 20.3391 1.00018 19.1585 1.00018H5.1377C3.95706 1.00018 3 1.97211 3 3.17109V20.7872C3.00523 22.0104 3.98261 23.0006 5.18881 23.0006H19.1446C20.3537 23.0006 21.3334 22.0056 21.3334 20.7778C21.3334 20.6852 21.3276 20.5938 21.3165 20.5035H21.3171ZM4.58774 17.9369V3.39814C4.58774 2.99711 4.90773 2.67215 5.30263 2.67215H19.0749C19.4698 2.67215 19.7898 2.99711 19.7898 3.39814V17.0682C19.7898 17.4692 19.4698 17.7942 19.0749 17.7942H5.30844C4.69053 17.7942 4.58774 17.9369 4.58774 17.9369Z" fill="white"/>
                  <path d="M11.0177 15.9865V14.0326H12.9916V15.9865H11.0177ZM11.2169 13.2029V12.4822C11.1826 11.4837 11.642 10.6362 12.5828 9.96389C13.4893 9.32872 13.9185 8.71714 13.8592 8.14449C13.7686 7.28698 13.282 6.83876 12.3708 6.77565C12.3464 6.77506 12.322 6.77447 12.2976 6.77447C11.2604 6.77447 10.6222 7.39431 10.3469 8.66878L10.3109 8.83568L8.54663 8.40339L8.57973 8.24415C9.01413 6.17292 10.308 5.12256 12.4254 5.12256C12.4939 5.12256 12.563 5.12374 12.6327 5.1261C14.5486 5.23225 15.6067 6.1853 15.7815 7.95871V7.96461C15.8518 9.07159 15.2228 10.0588 13.9115 10.9004C13.1606 11.377 12.811 11.9237 12.8418 12.573V12.5812V13.204H11.2169V13.2029Z" fill="white"/>
                </svg>
              </el-icon>
            </template>
          </el-button>
        </div>
      </div>
      <div v-if="editor.isRotating" class="rotation">{{ `${editorStore.rotationInDegrees}°` }}</div>
    </div>
  </NBaseScrollbar>
</template>

<style scoped lang="scss">
@use "@/styles/theme";
.editor-wrapper {
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  position: relative;
}
.control {
  position: absolute;
  display: flex;
  pointer-events: none;
}
.uploader-container {
  position: relative;
  display: flex;
  border-radius: 20px;
  width: 800px;
  height: 600px;
  //max-height: 600px;
  flex-shrink: 0;

  min-height: 50px; /* 避免過度縮小 */
  //transition: all 0.3s ease;
  //transform-origin: 0 0;
}
.editor-canvas {
  width: 100%;
  height: 100%;
  display: block;
  cursor: default;
}
.grid-black-white {
  background-color: #ccc;
  background-image:
    linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff),
    linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff);
  background-size: 20px 20px;
  background-position:
    0 0,
    10px 10px;
}
.grid-white {
  background-color: #fff;
  background-image:
    linear-gradient(to right, #eee 1px, transparent 1px),
    linear-gradient(to bottom, #eee 1px, transparent 1px);
  background-size: 20px 20px; /* 每個格子的尺寸 */
}

.upload-prompt-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  background-color: #d9d9d9;
  transition: opacity 0.3s;
  border-radius: 20px;
  /* 1. 將此元素定義為一個尺寸查詢容器，'size' 允許查詢寬度和高度 */
  container-type: size;
  container-name: prompt-overlay;
}

.prompt-content {
  text-align: center;
  color: #666;
  position: relative;
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  p {
    word-wrap: break-word;
    white-space: break-spaces;
    margin-top: 0;
  }
  h1 {
    margin-top: 0;
    margin-bottom: 0;
  }
  .prompt-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80px;
    height: 80px;
    flex-shrink: 1;
    min-height: 20px;
    padding-top: 10px;
  }
}

/* 2. 當名為 'prompt-overlay' 的容器高度小於 165px 時，套用此樣式 */
@container prompt-overlay (max-height: 171px) {
  .prompt-content {
    flex-direction: row;
    gap: 20px;
    p {
      white-space: nowrap;
      margin-bottom: 0;
    }
    .prompt-icon {
      padding-top: 0;
    }
  }
}
.actions-bar {
  position: absolute;
  top: 200px;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  transition: opacity 0.3s;
  border-radius: 20px;
  /* 1. 將此元素定義為一個尺寸查詢容器，'size' 允許查詢寬度和高度 */
}
.control-bar {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  z-index: 10;
  bottom: 10px;
  cursor: default;
  width: calc(100% - 4px);
  flex-direction: column;
}

.file-ctrl-btn {
  width: 146px;
  height: 50px;
  padding: 10px 20px;
  border: none;
  background-color: #78efb2;
  border-radius: 40px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: black;
  font-weight: 700;
  font-size: 15px;
}

.file-ctrl-btn:hover {
  background-color: #95d475;
}
.zoom-controls {
  position: relative;
  display: flex;
  height: 44px;
  width: 100%;
  justify-content: right;
  //background-color: white;
  border-radius: 999px;
  align-items: center;
  padding-left: 10px;
  padding-right: 10px;
  gap: 45px;
  .zoom {
    position: relative;
    bottom: -10px;
    max-width: 316px;
    min-width: 100px;
  }
  .help-btn {
    position: relative;
    background-color: #f15624;
    color: white;
    font-weight: 700;
    font-size: 15px;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    border: none;
    bottom: -10px;
    right: 8px;
    width: 163px;
    height: 46px;
    font-family: theme.$font-family;
    line-height: 100%;
    letter-spacing: 0;
    text-align: center;
  }
}

.context-menu {
  position: fixed; /* 使用 fixed 定位，相對於視窗 */
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 5px 0;
}

.context-menu-item {
  padding: 8px 15px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.context-menu-item:hover {
  background-color: #f0f0f0;
}

.filename {
  position: absolute;
  display: flex;
  top: -20px;
  left: 0;
  right: 0;
  color: black;
}

.pop-over-menu {
  position: fixed;
  display: flex;
  min-width: 40px;
  min-height: 36px;
  flex-direction: row;
}
.rotation {
  position: fixed; /* 使用 fixed 定位，相對於視窗 */
  display: flex;
  background-color: black;
  border: 1px solid #ccc;
  border-radius: 4px;
  z-index: 1000;
  padding: 1px 5px 3px 5px;
  opacity: 0.7;
  min-width: 30px;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}
.undo-redo-warp {
  position: absolute;
  top: 0;
  left: 23px;
}
</style>
