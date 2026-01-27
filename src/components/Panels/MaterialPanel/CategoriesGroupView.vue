<script setup lang="ts">
import {type IGalleryInfo, type IGroupThumbnail} from "@/store/useMaterialsStore.ts";
import { type PropType, ref} from "vue";
import NImage from "@/components/Basic/NImage.vue";
import { gtmManager } from "@/library/GtmManager.ts";

const props = defineProps({
  data: {
    type: Array as PropType<IGroupThumbnail[]>,
    required: true,
    default: () => {
      return [];
    }
  }
});
const emit = defineEmits({
  change: (value: { categoryIndex: number; category: string; groupIndex: number; group: string; }) => value
});

const carouselRefs = ref<any[]>([]);

const getActiveIndex = (index: number) => {
  return carouselRefs.value[index]?.activeIndex;
}

const handleChange = (info: IGalleryInfo, groupIndex: number) => {
  emit("change", {
    categoryIndex: info.categoryIndex,
    category: info.category,
    group: props.data[groupIndex]?.groupName || '',
    groupIndex
  });
};

const handlePrev = (index: number) => {
  carouselRefs.value[index]?.prev();
  gtmManager.trackEvent({
    event: `選擇素材_${props.data[index]?.groupName}_左`
  });
};

const handleNext = (index: number) => {
  carouselRefs.value[index]?.next();
  gtmManager.trackEvent({
    event: `選擇素材_${props.data[index]?.groupName}_右`
  });
};

</script>

<template>
  <section class="categories-view">
    <template v-for="(group, index) in props.data" :key="`group-${group.groupId}`">
      <h3 class="group-title">{{ group.groupName }}</h3>
      <div class="carousel-wrapper">
        <!-- 自訂左按鈕 -->
        <div v-if="getActiveIndex(index) > 0" class="custom-arrow left" @click="handlePrev(index)">
          <el-icon>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(180 8 8)"/>
            </svg>
          </el-icon>
        </div>

        <el-carousel :ref="(el: any) => (carouselRefs[index] = el)"
                     :loop="false" :autoplay="false" :indicator-position="'none'" class="group-carousel"
                     :arrow="'never'" height="100px">
          <el-carousel-item class="el-carousel-item" v-for="(row, itemIndex) in group.groupItems" :key="`row-${itemIndex}`" :style="{
            'z-index': `${ itemIndex === getActiveIndex(index) ? 9 : 0 }`
          }">
            <div class="item" v-for="item in row" :key="`item-${item.id}`">
              <div class="image-item">
                <NImage :src="item.src" fit="contain" @click="handleChange(item, index)"/>
              </div>
              <span>{{ item.category }}</span>
            </div>
          </el-carousel-item>
        </el-carousel>

        <!-- 自訂右按鈕 -->
        <div v-if="getActiveIndex(index) !== group.groupItems.length - 1" class="custom-arrow right"
             @click="handleNext(index)">
          <el-icon>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </el-icon>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped lang="scss">
@use "@/styles/theme";

.categories-view {
  position: relative;
  display: inline-block;
  width: 100%;
  height: 100%;
}

.el-row {
  margin-bottom: 20px;
}

.el-row:last-child {
  margin-bottom: 0;
}

.el-col {
  border-radius: 4px;
}

.row {
  margin-top: 0;
  margin-bottom: 10px;
}

.carousel-wrapper {
  position: relative;
  width: 100%;
}

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

.group-carousel {
  height: 100px;
  width: 100%;
}

.el-carousel-item {
  width: 100%;
  display: flex;
  gap: 20px;
  background-color: white;
  justify-content: space-between;
}

.item {
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
  display: flex;
  gap: 7px;
  flex-shrink: 0;
}

.image-item {
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
  max-width: 80px;

  &:active {
    background-color: rgba(80, 80, 80, 0.6);
  }

  &:hover {
    background-color: rgba(80, 80, 80, 0.6);
  }
}

.image-item + span {
  font-weight: 400;
  font-size: 13px;
  line-height: 100%;
  letter-spacing: 0;
  text-align: center;
  color: #606060;
  width: 80px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.group-title {
  border-radius: 4px;
  min-height: 24px;
  font-size: 18px;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: 0;
  margin-block-end: 9px;
  margin-block-start: 9px;
}

/*:deep(.el-carousel__item) {
  transition: none !important;
}*/
</style>
