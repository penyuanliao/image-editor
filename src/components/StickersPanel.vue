<script setup lang="ts">
import { ref } from "vue";
import { Search } from "@element-plus/icons-vue";
const input = ref<String>('');


</script>

<template>
  <div class="images-gallery-container">
    <span class="label">素材</span>
    <el-input
        v-model="input"
        class="responsive-input"
        placeholder="搜尋素材"
        :prefix-icon="Search"
        clearable
    ></el-input>
    <div class="categories">
      <span class="label">自訂</span>
      <div class="category-items">
        <div class="image">圖1</div>
      </div>
      <span class="label">聯名活動素材</span>
      <div class="category-items">
        <div class="image">圖1</div>
        <div class="image">圖2</div>
        <div class="image">圖3</div>
        <div class="image">圖4</div>
        <div class="image">圖5</div>
        <div class="image">圖6</div>
      </div>
      <span class="label">BB Logo素材</span>
      <div class="category-items">
        <div class="image">圖1</div>
        <div class="image">圖2</div>
        <div class="image">圖3</div>
        <div class="image">圖4</div>
        <div class="image">圖5</div>
        <div class="image">圖6</div>
      </div>
      <span class="label">BB 產品素材</span>
      <div class="category-items">
        <div class="image">圖1</div>
        <div class="image">圖2</div>
        <div class="image">圖3</div>
        <div class="image">圖4</div>
        <div class="image">圖5</div>
        <div class="image">圖6</div>
      </div>
    </div>
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
}
.responsive-input {
  width: 240px;
  margin-top: 20px;
  height: 40px;
  font-size: medium;
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