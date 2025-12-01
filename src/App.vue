<script setup lang="ts">
import {computed, onMounted, ref, watch, nextTick} from 'vue';
import {ElementTypesEnum, type ICanvasElement, BoxBarTypes} from "./types";
import BoxBar from "./components/BoxBar.vue";
import TextPanel from "./components/Panels/TextPanel.vue";
import StickersPanel from "./components/Panels/StickersPanel.vue";
import UploadPanel from "./components/Panels/UploadPanel.vue";
import LayersPanel from "./components/Panels/LayersPanel.vue";
import DropZone from "./components/Basic/DropZone.vue"; // 引入新的 DropZone 元件
import {useEditorStore} from "./store/editorStore.ts";
import ImagePropsPanel from "./components/Panels/ImagePropsPanel.vue";
import EditorView from "./components/EditorArea/EditorView.vue";
import {processFile} from "./Utilities/FileProcessor.ts";
import {CreateImageElement} from "./Utilities/useCreateCanvasElement.ts";
import StagePropsPanel from "./components/Panels/StagePropsPanel.vue";
import NNavbar from "@/components/Basic/NNavbar.vue";

const editorStore = useEditorStore();
const editor = ref<InstanceType<typeof EditorView> | null>(null);
const selected = ref<string>();
const version = __APP_VERSION__;
const mainContainer = ref<HTMLDivElement|null>(null);
// State to hold the currently selected element from the canvas
const selectedElementForPanel = ref<any | null>(null);
const handleAddElement = (element: any) => {
  if (element) {
    editor.value?.addElement(element);
  }
};

const boxItemClickHandle = (value: string) => {
  if (selected.value === value) selected.value = '';
  else selected.value = value;
};

// Handler for when an element is selected on the canvas
const handleElementSelected = (element: ICanvasElement | null) => {
  selectedElementForPanel.value = element;
};

// Handler for when the text panel wants to update the selected element
const handleUpdateElement = (newProps: Partial<ICanvasElement>) => {
  editor.value?.updateSelectedElement(newProps);
};
const handleAlignElement = (hAlign: string, vAlign: string) => {
  console.log('alignSelectedElement', hAlign, vAlign);
  editor.value?.alignSelectedElement(hAlign, vAlign);
}
const handleRefresh = () => {
  editor.value?.refresh();
}

const selectedElement = computed(() => editorStore.selectedElement);

// 處理從 DropZone 元件傳來的檔案
const handleFilesDropped = async (files: FileList) => {
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file) {
        const info = await processFile(file);
        editorStore.addImage(info);
        const newImageElement: ICanvasElement = CreateImageElement(info);
        handleAddElement(newImageElement);
      }
    }
  }
};
const mainStyle = computed(() => {
  // console.log(window.innerHeight);
  return {
    '--panel-max-height': `${window.innerHeight - 80 - 21}px`
  }
});
onMounted(() => {
  window.addEventListener('resize', () => {
    mainContainer.value?.style.setProperty('--panel-max-height', `${window.innerHeight - 80 - 21}px`);
  });
  editorStore.defaultPropsPanel();
})
const handlePointerUp = (event: PointerEvent) => {
  event.preventDefault();
  if (editorStore.selectedElement?.type !== ElementTypesEnum.Stage &&
      editorStore.selectedElements && editorStore.selectedElements.length !== 0) {
    editorStore.saveHistory();
    editorStore.clearSelection();
  }
}
const styleSidebar = computed(() => {
  return {
    width: selected.value !== '' ? '420px' : '85px'
  }
});

watch(selected, async () => {
  // 等待 DOM 更新 (sidebar 寬度變化) 完成
  await nextTick();
  // 然後再呼叫 updateCanvasScale，此時它會讀取到正確的 editor-area 寬度
  setTimeout(() => editor.value?.updateCanvasScale(), 200); //
});
</script>

<template>
  <!-- 使用 DropZone 元件並監聽 files-dropped 事件 -->
  <DropZone class="drop-zone-wrapper" @files-dropped="handleFilesDropped">
    <div
        class="main-container"
        ref="mainContainer"
        :style="mainStyle"
    >
      <NNavbar/>
      <div class="content">
        <div
            class="sidebar"
            :style="styleSidebar">
          <BoxBar @boxItemClick="boxItemClickHandle"/>
          <div class="sidebar-content">
            <TextPanel
                v-if="selected === BoxBarTypes.text"
                :controlEnabled="false"
                @add-element="handleAddElement"
                @update-element="handleUpdateElement"
            />
            <StickersPanel
                v-show="selected === BoxBarTypes.sticker"
                @add-element="handleAddElement"
            />
            <UploadPanel
                v-if="selected === BoxBarTypes.upload"
                @add-element="handleAddElement"
            />
          </div>
        </div>
        <div class="editor-area">
          <div class="editor-area" @pointerup.self="handlePointerUp">
            <EditorView
                ref="editor"
                @element-selected="handleElementSelected"
            />
          </div>
          <div class="layers">
            <LayersPanel/>
          </div>
        </div>

        <div class="panel-properties props-panel">
          <StagePropsPanel
              v-if="selectedElement?.type === ElementTypesEnum.Stage"
              @update-element="handleUpdateElement"
          />
          <TextPanel
              v-if="selectedElement?.type === ElementTypesEnum.Text"
              :controlEnabled="true"
              @add-element="handleAddElement"
              @update-element="handleUpdateElement"
          />
          <ImagePropsPanel
              v-if="selectedElement?.type === ElementTypesEnum.Image"
              @align-element="handleAlignElement"
              @refresh="handleRefresh"
          />
        </div>
      </div>
      <div class="app-version">v{{ version }}</div>
    </div>
  </DropZone>
</template>

<style scoped lang="scss">
@use 'styles/theme';

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
  height: var('--panel-max-height', 300px);
  max-height: var(--panel-max-height, 300px);
  position: relative;
  display: flex;
  min-width: 85px;
  overflow: hidden;
  box-shadow: 0 3px 3px 0 #D9D9D9;
  background-color: theme.$primary-color;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  transition: width 0.2s ease;

  .sidebar-content {
    width: 100%;
    position: relative;
    display: flex;
    max-height: var(--panel-max-height, 300px);
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
  overflow: auto; /* 如果編輯器太大，允許滾動 */
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

.layers {
  position: absolute;
  display: flex;
  top: 0;
  right: 14px;
  width: 112px;
  min-height: 0;
  border-radius: 20px;
  background-color: theme.$panel-background-color;
  box-shadow: 0 3px 3px 0 theme.$shadow-color;
  justify-content: center;
  align-items: center;
  overflow: hidden;
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
  box-shadow: -1px 3px 3px 0 #D9D9D9;
}

.app-version {
  position: absolute;
  bottom: 5px;
  right: 10px;
  font-size: 12px;
  color: #aaa;
  z-index: 1000; /* 確保在最上層 */
}

</style>
