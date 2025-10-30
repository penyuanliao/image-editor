<script setup lang="ts">

const { text } = defineProps(['text']);

</script>

<template>
  <div class="apply-btn">
    <slot></slot>
    <span>{{ text || '设定' }}</span>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/theme";

.apply-btn {
  position: relative;
  display: flex;
  border: 1px solid theme.$button-text-color;
  width: 100%;
  height: 32px;
  min-height: 32px;
  border-radius: 30px;
  color: theme.$button-text-color;
  justify-content: center;
  align-items: center;
  font-family: Noto Sans HK, serif;
  font-weight: 700;
  font-size: 15px;
  line-height: 100%;
  letter-spacing: 0;
  text-align: center;
  cursor: pointer;
  &:hover {
    background-color: theme.$button-text-color;
    color: theme.$primary-color;
  }
}
</style>