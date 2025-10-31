<script setup lang="ts">
const { loading } = defineProps(['loading']);

</script>

<template>
  <el-button class="submit-btn"
             :loading="loading"
  >
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
  color: theme.$button-text-color;
  background-color: theme.$panel-background-color;
  border: 1px solid theme.$button-text-color;
  border-radius: 30px;

  font-family: Noto Sans HK, serif;
  font-weight: 700;
  font-size: 15px;

  &:hover {
    background-color: theme.$button-text-color;
    color: theme.$primary-color;
  }
}
</style>