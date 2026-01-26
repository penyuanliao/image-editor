<script setup lang="ts">
import { computed, ref } from "vue";

defineProps({
  iconSize: {
    type: Number,
    default: 30
  }
});

const carouselRef = ref<any>();

const total = computed(() => {
  return carouselRef.value?.$el.children.length -1;
});
const getActiveIndex = () => {
  return carouselRef.value?.activeIndex;
};

const handlePrev = () => {
  carouselRef.value?.prev();
};
const handleNext = () => {
  carouselRef.value?.next();
};
</script>

<template>
  <div class="carousel-wrapper">
    <!-- 自訂左按鈕 -->
    <div v-show="getActiveIndex() > 0" class="custom-arrow left" @click="handlePrev()">
      <el-icon :size="iconSize">
        <svg
          viewBox="0 0 22 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 33L4 18L19 3"
            stroke="currentColor"
            stroke-width="5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </el-icon>
    </div>

    <el-carousel ref="carouselRef" class="viewer" :autoplay="false" arrow="never" :loop="false">
      <el-carousel-item class="onboarding-item" :key="`boarding-1`">
        <el-image class="img" src="/assets-editor/assets/onboarding/stepsBySteps1.png" alt="" />
      </el-carousel-item>
      <el-carousel-item class="onboarding-item" :key="`boarding-2`">
        <el-image class="img" src="/assets-editor/assets/onboarding/stepsBySteps2.png" alt="" />
      </el-carousel-item>
    </el-carousel>

    <!-- 自訂右按鈕 -->
    <div v-show="getActiveIndex() !== total" class="custom-arrow right" @click="handleNext()">
      <el-icon :size="iconSize">
        <svg
          viewBox="0 0 22 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 33L19 18L4 3"
            stroke="currentColor"
            stroke-width="5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </el-icon>
    </div>
  </div>
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

.carousel-wrapper {
  --label-height: 20px;
  position: relative;
  width: 100%;
  height: 100%;
  .custom-arrow {
    position: absolute;
    top: calc(50% - var(--label-height, 20px) / 2);
    transform: translateY(-50%);
    z-index: 10;
    cursor: pointer;
    color: #606060;
    width: 19px;
    height: 48px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s;

    &:hover {
      color: #f15624;
    }
    &:active {
      scale: 0.95;
    }

    &.left {
      left: 21px;
    }

    &.right {
      right: 21px;
    }
  }
}
.viewer {
  position: relative;
  width: 100%;
  height: var(--dialog-onboarding-height, 100%);
}
.onboarding-item {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  line-height: 300px;
  margin: 0;
  text-align: center;
}

.el-carousel__item:nth-child(2n) {
  background-color: white;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: white;
}

/* 將指示器改為圓形 */
:deep(.el-carousel__indicators) {
  .el-carousel__button {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #606060cc;
  }
  .is-active {
    .el-carousel__button {
      background-color: #f15624cc;
    }
  }
}
:deep(.el-carousel__container) {
  height: 100%;
}
</style>
