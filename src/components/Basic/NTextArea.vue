<script setup lang="ts">

import {ref} from "vue";

const props = defineProps({
  content: {
    type: String,
    default: ""
  },
});
const emit = defineEmits(["update:content", "change", "finish"])

const textAreaRef = ref<HTMLTextAreaElement | null>(null);

// 文字編輯狀態
const isComposing = ref<boolean>(false);

// 處理IME輸入問題
const compositionStart = () => {
  isComposing.value = true;
};
// 處理IME輸入問題
const compositionEnd = (e: Event) => {
  isComposing.value = false;
  const target = e.target as HTMLTextAreaElement;
  emit("update:content", target.value);
  emit("change");
};
const handleTextInput = (e: Event) => {
  console.log('handleTextInput');
  if (isComposing.value) return;
  const target = e.target as HTMLTextAreaElement;
  emit("update:content", target.value);
  emit("change");
};
const finishEditing = () => {
  if (isComposing.value) return;
  emit("update:content", props.content);
  emit("finish");
}
const focus = () => {
  textAreaRef.value?.focus();
};

defineExpose({
  focus,
  get input() { return textAreaRef.value },
  get offsetWidth() { return textAreaRef.value?.offsetWidth || 0; },
  get offsetHeight() { return textAreaRef.value?.offsetHeight || 0; },
  get scrollWidth() { return textAreaRef.value?.scrollWidth || 0; },
  get scrollHeight() { return textAreaRef.value?.scrollHeight || 0; },
  get top() { return textAreaRef.value?.style.top }
})

</script>

<template>
  <textarea
    ref="textAreaRef"
    :value="props.content"
    class="text-editor-input"
    wrap="off"
    @compositionend="compositionEnd"
    @compositionstart="compositionStart"
    @input="handleTextInput"
    @focusout="finishEditing"
    @keydown.enter.shift.prevent="finishEditing"
  />
</template>

<style scoped lang="scss">
.text-editor-input {
  position: absolute;
  background-color: white;
  border: 1px dashed #909399;
  margin: 0;
  text-align: center;
  outline: none;
  box-sizing: border-box;
  z-index: 10;
  overflow: hidden;
  resize: none;
  padding: 0;
}
</style>