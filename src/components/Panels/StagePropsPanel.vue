<script setup lang="ts">
import {useImagesStore} from "@/store/images.ts";
import type {StageConfig} from "@/types.ts";
import {ColorPicker} from "colorpickers";
import NPanelButton from "@/components/Basic/NPanelButton.vue";
import Gallery from "@/components/Gallery/Gallery.vue";
import {ref} from "vue";

const store = useImagesStore();

const emit = defineEmits(['update-element']);

const stageViews = ref([
  {
    filename: "標誌",
    content: "800 x 600 像素",
    value: { width: 800, height: 600 }
  },
  {
    filename: "橫幅A",
    content: "750 x 750 像素",
    value: { width: 750, height: 750 }
  },
  {
    filename: "橫幅B",
    content: "750 x 200 像素",
    value: { width: 750, height: 200 }
  }
]);

const applyStageHandle = () => {
  emit('update-element', store.stage);
}
const handleStageChange = (value: { width: number; height: number }) => {

  store.stage.config.width = value.width;
  store.stage.config.height = value.height;
  applyStageHandle();
}

</script>

<template>
  <div class="stage-props-container props-panel">
    <div class="properties">

      <div class="ctrl">
        <span>寬：</span>
        <el-input-number class="el-input" v-model="(store.stage.config as StageConfig).width" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>高：</span>
        <el-input-number class="el-input" v-model="(store.stage.config as StageConfig).height" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl once-line">
        <span>背景顏色：</span>
        <div class="color-picker">
          <ColorPicker use-type="pure" format="hex4" v-model:pureColor="(store.stage.config as StageConfig).color"/>
        </div>
      </div>
      <div class="ctrl once-line">
        <span>專案名稱：</span>
        <el-input placeholder="輸出檔案名稱" v-model="store.pageName"></el-input>
      </div>
    </div>
    <div class="additional">
      <NPanelButton @pointerup="applyStageHandle">设定</NPanelButton>
      <Gallery label="預設尺寸" :data="stageViews" @itemClick="handleStageChange"/>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/theme";

.stage-props-container {
  display: flex;
  position: relative;
  width: 100%;
  height: 100%;
  justify-content: flex-start;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  overflow: auto;
  padding: 30px 16px 0 16px;
  box-sizing: border-box;
  background-color: theme.$panel-background-color;

  &::-webkit-scrollbar {
    display: none;
  }
}
.properties {
  width: 100%;
  display: grid;
  position: relative;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  color: theme.$text-color;
  padding-bottom: 16px;
  span {
    flex-shrink: 0;
    font-size: 15px;
    width: 30%;
  }
  .ctrl {
    display: flex;
    align-items: center;
    width: 100%;
  }
  .view {
    width: 100%;
    height: 100px;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  .center {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .once-line {
    grid-column-start: 1;
    grid-column-end: 3;
  }
  .color-picker {
    width: 24px;
    height: 24px;
    overflow: hidden;
  }
}
.additional {
  position: relative;
  display: flex;
  width: 100%;
  justify-content: center;
  padding-top: 13px;
  flex-direction: column;
}
</style>