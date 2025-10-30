<script setup lang="ts">
import { ref } from "vue";
import { Search, Close } from "@element-plus/icons-vue";

const props = defineProps(['title', 'searchEnabled', 'inputValue', 'padding']);
const emits = defineEmits(['update:input']);
console.log('props', props.searchEnabled);
const searchEnabled = ref<boolean>(props.searchEnabled !== false);
const input = ref<String>(props.inputValue);

const onSearchIconClick = () => {
  console.log('onSearchIconClick', input.value);
  emits('update:input', input.value);
}

</script>

<template>
  <div
      class="panel-container"
      :style="`--panel-padding: ${props.padding || '30px 35px 0 32px'};`"
  >
    <h2 v-if="props.title" class="heading">
      {{ props.title || '选择素材' }}
    </h2>
    <el-input
        v-if="searchEnabled"
        v-model="input"
        class="source-search-input"
        placeholder="搜尋素材"
        :clear-icon="Close"
        clearable
    >
      <template v-slot:suffix>
        <div class="submit-btn" @click="onSearchIconClick">
          <el-icon size="20">
            <Search />
          </el-icon>
        </div>
      </template>
    </el-input>
    <div class="categories">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">

@use "../../styles/theme";
.panel-container {
  display: flex;
  position: relative;
  width: 100%;
  height: 100%;
  justify-content: flex-start;
  flex-direction: column;
  //background-color: theme.$primary-color;
  flex-wrap: nowrap;
  align-items: center;
  overflow: auto;
  color: theme.$text-color;
  box-sizing: border-box;
  &::-webkit-scrollbar {
    display: none;
  }

  padding: var(--panel-padding, 30px 35px 0 32px);
}
.heading {
  width: 100%;
}
.search-btn {
  position: relative;
  width: 262px;
  height: 54px;
  min-height: 54px;
  border-radius: 999px;
  border: 1px solid theme.$border-color-base;
  pointer-events: none;
}



.source-search-input {
  width: 262px;
  font-size: medium;

  // 使用 :deep() 來選取 el-input 內部的 wrapper 元素
  :deep(.el-input__wrapper) {
    height: 54px;
    border: 1px solid theme.$border-color-base;
    border-radius: 999px;
    box-shadow: none; // 移除 focus 時的預設陰影
  }

  // 使用 :deep() 來選取 el-input 內部的 input 元素
  :deep(.el-input__inner) {
    padding-left: 5px; // 讓 placeholder 和輸入文字內縮
  }
  // 調整 clearable 與 suffix-icon 的順序
  :deep(.el-input__suffix) {
    display: flex;
    align-items: center;
  }

  :deep(.el-input__clear) {
    order: -1; // 將 clearable 圖示排在最前面 (order 值越小越靠前)
    margin-right: 8px; // 增加與右側搜尋圖示的間距
  }
  .submit-btn {
    width: 44px;
    height: 44px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: theme.$secondary-color;
    border-radius: 999px;
    color: white;
    transform: translateX(5px);
  }
}
.categories {
  width: 100%;
  display: flex;
  position: relative;
  flex-direction: column;
  .label {
    flex-shrink: 0;
    display: none;
  }
  .image {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
    background-color: rgba(80, 80, 80, 0.3);
    border-radius: 5px;
    margin-top: 5px;
    margin-bottom: 5px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    &:active {
      background-color: rgba(80, 80, 80, 0.6);
    }
    &:hover {
      background-color: rgba(80, 80, 80, 0.6);
    }
    img {
      width: 90%;
      height: 90%;
      object-fit: contain;
    }
  }
  .category-items {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: space-between;
  }
}


</style>
