<script setup lang="ts">
import { ref } from "vue";
import { Search } from "@element-plus/icons-vue";
const input = ref<String>('');

</script>

<template>
  <div class="images-gallery-container">
    <span class="label">背景圖片</span>
    <el-input
        v-model="input"
        class="responsive-input"
        placeholder="輸入文字搜尋背景"
        :prefix-icon="Search"
        clearable
    ></el-input>
  </div>
</template>

<style scoped>
.images-gallery-container {
  display: flex;
  width: 280px;
  height: 100vh;
  justify-content: flex-start;
  flex-direction: column;
  background-color: #303030;
  flex-wrap: nowrap;
  align-items: center;
  overflow: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  gap: 10px;
}
.responsive-input {
  width: 240px;
  margin-top: 20px;
  height: 40px;
  font-size: medium;
  flex-shrink: 0;
}
.tag-group {
  width: 240px;
  height: 40px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  flex-shrink: 0;
  overflow-x: auto;
  overflow-y: hidden;
  &::-webkit-scrollbar {
    display: none;
  }
}
.categories {
  width: 240px;
  display: flex;
  flex-direction: column;
  .label {
    flex-shrink: 0;
  }
  .category-items {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: space-between;
  }
  .image {
    width: 110px;
    height: 110px;
    flex-shrink: 0;
    background-color: rgba(80, 80, 80, 0.3);
    border-radius: 4px;
    margin-top: 5px;
    margin-bottom: 5px;
    &:active {
      background-color: rgba(80, 80, 80, 0.6);
    }
    &:hover {
      background-color: rgba(80, 80, 80, 0.6);
    }
  }
}


</style>