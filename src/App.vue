<script setup lang="ts">
import {computed, ref} from 'vue';
import {ElementTypesEnum, type ICanvasElement, ImageEditorTypes} from "./types";
import BoxBar from "./components/BoxBar.vue";
import AIPanel from "./components/Panels/AIPanel.vue";
import TextPanel from "./components/Panels/TextPanel.vue";
import StickersPanel from "./components/Panels/StickersPanel.vue";
import UploadPanel from "./components/Panels/UploadPanel.vue";
import LayersPanel from "./components/Panels/LayersPanel.vue";
import DropZone from "./components/DropZone.vue"; // 引入新的 DropZone 元件
import { useImagesStore } from "./store/images";
import ImagePropsPanel from "./components/Panels/ImagePropsPanel.vue";
import EditorView from "./components/EditorArea/EditorView.vue";
import { processFile } from "./Utilities/FileProcessor.ts";
import {CreateImageElement} from "./Utilities/useCreateCanvasElement.ts";
import StagePropsPanel from "./components/Panels/StagePropsPanel.vue";
const imagesStore = useImagesStore();
const editor = ref<InstanceType<typeof EditorView> | null>(null);
const selected = ref<string>('');

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

const selectedElement = computed(() => {
  if (imagesStore.selectedElements.length <= 0) return null;
  if (imagesStore.selectedElements.length > 1) return null;
  return imagesStore.selectedElements[0];
})

// 處理從 DropZone 元件傳來的檔案
const handleFilesDropped = async (files: FileList) => {
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file) {
        const info = await processFile(file);
        imagesStore.addImage(info);
        const newImageElement: ICanvasElement = CreateImageElement(info);
        handleAddElement(newImageElement);
      }
    }
  }
};
const mainStyle = computed(() => {
  console.log(window.innerHeight);
  return {
    '--panel-max-height': `${window.innerHeight - 80 - 21}px`
  }
});

</script>

