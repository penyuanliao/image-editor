<script setup lang="ts">
import NImage from "@/components/Basic/NImage.vue";
import { computed, ref } from "vue";
import { useEditorStore } from "@/store/editorStore.ts";
import type { IUploadedImage } from "@/types.ts";
import { ArrowLeft, ArrowRight } from "@element-plus/icons-vue";

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
        <ArrowLeft />
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
        <ArrowRight />
      </el-icon>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/theme";
.carousel-wrapper {
  position: relative;
  width: 100%;
  .custom-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.8);
    }

    &.left {
      left: 0;
    }

    &.right {
      right: 0;
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
