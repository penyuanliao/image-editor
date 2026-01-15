<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from "vue";
import { ElementTypesEnum, type ICanvasElement, BoxBarTypes, type IUploadedImage } from "./types";
import BoxBar from "./components/BoxBar.vue";
import TextPanel from "./components/Panels/TextPanel.vue";
import UploadPanel from "./components/Panels/UploadPanel.vue";
import LayersPanel from "./components/Panels/LayersPanel.vue";
import DropZone from "./components/Basic/DropZone.vue"; // 引入新的 DropZone 元件
import { useEditorStore } from "./store/editorStore.ts";
import ImagePropsPanel from "./components/Panels/ImagePropsPanel.vue";
import EditorView from "./components/EditorArea/EditorView.vue";
import { processFile } from "./Utilities/FileProcessor.ts";
import { CreateImageElement } from "./Utilities/useCreateCanvasElement.ts";
import NNavbar from "@/components/Basic/NNavbar.vue";
import NavigationController from "@/components/Panels/MaterialPanel/NavigationController.vue";
import AuthenticationError from "@/components/Views/AuthenticationError.vue";
import NLoading from "@/components/Views/NLoading.vue";
import { useAuthStore } from "@/store/useAuthStore.ts";
import { getUrlParam } from "@/Utilities/urlHelper.ts";
import { useMainStore } from "@/store/useMainStore.ts";
import NComment from "@/components/Basic/NComment.vue";
const editorStore = useEditorStore();

const authStore = useAuthStore();

const mainStore = useMainStore();

// 素材編輯器view
const editor = ref<InstanceType<typeof EditorView> | null>(null);
// 目前Panel選擇狀態
const selected = ref<string>();
// 左邊選單編號
const boxBarSelectedIndex = ref<number>(0);
// 開啟上傳
const showUpload = ref<boolean>(false);

const panelMaxHeight = ref(window.innerHeight - 80 - 22);

// State to hold the currently selected element from the canvas
const selectedElementForPanel = ref<any | null>(null);

const handleAddElement = (element: any) => {
  if (element) {
    editor.value?.addElement(element);
  }
};
const handleUploadElement = (element: any) => {
  if (element) {
    editor.value?.addElement(element);
  }
};
const handleUploadElementCompleted = () => {
  showUpload.value = false;
};

const boxItemClickHandle = (value: string) => {
  if (value === BoxBarTypes.upload) {
    showUpload.value = true;
    return;
  }

  if (selected.value === value) selected.value = "";
  else selected.value = value;
};

// Handler for when an element is selected on the canvas
const handleElementSelected = (element: ICanvasElement | null) => {
  selectedElementForPanel.value = element;
  if (!element) {
    selected.value = BoxBarTypes.image;
    return;
  }
  switch (element.type) {
    case ElementTypesEnum.Text:
      selected.value = BoxBarTypes.textEdit;
      boxBarSelectedIndex.value = -1;
      break;
    case ElementTypesEnum.Image:
      selected.value = BoxBarTypes.imageEdit;
      boxBarSelectedIndex.value = -1;
      break;
    default:
      selected.value = BoxBarTypes.image;
  }
};

// Handler for when the text panel wants to update the selected element
const handleUpdateElement = (newProps: Partial<ICanvasElement>) => {
  editor.value?.updateSelectedElement(newProps);
};
const handleAlignElement = (hAlign: string, vAlign: string) => {
  console.log("alignSelectedElement", hAlign, vAlign);
  editor.value?.alignSelectedElement(hAlign, vAlign);
};
const handleRefresh = () => {
  editor.value?.refresh();
};

const handleAddRecentlyImage = (info: IUploadedImage) => {
  const newImageElement: ICanvasElement = CreateImageElement(info);
  handleAddElement(newImageElement);
};

// 處理從 DropZone 元件傳來的檔案
const handleFilesDropped = async (files: FileList) => {
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file) {
        const info = await processFile(file);
        handleAddRecentlyImage(info);
      }
    }
  }
};

const handlePointerUp = (event: PointerEvent) => {
  event.preventDefault();
  if (
    editorStore.selectedElement?.type !== ElementTypesEnum.Stage &&
    editorStore.selectedElements &&
    editorStore.selectedElements.length !== 0
  ) {
    editorStore.saveHistory();
    editorStore.clearSelection();
  }
};

const updatePanelHeight = () => {
  panelMaxHeight.value = window.innerHeight - 80 - 22; // 80 for navbar, 22 for content padding-top
};
// ---- Style ---- //

const contentStyle = computed(() => {
  return {
    "--panel-max-height": `${panelMaxHeight.value}px`
  };
});

