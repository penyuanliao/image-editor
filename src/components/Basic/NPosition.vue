<script setup lang="ts" xmlns="http://www.w3.org/1999/html">

import Symbols from "@/components/Symbols.vue";
</script>

<template>
  <el-dropdown
      trigger="click"
      :hide-on-click="false"
      :show-arrow="false"
  >
    <span class="position">Position</span>
    <template #dropdown>
      <el-dropdown-menu>

        <div class="group">
          <span>對齊</span>
          <div class="row">
            <div class="horizontal">
              <div class="item">
                <div><Symbols name="align-top"/></div>
                <div>頂端</div>
              </div>
              <div class="item">
                <div><Symbols name="align-middle"/></div>
                <span>中間</span>
              </div>
              <div class="item">
                <div><Symbols name="align-bottom"/></div>
                <span>底部</span>
              </div>
            </div>
            <div class="vertical">
              <div class="item">
                <div><Symbols name="align-left"/></div>
                <div>左邊</div>
              </div>
              <div class="item">
                <div><Symbols name="align-center"/></div>
                <span>置中</span>
              </div>
              <div class="item">
                <div><Symbols name="align-right"/></div>
                <span>右邊</span>
              </div>
            </div>
          </div>
        </div>
        <el-dropdown-item divided>Action 2</el-dropdown-item>
        <el-dropdown-item>Action 3</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped lang="scss">
@use "@/styles/theme";

.group {
  width: 200px;
  display: flex;
  align-items: self-start;
  flex-direction: column;
  gap: 10px;
  color: black;
  font-size: 15px;
  padding: 10px 10px;
}
.row {
  width: 100%;
  display: flex;
  gap: 10px;
  flex-direction: row;
}
.vertical,
.horizontal {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .item {
    height: 30px;
    border-radius: 4px;
    &:hover {
      background-color: theme.$border-color-base;
    }
  }

  div {
    position: relative;
    display: flex;
    align-items: center;
    text-align: center;
  }
}
</style>