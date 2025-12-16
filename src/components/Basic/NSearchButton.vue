<script setup lang="ts">

import { computed } from "vue";
import {Close, Search} from "@element-plus/icons-vue";

const props = defineProps({
  input: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:input', 'change']);

const inputValue = computed({
  get() {
    return props.input;
  },
  set(value) {
    emit('update:input', value);
  }
});
</script>

<template>
  <div class="search-input">
    <el-input
        v-model="inputValue"
        class="source-search-input"
        placeholder="搜尋素材"
        :clear-icon="Close"
        clearable
        @change="emit('change', inputValue)"
        @clear="emit('change', '')"
    >
      <template v-slot:suffix>
        <div class="submit-btn">
          <el-icon size="20"><Search /></el-icon>
        </div>
      </template>
    </el-input>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/theme";
.search-input {
  width: 100%;
  height: fit-content;
  padding: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>