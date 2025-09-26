<script setup lang="ts">
import { ref } from "vue";
import { Search, Opportunity } from "@element-plus/icons-vue";
import Symbols from "./Symbols.vue";
const input = ref<String>('');


</script>

<template>
  <div class="images-gallery-container">
    <span class="label">AI生成</span>
    <el-input
        v-model="input"
        class="responsive-input"
        placeholder="搜尋素材"
        :prefix-icon="Search"
        clearable
    ></el-input>
    <div class="categories">
      <span class="label">選擇素材</span>
      <div class="category-group">
        <div class="item">
          <div class="image"></div>
        </div>
        <div class="item">
          <div class="image"></div>
        </div>
      </div>
      <span class="label">風格轉換</span>
      <div class="category-group">
        <div class="item">
          <div class="image"></div>
          <span>自訂</span>
        </div>
        <div class="item">
          <div class="image"></div>
          <span>3D插圖</span>
        </div>
        <div class="item">
          <div class="image"></div>
          <span>卡通</span>
        </div>
        <div class="item">
          <div class="image"></div>
          <span class="cyberpunk">賽德龐克</span>
        </div>
        <div class="item">
          <div class="image"></div>
          <span>動漫</span>
        </div>
        <div class="item">
          <div class="image"></div>
          <span>像素</span>
        </div>
        <div class="item">
          <div class="image"></div>
          <span>復刻插畫</span>
        </div>
        <div class="item">
          <div class="image"></div>
          <span>水彩</span>
        </div>
        <div class="item">
          <div class="image"></div>
          <span>油畫</span>
        </div>
        <div class="item">
          <div class="image"></div>
          <span>素描</span>
        </div>
      </div>
    </div>
    <el-button style="width: 100%; height: 40px;" type="primary">
      <template #default>
        <span>生成</span>
      </template>
      <template #loading>生成...</template>
      <template #icon><Symbols name="magic"/></template>
    </el-button>
    <div style="background-color: #444444">
      <el-icon :size="12"><Opportunity/></el-icon>
      <span>您今日AI換圖剩餘次數: </span>
      <span>10</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.images-gallery-container {
  display: flex;
  width: 240px;
  min-height: 100vh;
  justify-content: flex-start;
  flex-direction: column;
  background-color: #303030;
  flex-wrap: nowrap;
  align-items: center;
  overflow-y: hidden;
  &::-webkit-scrollbar {
    display: none;
  }
  padding: 10px 20px;
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

  .category-group {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: flex-start;
    gap: 10px;
  }

  .label {
    flex-shrink: 0;
  }
  .item {
    width: 72px;
    height: auto;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;
  }
  .image {
    width: 72px;
    height: 72px;
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