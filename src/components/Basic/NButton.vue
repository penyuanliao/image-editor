<script setup lang="ts">

import Symbols from "@/components/Basic/Symbols.vue";

const props = defineProps(["tip", "size", "icon", "text", "width", "height"]);

</script>

<template>
  <div>
    <el-tooltip
        v-if="props.tip"
        :content="props.tip"
        placement="top">
      <el-button class="el-btn" :style="{
        width: `${props.width ? props.width + 'px' : '100%'} `,
        height: `${props.width ? props.height + 'px' : '100%'} `,
      }">
        <el-icon v-if="props.icon" :size="props.size">
          <Symbols :name="props.icon"/>
        </el-icon>
        <slot v-else-if="$slots.icon" name="icon"/>
        <span v-if="props.text" class="text">{{ props.text }}</span>
        <slot v-else-if="$slots.default" name="default"/>
      </el-button>
    </el-tooltip>
    <el-button v-else class="el-btn" :style="{
        width: `${props.width ? props.width + 'px' : '100%'} `,
        height: `${props.width ? props.height + 'px' : '100%'} `,
      }">
      <el-icon v-if="props.icon" :size="props.size">
        <Symbols :name="props.icon"/>
      </el-icon>
      <slot v-else-if="$slots.icon" name="icon"/>
      <span v-if="props.text" class="text">{{ props.text }}</span>
      <slot v-else-if="$slots.default" name="default"/>
    </el-button>
  </div>

</template>

<style scoped lang="scss">
.el-btn {
  min-width: 24px;
  min-height: 24px;
  border: none;
  background: transparent;
  padding: 0 4px;
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