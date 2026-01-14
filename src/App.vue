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
import StagePropsPanel from "./components/Panels/StagePropsPanel.vue";
import NNavbar from "@/components/Basic/NNavbar.vue";
import NavigationController from "@/components/Panels/MaterialPanel/NavigationController.vue";
import AuthenticationError from "@/components/Views/AuthenticationError.vue";
import NLoading from "@/components/Views/NLoading.vue";
import { useAuthStore } from "@/store/useAuthStore.ts";
import { getUrlParam } from "@/Utilities/urlHelper.ts";
import { useMainStore } from "@/store/useMainStore.ts";
import NComment from "@/components/Basic/NComment.vue";
import { AlertMessage } from "@/Utilities/AlertMessage.ts";
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

const selectedElement = computed(() => editorStore.selectedElement);

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
      <div class="content" :style="contentStyle">
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
          <LayersPanel class="layers-scroll scroll-bar-hidden" />
        </div>

        <div class="panel-properties props-panel">
          <StagePropsPanel
            v-if="selectedElement?.type === ElementTypesEnum.Stage"
            @update-element="handleUpdateElement"
          />
        </div>
      </div>
      <div class="app-version">v{{ mainStore.version }}</div>
      <el-button class="help-btn" @click="AlertMessage('要相信聖光', '噠噠')">
        <template #default>
          使用说明
        </template>
        <template #icon>
          <el-icon size="24">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.3171 20.5035C21.2555 20.9217 20.7166 21.2431 19.8374 21.2431H5.46175C4.98903 21.2431 4.60574 20.8538 4.60574 20.3738C4.60574 19.8937 4.98903 19.5045 5.46175 19.5045H19.8043C19.8043 19.5045 20.378 19.4561 20.8287 19.0055C21.2131 18.621 21.2962 17.5842 21.2962 16.9939V3.17109C21.2962 1.97211 20.3391 1.00018 19.1585 1.00018H5.1377C3.95706 1.00018 3 1.97211 3 3.17109V20.7872C3.00523 22.0104 3.98261 23.0006 5.18881 23.0006H19.1446C20.3537 23.0006 21.3334 22.0056 21.3334 20.7778C21.3334 20.6852 21.3276 20.5938 21.3165 20.5035H21.3171ZM4.58774 17.9369V3.39814C4.58774 2.99711 4.90773 2.67215 5.30263 2.67215H19.0749C19.4698 2.67215 19.7898 2.99711 19.7898 3.39814V17.0682C19.7898 17.4692 19.4698 17.7942 19.0749 17.7942H5.30844C4.69053 17.7942 4.58774 17.9369 4.58774 17.9369Z" fill="white"/>
              <path d="M11.0177 15.9865V14.0326H12.9916V15.9865H11.0177ZM11.2169 13.2029V12.4822C11.1826 11.4837 11.642 10.6362 12.5828 9.96389C13.4893 9.32872 13.9185 8.71714 13.8592 8.14449C13.7686 7.28698 13.282 6.83876 12.3708 6.77565C12.3464 6.77506 12.322 6.77447 12.2976 6.77447C11.2604 6.77447 10.6222 7.39431 10.3469 8.66878L10.3109 8.83568L8.54663 8.40339L8.57973 8.24415C9.01413 6.17292 10.308 5.12256 12.4254 5.12256C12.4939 5.12256 12.563 5.12374 12.6327 5.1261C14.5486 5.23225 15.6067 6.1853 15.7815 7.95871V7.96461C15.8518 9.07159 15.2228 10.0588 13.9115 10.9004C13.1606 11.377 12.811 11.9237 12.8418 12.573V12.5812V13.204H11.2169V13.2029Z" fill="white"/>
            </svg>
          </el-icon>
        </template>
        </el-button>
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

.content {
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
  width: 122px;
  max-height: calc(var(--panel-max-height, 100%) - 50px);
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
.help-btn {
  position: absolute;
  background-color: #f15624;
  color: white;
  font-weight: 700;
  font-size: 15px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  border: none;
  bottom: 0;
  right: 0;
  width: 163px;
  height: 46px;
  font-family: theme.$font-family;
  line-height: 100%;
  letter-spacing: 0;
  text-align: center;

}
</style>
