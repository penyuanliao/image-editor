<script setup lang="ts">

import {type IGalleryItem, useMaterialsStore} from "@/store/useMaterialsStore.ts";
import {computed, watch} from "vue";
import NImage from "@/components/Basic/NImage.vue";

const materialsStore = useMaterialsStore();
const emit = defineEmits(['more', 'change']);

const materialCategories = computed(() => materialsStore.materials);

const handleMoreButton = (index: number, name: string) => {
  console.log('handleMoreButton', index, name);
  materialsStore.selectedCategoryId = index;
  emit('more', name);
}
const handleChange = (group: IGalleryItem) => {
  emit('change', group);
};

watch(() => materialsStore.materials, () => {
  console.log('materialCategories', materialCategories.value);

})

</script>

<template>
<section class="categories-view">
  <template v-for="(row, rowIndex) in materialCategories" :key="`${row.id}`">
    <el-row class="label" :gutter="10">
      <el-col :span="16"><div class="title">{{ row.category }}</div></el-col>
      <el-col :span="8"><div class="more" @click="handleMoreButton(rowIndex, row.category)">more</div></el-col>
    </el-row>

    <el-row class="row" :gutter="28">
      <el-col v-for="item in row.items.slice(0, 3)" :span="8">
        <div class="image-item" @click="handleChange(item)">
          <NImage :src="item.src"/>
        </div>
      </el-col>
    </el-row>
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
  min-height: 16px;
}
.label {
  height: 16px;
  .el-col,
  .el-row {
    margin-bottom: 0;
  }

}
.more {
  display: flex;
  justify-content: flex-end;
  padding-right: 10px;
  cursor: pointer;
  &:hover {
    color: #409eff;
  }
}
</style>