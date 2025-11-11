<script setup lang="ts" xmlns="http://www.w3.org/1999/html">

import Symbols from "@/components/Basic/Symbols.vue";
import {ref} from "vue";
import {advancedDefaults} from "@/config/settings.ts";
import NButton from "@/components/Basic/NButton.vue";
const { flipEnabled } = defineProps(['flipEnabled'])
const emits = defineEmits(['change']);

const alignEnabled = ref<boolean>(advancedDefaults.alignEnabled);

const onClickHandle = (value: string) => {
  emits('change', value);
}

</script>

<template>
  <el-dropdown
      trigger="click"
      :hide-on-click="false"
      :show-arrow="false"
      placement="bottom-start"
  >
    <slot v-if="$slots.default"/>
    <NButton v-else class="position-btn" text="位置">
      <template #icon>
        <el-icon size="20"><Symbols name="align-left"/></el-icon>
      </template>
    </NButton>
    <template #dropdown>
      <el-dropdown-menu>
        <div class="group">
          <span v-if="alignEnabled">對齊</span>
          <div v-if="alignEnabled" class="row">
            <div class="col">
              <div class="item" @pointerup="onClickHandle('top')">
                <div><Symbols name="align-top"/></div>
                <div>頂端</div>
              </div>
              <div class="item" @pointerup="onClickHandle('middle')">
                <div><Symbols name="align-middle"/></div>
                <span>中間</span>
              </div>
              <div class="item" @pointerup="onClickHandle('bottom')">
                <div><Symbols name="align-bottom"/></div>
                <span>底部</span>
              </div>
            </div>
            <div class="col">
              <div class="item" @pointerup="onClickHandle('left')">
                <div><Symbols name="align-left"/></div>
                <div>左邊</div>
              </div>
              <div class="item" @pointerup="onClickHandle('center')">
                <div><Symbols name="align-center"/></div>
                <span>置中</span>
              </div>
              <div class="item" @pointerup="onClickHandle('right')">
                <div><Symbols name="align-right"/></div>
                <span>右邊</span>
              </div>
            </div>
          </div>
          <el-divider v-if="alignEnabled && flipEnabled !== false"/>
          <div class="row" v-if="flipEnabled !== false">
            <div class="item" @pointerup="onClickHandle('flip-horizontal')">
              <div class="icon">
                <Symbols name="flip-horizontal"/>
              </div>
              <span>水平翻轉</span>
            </div>
            <div class="item" @pointerup="onClickHandle('flip-vertical')">
              <div class="icon">
                <Symbols name="flip-vertical"/>
              </div>
              <span>垂直翻轉</span>
            </div>
          </div>
        </div>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped lang="scss">
@use "@/styles/theme";

.group {
  width: 220px;
  display: flex;
  position: relative;
  align-items: self-start;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  color: theme.$text-color;
  font-size: 15px;
  padding: 10px 10px;
}
.row {
  width: 100%;
  display: flex;
  gap: 10px;
  flex-direction: row;
  justify-content: center;
}
.col {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.item {
  position: relative;
  display: flex;
  flex-direction: row;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  //padding-right: 6px;
  padding-left: 4px;
  align-items: center;
  gap: 10px;
  &:hover {
    background-color: theme.$border-color-base;
  }
  span {
    padding-left: 4px;
    padding-right: 4px;;
  }
  div {
    position: relative;
    display: flex;
  }
}
.position-btn {
  border: solid 1px theme.$border-color-base;
  width: 100px;
  height: 36px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

// 使用 :deep() 選擇器來覆寫 Element Plus 子元件的預設樣式
.el-dropdown-menu :deep(.el-dropdown-menu__item) {
  // 讓 hover 效果與自訂的 .item 保持一致
  &:focus {
    background-color: transparent;
  }
  &:hover {
    background-color: theme.$border-color-base;
    color: black; // 你也可以同時覆寫文字顏色
  }
}

// 調整 el-divider 的上下間距
.group :deep(.el-divider) {
  margin: 10px 0;
}

</style>