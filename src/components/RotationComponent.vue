<script setup lang="ts">
import {RefreshLeft, RefreshRight, Sort, Switch} from "@element-plus/icons-vue";
</script>

<template>
  <el-dropdown placement="bottom">
    <el-button :icon="RefreshRight"/>
    <template #dropdown>
      <el-dropdown-menu>
        <div class="item">
          <span>旋轉&翻轉</span>
          <el-input-number
              :controls="false"
              align="right"
              aria-label="3333"
              style="width: 60px;" model-value="0">
            <template #suffix>°</template>
          </el-input-number>
        </div>
        <div class="item">
          <el-slider class="slider"/>
        </div>
        <el-dropdown-item :icon="RefreshRight">逆時針旋轉90°</el-dropdown-item>
        <el-dropdown-item :icon="RefreshLeft">順時針旋轉90°</el-dropdown-item>
        <el-dropdown-item :icon="Switch">水平翻轉</el-dropdown-item>
        <el-dropdown-item :icon="Sort">垂直翻轉</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped>
.item {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.slider {
  width: 80%;
}
</style>