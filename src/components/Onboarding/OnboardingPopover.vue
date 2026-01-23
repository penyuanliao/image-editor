<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import OnboardingFlow from "@/components/Onboarding/OnboardingFlow.vue";

const visible = ref<boolean>(true);
const windowWidth = ref(window.innerWidth);
const windowHeight = ref(window.innerHeight);

const handleResize = () => {
  windowWidth.value = window.innerWidth;
  windowHeight.value = window.innerHeight;
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
});
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

const dialogStyle = computed(() => {
  const imgWidth: number = 1920;
  const imgHeight: number = 1080;
  const ratio = imgWidth / imgHeight;

  // 計算最大可用空間 (例如視窗的 85%)
  const maxWidth = windowWidth.value * 0.85;
  const maxHeight = windowHeight.value * 0.85;

  let width = maxWidth;
  let height = width / ratio;

  // 若高度超出範圍，則改以高度為基準反推寬度
  if (height > maxHeight) {
    height = maxHeight;
    width = height * ratio;
  }

  return {
    "--el-dialog-padding-primary": "0",
    "--dialog-onboarding-width": `${width}px`,
    "--dialog-onboarding-height": `${height}px`,
    width: `${width}px`,
    height: `${height}px`,
    padding: "0 0 0 0"
  };
});

</script>

<template>
  <el-dialog
    class="el-dialog-container"
    :style="dialogStyle"
    :show-close="false"
    :lock-scroll="false"
    v-model="visible"
    center
  >
    <OnboardingFlow/>
  </el-dialog>
</template>

<style scoped lang="scss">
@use "@/styles/theme";

.el-dialog-container {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

:deep(.el-dialog__body) {
  height: 100%;
  flex: 1;
}

/* 強制讓 carousel 內容容器填滿父層高度 */
:deep(.el-carousel__container) {
  height: 100%;
}
</style>