onMounted(async () => {
  window.addEventListener("resize", updatePanelHeight);

  mainStore.initialization();

  await mainStore.startLogin();

  // 3. 進行相關參數初始化
  // 3-1. 設定畫布寬高大小
  const width = Number.parseInt(getUrlParam("width"));
  const height = Number.parseInt(getUrlParam("height"));
  if (width > 0 && height > 0) editorStore.setCanvasSize(width, height);
  editorStore.defaultPropsPanel();
});

onUnmounted(() => {
  window.removeEventListener("resize", updatePanelHeight);
});

watch(selected, async () => {
  // 等待 DOM 更新 (sidebar 寬度變化) 完成
  await nextTick();
  // 然後再呼叫 updateCanvasScale，此時它會讀取到正確的 editor-area 寬度
  setTimeout(() => editor.value?.updateCanvasScale(), 200);
});
</script>

<template>
  <NLoading v-if="mainStore.state === 'loading'" />
  <AuthenticationError v-if="mainStore.state === 'denied'" />
  <!-- 使用 DropZone 元件並監聽 files-dropped 事件 -->
  <DropZone
    v-if="mainStore.state === 'completed'"
    class="drop-zone-wrapper"
    @files-dropped="handleFilesDropped"
  >
    <div class="main-container">
      <NNavbar v-bind:marqueeText="mainStore.marqueeText" />
      <div class="main-content" :style="contentStyle">
        <div :class="{ sidebar: true, 'open': selected !== '', 'close': selected === '' }">
          <BoxBar v-model:selected="boxBarSelectedIndex" @boxItemClick="boxItemClickHandle" />
          <div class="sidebar-content">
            <TextPanel
              v-if="selected === BoxBarTypes.text"
              :controlEnabled="false"
              @add-element="handleAddElement"
              @update-element="handleUpdateElement"
            />
            <NavigationController
              v-show="selected === BoxBarTypes.image"
              @add-element="handleAddElement"
              @addRecentlyImage="handleAddRecentlyImage"
            />
            <UploadPanel
              v-if="showUpload"
              @add-element="handleUploadElement"
              @completed="handleUploadElementCompleted"
            />

            <TextPanel
              v-if="selected === BoxBarTypes.textEdit"
              :controlEnabled="true"
              @add-element="handleAddElement"
              @update-element="handleUpdateElement"
            />
            <ImagePropsPanel
              v-if="selected === BoxBarTypes.imageEdit"
              @align-element="handleAlignElement"
              @refresh="handleRefresh"
            />
          </div>
        </div>
        <div class="editor-area" @pointerup.self="handlePointerUp">
          <EditorView ref="editor" @element-selected="handleElementSelected" />
          <LayersPanel class="layers-scroll scroll-bar-hidden" :visible="mainStore.layersVisible"/>
        </div>
      </div>
      <div class="app-version">v{{ mainStore.version }}</div>

    </div>
  </DropZone>
  <NComment v-model:visible="mainStore.commentVisible" :name="authStore.userInfo.username"></NComment>
</template>

<style scoped lang="scss">
@use "styles/theme";

.main-container {
  display: flex;
  position: relative;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  width: 100vw;
}

.sidebar {
  width: 420px;
  position: relative;
  display: flex;
  min-width: var(--box-bar-width);
  overflow: hidden;
  box-shadow: 0 3px 3px 0 #d9d9d9;
  background-color: theme.$primary-color;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  transition: width 0.2s ease;

  &.open {
    width: calc(335px + var(--box-bar-width));
  }
  &.close {
    width: var(--box-bar-width);
  }

  .sidebar-content {
    width: calc(100% - var(--box-bar-width));
    position: relative;
    display: flex;
  }
}

.main-content {
  display: grid;
  grid-template-columns: auto 1fr auto; /* 左側面板 240px，右側佔滿剩餘空間 */
  width: 100%;
  flex: 1; /* 讓 content 區塊填滿父容器的剩餘空間 */
  position: relative;
  min-height: 0;
  padding-top: 22px;
}

.editor-area {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden; /* 如果編輯器太大，允許滾動 */
  flex-shrink: 0;
}

.drop-zone-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative; /* 確保內部元素定位正確 */
}
.layers-scroll {
  position: absolute;
  display: flex;
  top: 0;
  right: 14px;
  width: 93px;
  max-height: calc(var(--panel-max-height, 100%) - 70px);
  overflow: auto;
  justify-content: center;
  padding: 5px 5px;
}

.panel-properties {
  position: relative;
  display: flex;
  max-width: 330px;
  min-width: 330px;
  height: var(--panel-max-height, 100%);
  flex-direction: column;
}

.props-panel {
  background-color: theme.$primary-color;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: -1px 3px 3px 0 #d9d9d9;
  display: none;
}

.app-version {
  position: absolute;
  bottom: 5px;
  left: 10px;
  font-size: 12px;
  color: #aaa;
  z-index: 1000; /* 確保在最上層 */
}

</style>
