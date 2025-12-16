<script setup lang="ts">

import {htmlTheme} from "@/styles/stageTheme.ts";
import UndoRedo from "@/components/EditorArea/UndoRedo.vue";
import {advancedDefaults} from "@/config/settings.ts";
import NZoomControl from "@/components/Basic/NZoomControl.vue";
import Symbols from "@/components/Basic/Symbols.vue";

const props = defineProps({
  progressValue: {
    type: Number,
    default: 0
  }
});
const emit = defineEmits(['update:progressValue']);

</script>

<template>
  <div class="navbar">
    <el-progress
      v-if="props.progressValue !== 0"
      class="progress"
      v-model:percentage="props.progressValue"
      :show-text="false"
      :stroke-width="1"
      :color="htmlTheme.progressBarColor"/>
    <img src="@/assets/icons/bbin.svg" height="38" alt="Logo" class="logo">
    <div class="navbar-action">
      <div class="layers-btn">
        <el-icon class="icon" size="24">
          <Symbols name="layer-btn"/>
        </el-icon>
        <span class="text">图层</span>
      </div>
      <UndoRedo v-if="advancedDefaults.undoRedoEnabled"/>
      <NZoomControl v-if="advancedDefaults.zoomEnabled"/>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/theme';

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
  z-index: 100;
  .logo {
    width: 150px;
    object-fit: contain;
    padding-left: 32px;
    padding-right: 32px;
  }
}
.navbar-action {
  position: absolute;
  display: flex;
  flex-direction: row-reverse;
  max-width: fit-content;
  min-width: 110px;
  min-height: 56px;
  max-height: 56px;
  top: 50%;
  transform: translateY(-50%);
  right: calc(330px + 14px);
  align-items: center;
}
.layers-btn {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 110px;
  min-width: 110px;
  min-height: 56px;
  max-height: 56px;
  border-radius: 999px;
  border: theme.$border-color-base solid 1px;
  text-align: center;
  justify-content: center;
  cursor: pointer;
  gap: 10px;
  background-color: theme.$navbar-btn-bg-color;
  .icon {
    width: 24px;
    height: 24px;
    color: black;
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

.progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>