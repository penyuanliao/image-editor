<script setup lang="ts">
import NImage from "@/components/Basic/NImage.vue";
import { computed, ref } from "vue";
import { useEditorStore } from "@/store/editorStore.ts";
import type { IUploadedImage } from "@/types.ts";

const emit = defineEmits({
  change: (value: IUploadedImage) => value
});

const editorStore = useEditorStore();

const carouselRef = ref<any>();

const recentlyUseImageList = computed(() => {
  const list = [...editorStore.imageList].reverse();
  const result = [];
  for (let i = 0; i < list.length; i += 3) {
    result.push(list.slice(i, i + 3));
  }
  return result;
});

const handleImageChange = (item: IUploadedImage) => {
  emit("change", item);
};

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
    <div v-if="getActiveIndex() > 0" class="custom-arrow left" @click="handlePrev()">
      <el-icon>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(180 8 8)"/>
        </svg>
      </el-icon>
    </div>
    <el-carousel
      ref="carouselRef"
      :loop="false"
      :autoplay="false"
      :indicator-position="'none'"
      class="group-carousel"
      :arrow="'never'"
      height="100px"
    >
      <el-carousel-item class="el-carousel-item" v-for="(group, i) in recentlyUseImageList">
        <div class="item" v-for="(item, j) in group" :key="`recently-${i}-${j}`">
          <div class="item-image">
            <NImage :src="item.image.src" fit="contain" @click="handleImageChange(item)" />
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>

    <!-- 自訂右按鈕 -->
    <div
      v-if="getActiveIndex() !== recentlyUseImageList.length - 1"
      class="custom-arrow right"
      @click="handleNext()"
    >
      <el-icon>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </el-icon>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/theme";
.carousel-wrapper {
  --label-height: 20px;
  position: relative;
  width: 100%;
  .custom-arrow {
    position: absolute;
    top: calc(50% - var(--label-height, 20px) / 2);
    transform: translateY(-50%);
    z-index: 10;
    cursor: pointer;
    background-color: theme.$primary-color;
    color: black;
    width: 19px;
    height: 48px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s;
    box-shadow: 0 3px 4px 0 #3F3F401A;

    &:hover {
      color: #F15624;
    }

    &.left {
      left: -10px;
    }

    &.right {
      right: -10px;
    }
  }
}

.group-carousel {
  height: 100px;
  width: 100%;
}

.el-carousel-item {
  width: 100%;
  display: flex;
  gap: 20px;
  background-color: white;
}

.item {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
}

.item-image {
  border-radius: 4px;
  height: 80px;
  width: 80px;
  background-color: theme.$navbar-btn-bg-color;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  box-sizing: border-box;
  border: 2px solid transparent;
  overflow: hidden;

  &:active {
    background-color: rgba(80, 80, 80, 0.6);
  }

  &:hover {
    background-color: rgba(80, 80, 80, 0.6);
  }
}
</style>
