<script setup lang="ts">
import { computed } from 'vue';

const itemsPerRow: number = 3;

// 假設這是從 API 或其他地方獲取的分類資料
const categories = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  name: `群組${i + 1}`
}));

// 將分類資料分組，每組 3 個，以對應 el-row 的結構
const categoryRows = computed(() => {
  const rows = [];
  for (let i = 0; i < categories.length; i += itemsPerRow) {
    rows.push(categories.slice(i, i + itemsPerRow));
  }
  return rows;
});
</script>

<template>
  <el-row v-for="(row, rowIndex) in categoryRows" :key="rowIndex" class="group" :gutter="10">
    <el-col v-for="category in row" :key="category.id" :span="8">
      <div class="grid-content ep-bg-purple">{{ category.name }}</div>
    </el-col>
  </el-row>
</template>

<style scoped lang="scss">
@use "@/styles/theme";
.el-row {
  margin-bottom: 20px;
}
.el-row:last-child {
  margin-bottom: 0;
}
.el-col {
  border-radius: 4px;
}
.group {
  margin-top: 0;
  margin-bottom: 10px;
}
.grid-content {
  border-radius: 4px;
  min-height: 80px;
  background-color: #f15624;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
</style>