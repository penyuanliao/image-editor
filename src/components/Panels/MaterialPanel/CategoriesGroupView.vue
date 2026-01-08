<script setup lang="ts">
import {type IGalleryInfo, type IGroupThumbnail} from "@/store/useMaterialsStore.ts";
import {type PropType, ref} from "vue";
import NImage from "@/components/Basic/NImage.vue";
import {ArrowRight, ArrowLeft} from "@element-plus/icons-vue";

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
  change: (value: { categoryIndex: number; category: string; groupIndex: number }) => value
});

const carouselRefs = ref<any[]>([]);

const getActiveIndex = (index: number) => {
  return carouselRefs.value[index]?.activeIndex;
}

const handleChange = (info: IGalleryInfo, groupIndex: number) => {
  emit("change", {
    categoryIndex: info.categoryIndex,
    category: info.category,
    groupIndex
  });
};

const handlePrev = (index: number) => {
  carouselRefs.value[index]?.prev();
};

const handleNext = (index: number) => {
  carouselRefs.value[index]?.next();
};
</script>

<template>
  <section class="categories-view">
    <template v-for="(group, index) in props.data" :key="`group-${group.groupId}`">
      <h2 class="group-title">{{ group.groupName }}</h2>
      <div class="carousel-wrapper">
        <!-- 自訂左按鈕 -->
        <div v-if="getActiveIndex(index) !== 0" class="custom-arrow left" @click="handlePrev(index)">
          <el-icon>
            <ArrowLeft/>
          </el-icon>
        </div>

        <el-carousel :ref="(el: any) => (carouselRefs[index] = el)"
                     :loop="false" :autoplay="false" :indicator-position="'none'" class="group-carousel"
                     :arrow="'never'" height="100px">
          <el-carousel-item class="el-carousel-item" v-for="row in group.groupItems">
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
            <ArrowRight/>
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

.group-carousel {
  height: 100px;
  width: 100%;
}

.el-carousel-item {
  width: 100%;
  display: flex;
  gap: 20px;
}

.item {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
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

  &:active {
    background-color: rgba(80, 80, 80, 0.6);
  }

  &:hover {
    background-color: rgba(80, 80, 80, 0.6);
  }
}

.image-item + span {
  font-size: 14px;
}

.group-title {
  border-radius: 4px;
  min-height: 24px;
  font-size: 18px;
}
</style>
