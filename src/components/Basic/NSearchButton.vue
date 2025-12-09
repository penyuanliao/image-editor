<script setup lang="ts">

import {Close, Search} from "@element-plus/icons-vue";

const props = defineProps({
  'input': {
    type: String,
    default: ''
  }
});

</script>

<template>
  <div style="width: 100%; height: fit-content; padding: 20px 0; display: flex; justify-content: center; align-items: center; flex-direction: column;">
    <el-input
        v-model="props.input"
        class="source-search-input"
        placeholder="搜尋素材"
        :clear-icon="Close"
        clearable
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
</style>