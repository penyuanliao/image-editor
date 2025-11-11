<script setup lang="ts">

import Symbols from "@/components/Symbols.vue";

const props = defineProps(["tip", "size", "icon", "text"]);
</script>

<template>
  <div v-if="props.tip">
    <el-tooltip
        :content="props.tip"
        placement="top">
      <el-button class="el-btn">
        <el-icon v-if="props.icon" :size="props.size">
          <Symbols :name="props.icon"/>
        </el-icon>
        <slot v-else-if="$slots.icon" name="icon"/>
        <span v-if="props.text" class="text">{{ props.text }}</span>
        <slot v-else-if="$slots.default" name="default"/>
      </el-button>
    </el-tooltip>
  </div>
  <el-button v-else class="el-btn">
    <el-icon v-if="props.icon" :size="props.size">
      <Symbols :name="props.icon"/>
    </el-icon>
    <slot v-else-if="$slots.icon" name="icon"/>
    <span v-if="props.text" class="text">{{ props.text }}</span>
    <slot v-else-if="$slots.default" name="default"/>
  </el-button>
</template>

<style scoped lang="scss">
.el-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  padding: 0 0;
  border-radius: 4px;

  &:hover {
    background-color: #EEEEEE;
    color: #3a3a3a;
  }

  &:active {
    border: none;
  }

  &:focus {
    outline: none;
  }
}
</style>