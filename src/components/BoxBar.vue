<script setup lang="ts">
import Symbols from "./Basic/Symbols.vue";
import { onMounted, ref } from "vue";
import { BoxBarTypes } from "../types.ts";
import { appearanceDefaults } from "@/config/settings.ts";

const selected = ref<number>(0);
const buttonGroup: { icon: string; text: string; key: string }[] = [
  {
    icon: "sticker",
    key: "sticker",
    text: "素材"
  },
  {
    icon: "text",
    key: "text",
    text: "文字"
  },
  {
    icon: "upload",
    key: "upload",
    text: "上傳"
  }
];

const emit = defineEmits(["box-item-click"]);

const handleClick = (index: number) => {
  selected.value = index;
  const key: string = buttonGroup[index]?.key || "";
  emit("box-item-click", BoxBarTypes[key] || "");
};

onMounted(() => {
  selected.value = buttonGroup.findIndex(({ key }) => key === appearanceDefaults.boxBarSelected);
  handleClick(selected.value);
});
</script>

<template>
  <div class="box-bar-container">
    <div class="box-bar-group">
      <div
        v-for="(btn, index) in buttonGroup"
        :key="index"
        :class="{
          'box-item': true,
          active: index === selected
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
  </div>
</template>

<style scoped lang="scss">
@use "../styles/theme";

.box-bar-container {
  width: 85px;
  display: flex;
  justify-content: flex-start;
  flex-shrink: 0;
  border-right: 1px solid theme.$border-color-base;
}
.box-bar-group {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  width: 100%;
  padding-top: 13px;
  align-items: center;
  gap: 5px;
  padding-left: 12px;
}
.box-item {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 60px;
  height: 60px;
  flex-direction: column;
  border-radius: 10px;
  color: theme.$text-color;
  transition: transform 0.2s ease;
  &.active {
    color: theme.$text-color-active;
  }
  &:hover {
    background-color: theme.$border-color-base;
  }
}
.box-item-icon {
  width: 20px;
  height: 20px;
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
