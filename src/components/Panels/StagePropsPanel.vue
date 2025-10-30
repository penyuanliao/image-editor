<script setup lang="ts">
import {useImagesStore} from "@/store/images.ts";
import type {StageConfig} from "@/types.ts";
import {ColorPicker} from "colorpickers";
import NPanelButton from "@/components/Basic/NPanelButton.vue";

const store = useImagesStore();

const emit = defineEmits(['update-element']);

const applyStageHandle = () => {
  emit('update-element', store.stage);
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
      <div class="ctrl once">
        <span>背景顏色：</span>
        <div class="color-picker">
          <ColorPicker use-type="pure" format="hex" v-model:pureColor="(store.stage.config as StageConfig).color"/>
        </div>
      </div>
    </div>
    <div class="additional">
      <NPanelButton text="设定背景" @pointerup="applyStageHandle"/>
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
  .once {
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
}
</style>