<template>
  <div
      class="main-container"
      :style="mainStyle"
  >
    <div class="navbar">
      <img src="./assets/icons/logo.png" alt="Logo" class="logo">
      <div class="layers-btn">
        <div class="icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.8243 1.017C11.7082 1.03963 11.5969 1.08543 11.4968 1.15054L1.44462 7.70952C1.43773 7.71614 1.43084 7.72276 1.42395 7.72939C1.3752 7.76856 1.33068 7.81271 1.2904 7.86072C1.24376 7.90266 1.20189 7.94956 1.16426 7.99978C1.1579 8.00695 1.15154 8.01413 1.14518 8.0213C1.1224 8.07096 1.10332 8.12228 1.08901 8.17471C1.06145 8.2321 1.03972 8.29169 1.02382 8.3535C1.0164 8.41696 1.01428 8.48097 1.01852 8.54498C1.01428 8.60899 1.0164 8.673 1.02382 8.73646C1.04025 8.79827 1.06198 8.85786 1.08901 8.91525C1.10332 8.96823 1.1224 9.01955 1.14518 9.06866C1.15154 9.07584 1.1579 9.08301 1.16426 9.09018C1.20189 9.14095 1.24429 9.1873 1.2904 9.22924C1.33068 9.27725 1.37573 9.3214 1.42395 9.36058C1.43084 9.3672 1.43773 9.37437 1.44462 9.38044L11.4968 15.9394C11.8047 16.1403 12.1953 16.1403 12.5032 15.9394L22.5554 9.38044C22.5676 9.37161 22.5798 9.36278 22.5914 9.3534C22.5978 9.34844 22.6041 9.34402 22.6105 9.33906C22.7064 9.26677 22.788 9.17627 22.8516 9.07252C22.8527 9.07142 22.8543 9.06977 22.8553 9.06866C22.8649 9.05155 22.8739 9.0339 22.8824 9.01624C22.8935 8.99582 22.9041 8.9754 22.9142 8.95443C22.9232 8.93291 22.9311 8.91084 22.9386 8.88877C22.947 8.86669 22.9545 8.84517 22.9613 8.82255C22.9672 8.79992 22.9719 8.7773 22.9762 8.75412C22.9815 8.73095 22.9863 8.70777 22.99 8.68459C22.9926 8.66142 22.9942 8.63879 22.9953 8.61561C22.9974 8.59189 22.999 8.56816 22.9995 8.54443C22.9995 8.5207 22.9974 8.49697 22.9953 8.47324C22.9942 8.45007 22.9921 8.42689 22.99 8.40427C22.9863 8.38109 22.9815 8.35791 22.9762 8.33474C22.9719 8.31156 22.9666 8.28893 22.9613 8.26631C22.9545 8.24424 22.947 8.22216 22.9386 8.20009C22.9311 8.17802 22.9232 8.15594 22.9142 8.13442C22.9041 8.11345 22.8935 8.09249 22.8824 8.07262C22.8739 8.05496 22.8649 8.0373 22.8559 8.0202C22.8548 8.01854 22.8532 8.01744 22.8522 8.01633C22.7886 7.91259 22.7064 7.82209 22.611 7.7498C22.6047 7.74484 22.5983 7.73987 22.5919 7.73546C22.5803 7.72607 22.5681 7.71725 22.5559 7.70842L12.5032 1.15054C12.3013 1.01866 12.0586 0.971202 11.8243 1.017ZM11.9997 3.15146L20.2669 8.54608L11.9997 13.9407L3.73255 8.54553L11.9997 3.15146ZM2.10551 11.0817C1.72763 11.0155 1.34817 11.1926 1.14465 11.5309C0.866944 11.9928 1.00103 12.6014 1.44462 12.8911L11.4968 19.4501C11.8047 19.651 12.1953 19.651 12.5032 19.4501L22.5554 12.8911C22.999 12.602 23.1331 11.9928 22.8553 11.5309C22.5776 11.069 21.9925 10.9294 21.5489 11.2186L12.0003 17.4492L2.45106 11.2186C2.34559 11.1496 2.22794 11.1032 2.10551 11.0817ZM2.10551 14.4809C1.72763 14.4147 1.34817 14.5919 1.14465 14.9301C0.866944 15.392 1.00103 16.0007 1.44462 16.2904L11.4968 22.8494C11.8047 23.0502 12.1953 23.0502 12.5032 22.8494L22.5554 16.2904C22.999 16.0012 23.1331 15.392 22.8553 14.9301C22.5776 14.4683 21.9925 14.3286 21.5489 14.6178L12.0003 20.8484L2.45106 14.6178C2.34559 14.5488 2.22794 14.5025 2.10551 14.4809Z" fill="black"/>
          </svg>
        </div>
        <span class="text">图层</span>
      </div>
    </div>

    <div class="content">
      <div
          class="sidebar"
          :style="{
            width: selected !== '' ? '420px' : '85px'
          }"
      >
        <BoxBar @boxItemClick="boxItemClickHandle"/>
        <div class="sidebar-content">
          <AIPanel v-if="selected === ImageEditorTypes.star"/>
          <TextPanel
              v-if="selected === ImageEditorTypes.text"
              :controlEnabled="false"
              @add-element="handleAddElement"
              @update-element="handleUpdateElement"
          />
          <StickersPanel
              v-if="selected === ImageEditorTypes.sticker"
              @add-element="handleAddElement"
          />
          <UploadPanel
              v-if="selected === ImageEditorTypes.upload"
              @add-element="handleAddElement"
          />
        </div>
      </div>
      <div class="editor-area">
        <!-- 使用新的 DropZone 元件並監聽 files-dropped 事件 -->
        <DropZone class="drop-zone-wrapper" @files-dropped="handleFilesDropped">
          <EditorView
              ref="editor"
              @element-selected="handleElementSelected"
          />
          <div class="layers">
            <LayersPanel/>
          </div>
        </DropZone>
      </div>
      <div class="panel-properties props-panel" :style="{
        visibility: selectedElement != null ? 'visible' : 'visible'
      }">
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
        />
      </div>
    </div>
  </div>
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
}
.navbar {
  width: 100%;
  height: 80px;
  min-height: 80px;
  position: relative;
  display: flex;
  align-items: center;
  //grid-template-columns: 1fr 330px;
  background-color: white;
  border-bottom: 1px solid theme.$border-color-base;
  align-items: center;
  .logo {
    width: 150px;
    object-fit: contain;
    padding-left: 32px;
    padding-right: 32px;
  }
}
.sidebar {
  width: 420px;
  height: var(--panel-max-height, 100%);
  position: relative;
  display: flex;
  min-width: 85px;
  overflow: hidden;
  box-shadow: 0 3px 3px 0 #D9D9D9;
  background-color: theme.$primary-color;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  .sidebar-content {
    width: 100%;
    position: relative;
    display: flex;
  }
}
.content {
  display: grid;
  grid-template-columns: auto 1fr auto; /* 左側面板 240px，右側佔滿剩餘空間 */
  padding-top: 22px;
  width: 100%;
  height: 100%;
  position: relative;
}

.editor-area {
  width: 100%;
  height: 800px;
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
.layers-btn {
  position: absolute;
  display: flex;
  align-items: center;
  max-width: 110px;
  min-width: 110px;
  min-height: 56px;
  max-height: 56px;
  border-radius: 999px;
  border: theme.$border-color-base solid 1px;
  right: calc(330px + 14px);
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
  justify-content: center;
  cursor: pointer;
  gap: 10px;
  background-color: theme.$navbar-btn-bg-color;
  .icon {
    width: 24px;
    height: 24px;
  }
  .text {
    font-weight: 400;
    font-size: 18px;
    line-height: 100%;
    letter-spacing: 0;
    text-align: center;
    color: theme.$text-color;
  }
}
</style>
