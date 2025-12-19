<script setup lang="ts">
// 還沒實作完
import { onMounted, onUnmounted, type PropType, reactive, ref } from "vue";

const props = defineProps({
  element: Object as PropType<any>
});

const textElement = reactive(props.element);

const textEditableRef = ref<HTMLDivElement>();

const handleSelectionChange = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const selectedNode = range.commonAncestorContainer;

  // 檢查選取是否發生在 text-editable div 或其子元素中
  if (textEditableRef.value && textEditableRef.value.contains(selectedNode)) {
    const selectedText = selection.toString();
    if (selectedText) {
      console.log("Text selected in contenteditable:", selectedText);
      // 在這裡可以進一步處理選取的文字，例如顯示格式化工具列
    }
  }
};

onMounted(() => {
  document.addEventListener("selectionchange", handleSelectionChange);
});
onUnmounted(() => {
  document.removeEventListener("selectionchange", handleSelectionChange);
});
</script>

<template>
  <div ref="textEditableRef" class="text-editable" contenteditable="true">
    <span style="color: #3a3a3a">1111</span><span style="color: #f15624">222</span>
  </div>
</template>

<style scoped lang="scss">
.text-editable {
  position: absolute;
  width: 300px; /* 輸入框寬度 */
  min-height: 10px; /* 輸入框最小高度 */
  background-color: white;
  border: 1px dashed #909399;
  margin: 0;
  text-align: center;
  outline: none;
  box-sizing: border-box;
  z-index: 10;
  overflow: hidden;
  resize: none;
  font-size: 20px;
  padding: 0 0;
  top: 0;
  left: 0;

  &:focus {
    outline: none; /* 移除預設藍色外框 */
    border-color: #007bff; /* 換成其他顏色 */
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); /* 增加陰影 */
  }
}
</style>
