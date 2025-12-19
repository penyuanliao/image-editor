<script setup lang="ts">
import { RefreshLeft, RefreshRight } from "@element-plus/icons-vue";
import { useEditorStore } from "@/store/editorStore.ts";
import NButton from "@/components/Basic/NButton.vue";

const editorStore = useEditorStore();

const handleRadians = (degrees: number) => {
  editorStore.rotationInDegrees += degrees;
};
</script>

<template>
  <el-dropdown :hide-on-click="false" :show-arrow="false" placement="bottom" trigger="click">
    <NButton class="dropdown-btn" tip="旋轉">
      <template #icon>
        <el-icon size="20"><RefreshRight /></el-icon>
      </template>
    </NButton>
    <template #dropdown>
      <el-dropdown-menu>
        <div class="item slider-with-input">
          <el-slider
            class="slider"
            v-model="editorStore.rotationInDegrees"
            :min="-360"
            :max="360"
            show-input
            :show-input-controls="false"
            :format-tooltip="(value: number) => value + '%'"
            :format-value-text="(value: number) => value + '%'"
            size="small"
          />
        </div>
        <el-dropdown-item :icon="RefreshRight" @pointerup="handleRadians(-90)"
          >逆時針旋轉90°</el-dropdown-item
        >
        <el-dropdown-item :icon="RefreshLeft" @pointerup="handleRadians(90)"
          >順時針旋轉90°</el-dropdown-item
        >
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped lang="scss">
@use "@/styles/theme";
.item {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.slider {
  width: 80%;
}
.dropdown-btn {
  width: 24px;
  height: 24px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
