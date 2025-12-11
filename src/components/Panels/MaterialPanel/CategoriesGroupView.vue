<script setup lang="ts">
import { computed } from 'vue';
import {useMaterialsStore} from "@/store/useMaterialsStore.ts";
const materialsStore = useMaterialsStore();

const emit = defineEmits(['change']);

const itemsPerRow: number = 3;


const groupList = computed(() => materialsStore.groupList || []);

// 將分類資料分組，每組 3 個，以對應 el-row 的結構
const groupRows = computed(() => {
  const rows = [];
  for (let i = 0; i < groupList.value.length; i += itemsPerRow) {
    rows.push(groupList.value.slice(i, i + itemsPerRow));
  }
  return rows;
});

const handleSelectChange = (value: { id: number, name: string, index: number }) => {
  emit('change', value);
}

</script>

<template>
  <el-row v-for="(row, rowIndex) in groupRows" :key="rowIndex" class="row" :gutter="10">
    <el-col v-for="group in row" :key="group.id" :span="8">
      <div class="group-item ep-bg-purple" @click="handleSelectChange(group)">
        <div>
          <svg width="36" height="36" viewBox="0 0 2.16 2.16" xmlns="http://www.w3.org/2000/svg"><path fill="#ffa000" d="M1.8.54H.99L.81.36H.36a.18.18 0 0 0-.18.18V.9h1.8V.72A.18.18 0 0 0 1.8.54"/><path fill="#ffca28" d="M1.8.54H.36a.18.18 0 0 0-.18.18v.9c0 .099.081.18.18.18H1.8a.18.18 0 0 0 .18-.18v-.9A.18.18 0 0 0 1.8.54"/></svg>
        </div>
        {{ group.name }}
      </div>
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
.row {
  margin-top: 0;
  margin-bottom: 10px;
}
.group-item {
  border-radius: 4px;
  height: 80px;
  width: 80px;
  background-color: theme.$navbar-btn-bg-color;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3a3a3a;
  cursor: pointer;
  box-sizing: border-box;
  border: 2px solid transparent;
  flex-direction: column;
  &:active {
    background-color: rgba(80, 80, 80, 0.6);
  }
  &:hover {
    background-color: rgba(80, 80, 80, 0.6);
  }
}
</style>