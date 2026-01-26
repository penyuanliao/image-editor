<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import OnboardingFlow from "@/components/Onboarding/OnboardingFlow.vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(["update:visible"]);

const visible = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val)
});

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

  // 設定絕對最大尺寸限制 (例如: 1280x720)
  const absoluteMaxWidth = 1280;
  const absoluteMaxHeight = 720;

  // 計算最大可用空間 (例如視窗的 85%)，且不超過絕對最大尺寸
  const maxWidth = Math.min(windowWidth.value * 0.8, absoluteMaxWidth);
  const maxHeight = Math.min(windowHeight.value * 0.8, absoluteMaxHeight);

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
    modal-class="onboarding-dialog-mask"
  >
    <div class="custom-close-btn" @click="visible = false">
      <svg
        width="34"
        height="34"
        viewBox="0 0 34 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="17" cy="17" r="16.5" fill="currentColor" stroke="#FFC3B0" />
        <path
          d="M22 22L12 12M22 12L12 22"
          stroke="white"
          stroke-width="1.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
    <OnboardingFlow />
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
.custom-close-btn {
  width: 34px;
  height: 34px;
  position: absolute;
  right: -17px;
  top: -17px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f48b6a; // 預設顏色
  z-index: 10;
  &:active {
    scale: 0.95;
  }
  &:hover {
    color: #f15624;
  }
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

<style lang="scss">
.onboarding-dialog-mask {
  background-color: rgba(0, 0, 0, 0.7) !important; /* 0.7 為透明度 (0~1)，數值越大越黑 */
}
</style>
