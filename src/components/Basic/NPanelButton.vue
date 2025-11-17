<script setup lang="ts">
// 宣告你的元件會用到的 props。
// 任何 el-button 支援但未在此處宣告的屬性，Vue 會自動將它們放入 $attrs 並傳遞給根元素。
const props = defineProps({
  disabled: Boolean,
  loading: Boolean,
});

</script>

<template>
  <el-button class="submit-btn" v-bind="props">
    <template v-if="$slots.default" #default>
      <span><slot/></span>
    </template>
    <template v-if="$slots.loading" #loading>
      <slot name="loading"/>
    </template>
    <template v-if="$slots.icon" #icon>
      <slot name="icon"/>
    </template>
  </el-button>

</template>

<style scoped lang="scss">
@use "@/styles/theme";
.submit-btn {
  width: 100%;
  height: 32px;
  min-height: 32px;
  border-radius: 30px;

  font-family: Noto Sans HK, serif;
  font-weight: 700;
  font-size: 15px;

  &:not(.is-disabled):hover {
    background-color: theme.$button-text-color;
    color: theme.$primary-color;
  }
  &:not(.is-disabled) {
    color: theme.$button-text-color;
    background-color: theme.$panel-background-color;
    border: 1px solid theme.$button-text-color;
  }
}
</style>