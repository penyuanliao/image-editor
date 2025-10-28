<script setup lang="ts">
import {useImagesStore} from "../store/images.ts";
import type {StageConfig} from "../types.ts";

const store = useImagesStore();

const emit = defineEmits(['update-element']);

const addStage = () => {
  emit('update-element', store.stage);
}

</script>

<template>
  <div class="stage-props-container">
    <div class="properties">

      <div class="ctrl">
        <span>寬：</span>
        <el-input-number v-model="(store.stage.config as StageConfig).width" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>高：</span>
        <el-input-number v-model="(store.stage.config as StageConfig).height" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>顏色：</span>
        <el-input v-model="(store.stage.config as StageConfig).color" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl center">
        <el-button @click="addStage">套用</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stage-props-container {
  display: flex;
  width: 280px;
  height: 100%;
  justify-content: flex-start;
  flex-direction: column;
  background-color: #303030;
  flex-wrap: nowrap;
  align-items: center;
  overflow: auto;
  padding-top: 10px;
  gap: 10px;
  &::-webkit-scrollbar {
    display: none;
  }
}
.properties {
  width: 260px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #ffffff;
  span {
    flex-shrink: 0;
    width: 80px;
  }
  .ctrl {
    display: flex;
    align-items: center;
    width: 260px;
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
}
</style>