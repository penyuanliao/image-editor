<script setup lang="ts">

import { type IGalleryItem } from "@/store/useMaterialsStore.ts";
import {computed, type PropType} from "vue";
import NImage from "@/components/Basic/NImage.vue";

const props = defineProps({
  'data': {
    type: Array as PropType<IGalleryItem[]>,
    required: true,
    default: () => []
  }
});

const emit = defineEmits(['change']);

const itemsPerRow: number = 3;

// 將分類資料分組，每組 3 個，以對應 el-row 的結構
const groupRows = computed(() => {
  const rows = [];
  const images = props.data || [];
  for (let i = 0; i < images.length; i += itemsPerRow) {
    rows.push(images.slice(i, i + itemsPerRow));
  }
  return rows;
});

const handleChange = (group: IGalleryItem) => {
  emit('change', group);
}

</script>

<template>
  <div class="categories-gallery-view">
    <el-row v-for="(row, rowIndex) in groupRows" :key="rowIndex" class="row" :gutter="20">
      <el-col v-for="group in row" :key="group.id" :span="8">
        <div class="image-item ep-bg-purple" @click="handleChange(group)">
          <NImage :src="group.src" fit="contain"/>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/theme";

.categories-gallery-view {
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
  margin-bottom: 25px;
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
  &:active {
    background-color: rgba(80, 80, 80, 0.6);
  }
  &:hover {
    background-color: rgba(80, 80, 80, 0.6);
  }

}
.title {
  border-radius: 4px;
  min-height: 36px;
}
.more {
  display: flex;
  justify-content: flex-end;
  padding-right: 10px;

}
</style>