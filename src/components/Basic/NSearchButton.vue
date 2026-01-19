<script setup lang="ts">
import { computed } from "vue";
import { Close, Search } from "@element-plus/icons-vue";

const props = defineProps({
  input: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["update:input", "change", "clear"]);

const inputValue = computed({
  get() {
    return props.input;
  },
  set(value) {
    emit("update:input", value);
  }
});

const handleClear = () => {
  inputValue.value = '';
  emit("change", '');
}
const handleInputChange = () => {
  if (inputValue.value === '') {
    emit("clear", "");
  } else {
    emit("change", inputValue.value);
  }
}

</script>

<template>
  <div class="search-input">
    <el-input
      v-model="inputValue"
      class="source-search-input"
      placeholder="搜尋素材"
      :clear-icon="Close"
      clearable
      @clear="handleClear"
    >
      <template v-slot:suffix>
        <div class="submit-btn" @click="handleInputChange">
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
  color: #606060;
}
.source-search-input {
  :deep(.el-input__inner) {
    &::placeholder {
      /*color: #606060;*/
    }
  }
}
</style>
