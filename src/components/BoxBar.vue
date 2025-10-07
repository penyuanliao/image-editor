<script setup lang="ts">

import Symbols from "./Symbols.vue";
import {onMounted, ref} from "vue";
import {ImageEditorTypes} from "../types.ts";
const selected = ref<number>(0);
const buttonGroup: { icon: string, text: string }[] = [
  {
    icon: 'text',
    text: '文字'
  },
  {
    icon: 'sticker',
    text: '素材'
  },
  {
    icon: 'upload',
    text: '上傳'
  }
];

const emit = defineEmits(['box-item-click']);

const handleClick = (index: number) => {
  selected.value = index;
  const key: string = buttonGroup[index]?.icon || '';
  emit('box-item-click', ImageEditorTypes[key] || '');
};

onMounted(() => {
  handleClick(selected.value);
});

</script>

<template>
  <div class="box-bar-group">
    <div
        v-for="(btn, index) in buttonGroup"
        :key="index"
        :class="{
          'box-item': true,
          'active': index === selected
        }"
        @click="handleClick(index)"
    >
      <div class="box-item-icon">
        <Symbols :name="btn.icon" />
      </div>
      <div class="box-item-text">
        <span>{{ btn.text }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>

.box-bar-group {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  background-color: #242424;
}
.box-item {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 72px;
  height: 72px;
  background-color: #242424;
  flex-direction: column;
  &.active {
    background-color: #303030;
  }
}
.box-item-icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.box-item-text {
  height: 24px;
  span {
    font-size: 12px;
  }
}

</style>