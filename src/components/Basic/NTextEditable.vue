<script setup lang="ts">
import { onMounted, onUnmounted, type PropType, reactive, ref, nextTick } from "vue";
import type {ITextSegment} from "@/types.ts";

const props = defineProps({
  element: Object as PropType<any>
});

// const textElement = reactive(props.element);
const defaultText = {
  text: " ",
  color: "black"
};
const textEditableRef = ref<HTMLDivElement>();

const text = ref<string>("繁體字\nEnglish");


const textSegments = ref<ITextSegment[]>([
  {
    text: "繁體字",
    color: "#cc66ff"
  },
  {
    text: "English",
    color: "#3366ff"
  },
  {
    text: "日文",
    color: "rgba(241,86,36,0.5)"
  }
]);

// 記錄目前的選取狀態
const currentSelection = reactive({
  start: { index: -1, offset: 0 },
  end: { index: -1, offset: 0 },
  text: ""
});

const isComposing = ref(false);

const getRandomRgbColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

// 輔助函式：計算全域偏移量並轉換為 Segment 索引
const getSelectionPoint = (container: Node, offset: number) => {
  if (!textEditableRef.value) return { index: -1, offset: 0 };

  let globalOffset = 0;
  const walker = document.createTreeWalker(textEditableRef.value, NodeFilter.SHOW_TEXT, null);
  let node = walker.nextNode();

  while (node) {
    if (node === container) {
      globalOffset += offset;
      break;
    }

    // 處理 container 是 Element 的情況 (例如 <div><br></div>)
    if (container.nodeType !== Node.TEXT_NODE && container.contains(node)) {
        // 判斷 node 是否在 container 的 offset 之前
        let child = node;
        while (child.parentNode && child.parentNode !== container) {
            child = child.parentNode;
        }
        const childIndex = Array.prototype.indexOf.call(container.childNodes, child);
        if (childIndex < offset) {
             globalOffset += (node.textContent?.length || 0);
        } else {
             // node 在 offset 之後，表示我們已經到了選取點
             break;
        }
    } else {
        // node 不在 container 內，或者是 container 之前的節點
        globalOffset += (node.textContent?.length || 0);
    }

    node = walker.nextNode();
  }

  // 映射到 segments
  let currentLen = 0;
  for (let i = 0; i < textSegments.value.length; i++) {
    const segLen = textSegments.value[i]?.text.length || 0;
    // 如果 globalOffset 在這個 segment 範圍內 (包含邊界)
    if (globalOffset <= currentLen + segLen) {
      return { index: i, offset: globalOffset - currentLen };
    }
    currentLen += segLen;
  }

  // 如果超出範圍，回傳最後一個
  const lastIdx = Math.max(0, textSegments.value.length - 1);
  return { index: lastIdx, offset: textSegments.value[lastIdx]?.text.length || 0 };
};
// 取得選取物件位置跟字串內容
const handleSelectionChange = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const commonAncestor = range.commonAncestorContainer;

  // 檢查選取是否發生在 text-editable div 或其子元素中
  if (textEditableRef.value && textEditableRef.value.contains(commonAncestor)) {
    const start = getSelectionPoint(range.startContainer, range.startOffset);
    const end = getSelectionPoint(range.endContainer, range.endOffset);

    currentSelection.start = start;
    currentSelection.end = end;
    currentSelection.text = selection.toString();
  }
  console.log(`tree:
  ${JSON.stringify(textSegments.value, null, '\t')}`);
};
// 取得全域偏移量
const getGlobalOffset = (index: number, offset: number) => {
  let globalOffset = 0;
  for (let i = 0; i < index; i++) {
    globalOffset += (textSegments.value[i]?.text.length || 0);
  }
  return globalOffset + offset;
};

// 輔助函式：將全域偏移量轉換為 Segment 索引與偏移量
const getSegmentPosFromGlobal = (globalOffset: number) => {
  let currentLen = 0;
  for (let i = 0; i < textSegments.value.length; i++) {
    const segLen = textSegments.value[i]?.text.length || 0;
    if (globalOffset <= currentLen + segLen) {
      return { index: i, offset: globalOffset - currentLen };
    }
    currentLen += segLen;
  }
  return { index: textSegments.value.length - 1, offset: textSegments.value[textSegments.value.length - 1]?.text.length || 0 };
};

// 根據全域偏移量還原選取
const setSelectionByGlobalOffsets = (startGlobal: number, endGlobal: number) => {
  if (!textEditableRef.value) return;

  const selection = window.getSelection();
  const range = document.createRange();

  const walker = document.createTreeWalker(textEditableRef.value, NodeFilter.SHOW_TEXT, null);
  let currentGlobal = 0;
  let node = walker.nextNode();
  let startSet = false;
  let endSet = false;

  while (node) {
    const textLength = (node.textContent || "").length;
    const nextGlobal = currentGlobal + textLength;

    if (!startSet && startGlobal >= currentGlobal && startGlobal <= nextGlobal) {
      range.setStart(node, startGlobal - currentGlobal);
      startSet = true;
    }
    if (!endSet && endGlobal >= currentGlobal && endGlobal <= nextGlobal) {
      range.setEnd(node, endGlobal - currentGlobal);
      endSet = true;
    }

    currentGlobal = nextGlobal;
    if (startSet && endSet) break;
    node = walker.nextNode();
  }

  if (startSet && endSet) {
    try {
      selection?.removeAllRanges();
      selection?.addRange(range);
    } catch (e) {
      console.warn("Failed to restore selection", e);
    }
  }
};

// 範例：修改選取文字的顏色
const applyColorToSelection = async (newColor: string) => {
  const { start, end } = currentSelection;
  // 檢查選取是否有效
  if (start.index === -1 || end.index === -1) return;
  
  // 確保 start 在 end 之前 (處理反向選取)
  let startIndex = start.index;
  let startOffset = start.offset;
  let endIndex = end.index;
  let endOffset = end.offset;

  if (startIndex > endIndex || (startIndex === endIndex && startOffset > endOffset)) {
    [startIndex, endIndex] = [endIndex, startIndex];
    [startOffset, endOffset] = [endOffset, startOffset];
  }

  // 計算修改前的全域位置
  const globalStart = getGlobalOffset(startIndex, startOffset);
  const globalEnd = getGlobalOffset(endIndex, endOffset);

  const newSegments = [...textSegments.value];

  // 處理邏輯：
  // 1. 如果在同一個 segment 內
  if (startIndex === endIndex) {
    const segment = newSegments[startIndex];

    if (!segment) return;

    const pre = segment.text.substring(0, startOffset);
    const sel = segment.text.substring(startOffset, endOffset);
    const post = segment.text.substring(endOffset);

    console.log(`1. 如果在同一個 segment 內
      startOffset: ${ startOffset }
      endOffset: ${ endOffset }
      pre: ${ pre } sel: ${ sel } post: ${ post }
    `);

    const replacements: ITextSegment[] = [];
    if (pre) replacements.push({ text: pre, color: segment.color });
    if (sel) replacements.push({ text: sel, color: newColor });
    if (post) replacements.push({ text: post, color: segment.color });

    newSegments.splice(startIndex, 1, ...replacements);
  } else {
    console.log('2. 跨越多個 segments');
    // 2. 跨越多個 segments
    // 處理開頭 segment
    const startSeg = newSegments[startIndex];
    // 處理結尾 segment
    const endSeg = newSegments[endIndex];

    if (!startSeg || !endSeg) return;

    const startPre = startSeg.text.substring(0, startOffset);
    const startSel = startSeg.text.substring(startOffset);
    
    const startReplacements: ITextSegment[] = [];
    if (startPre) startReplacements.push({ text: startPre, color: startSeg.color });
    if (startSel) startReplacements.push({ text: startSel, color: newColor });

    const endSel = endSeg.text.substring(0, endOffset);
    const endPost = endSeg.text.substring(endOffset);

    const endReplacements: ITextSegment[] = [];
    if (endSel) endReplacements.push({ text: endSel, color: newColor });
    if (endPost) endReplacements.push({ text: endPost, color: endSeg.color });

    // 處理中間 segments
    for (let i = startIndex + 1; i < endIndex; i++) {
      newSegments[i] = { ...newSegments[i], color: newColor } as ITextSegment;
    }

    // 替換頭尾 (注意 splice 順序，先換後面的再換前面的，以免索引跑掉)
    newSegments.splice(endIndex, 1, ...endReplacements);
    newSegments.splice(startIndex, 1, ...startReplacements);
  }

  // 合併相鄰且顏色相同的 segments (優化)
  const mergedSegments: ITextSegment[] = [];
  newSegments.forEach(seg => {
    const lastSeg = mergedSegments[mergedSegments.length - 1];
    if (mergedSegments.length > 0 && lastSeg && lastSeg.color === seg.color) {
      lastSeg.text += seg.text;
    } else {
      mergedSegments.push(seg);
    }
  });

  textSegments.value = mergedSegments;

  // 等待 DOM 更新後還原選取
  await nextTick();
  setSelectionByGlobalOffsets(globalStart, globalEnd);

};

// 取得目前編輯器的純文字內容
const getText = () => {
  return textEditableRef.value?.innerText || "";
};

const handleCompositionStart = () => {
  isComposing.value = true;
};

const handleCompositionEnd = (event: CompositionEvent) => {
  isComposing.value = false;
  handleInput(event);
};
// 輸入文字時處理邏輯
const handleInput = (_: Event) => {
  if (isComposing.value) return;

  if (!textEditableRef.value) return;

  // 1. 保存當前游標位置
  const selection = window.getSelection();
  let savedGlobalOffset = 0;
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const preRange = range.cloneRange();
    preRange.selectNodeContents(textEditableRef.value);
    preRange.setEnd(range.endContainer, range.endOffset);
    savedGlobalOffset = preRange.toString().length;
  }

  // 2. 根據 DOM 重建 textSegments
  let container = textEditableRef.value.firstElementChild;
  // 如果結構被破壞 (例如刪除到最後導致 inner div 被移除)，則直接解析 root
  if (!container || container.tagName !== "DIV") {
    container = textEditableRef.value;
  }

  const newSegments: ITextSegment[] = [];
  container.childNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      console.log(`el.tagName: ${ _.target }`);
      if (el.tagName === "SPAN") {
        newSegments.push({ text: el.innerText, color: el.style.color || "black" });
      } else if (el.innerText) {
        newSegments.push({ text: el.innerText, color: "black" });
      }
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      newSegments.push({ text: node.textContent, color: "black" });
    }
  });

  const filtered = newSegments.filter((s) => s.text.length > 0);
  textSegments.value = filtered.length > 0 ? filtered : [{ text: "", color: "black" }];

  // 3. 還原游標
  nextTick(() => {
    setSelectionByGlobalOffsets(savedGlobalOffset, savedGlobalOffset);
  });
};

const handlePaste = async (event: ClipboardEvent) => {
  event.preventDefault();
  const pastedText = event.clipboardData?.getData("text/plain") || "";
  if (!pastedText) return;

  // 1. 取得要替換的範圍
  const { start, end } = currentSelection;
  let startIndex = start.index;
  let startOffset = start.offset;
  let endIndex = end.index;
  let endOffset = end.offset;

  if (startIndex === -1 || endIndex === -1) return;

  if (startIndex > endIndex || (startIndex === endIndex && startOffset > endOffset)) {
    [startIndex, endIndex] = [endIndex, startIndex];
    [startOffset, endOffset] = [endOffset, startOffset];
  }

  const globalStart = getGlobalOffset(startIndex, startOffset);

  // 2. 重建 segments
  const newSegments = [...textSegments.value];
  // 繼承插入點的顏色
  const pasteColor = newSegments[startIndex]?.color || "black";

  // 情況 1: 在單一 segment 內替換
  if (startIndex === endIndex) {
    const segment = newSegments[startIndex];
    if (!segment) return;

    const pre = segment.text.substring(0, startOffset);
    const post = segment.text.substring(endOffset);

    const replacements: ITextSegment[] = [];
    if (pre) replacements.push({ text: pre, color: segment.color });
    replacements.push({ text: pastedText, color: pasteColor });
    if (post) replacements.push({ text: post, color: segment.color });

    newSegments.splice(startIndex, 1, ...replacements);
  } else {
    // 情況 2: 替換範圍橫跨多個 segments
    const startSeg = newSegments[startIndex];
    const endSeg = newSegments[endIndex];

    const startText = startSeg?.text.substring(0, startOffset) || "";
    const endText = endSeg?.text.substring(endOffset) || "";

    const replacements: ITextSegment[] = [];

    if (startText) {
      replacements.push({ text: startText, color: startSeg?.color });
    }
    replacements.push({ text: pastedText, color: pasteColor });
    if (endText) {
      replacements.push({ text: endText, color: endSeg?.color });
    }

    newSegments.splice(startIndex, endIndex - startIndex + 1, ...replacements);
  }

  // 3. 合併相鄰且顏色相同的 segments
  const mergedSegments: ITextSegment[] = [];
  newSegments.forEach((seg) => {
    if (!seg || seg.text === "") return;
    const lastSeg = mergedSegments[mergedSegments.length - 1];
    if (lastSeg && lastSeg.color === seg.color) {
      lastSeg.text += seg.text;
    } else {
      mergedSegments.push({ ...seg });
    }
  });

  textSegments.value = mergedSegments.length > 0 ? mergedSegments : [{ text: "", color: "black" }];

  // 4. 還原游標到貼上內容的結尾
  await nextTick();
  const newCursorPos = globalStart + pastedText.length;
  setSelectionByGlobalOffsets(newCursorPos, newCursorPos);
};

const handleKeydown = async (event: KeyboardEvent) => {
  // 如果正在進行輸入法組字 (例如注音/拼音選字中)，則不處理
  if (event.isComposing || isComposing.value) return;
  const { start, end } = currentSelection;

  let startIndex = start.index;
  let startOffset = start.offset;
  let endIndex = end.index;
  let endOffset = end.offset;

  // 計算當前的全域位置，以便稍後推算新的游標位置
  const globalStart = getGlobalOffset(startIndex, startOffset);

  if (event.key === "Enter") {
    event.preventDefault();
    const newSegments = [...textSegments.value];

    if (startIndex === endIndex) {
      const segment = newSegments[startIndex];
      if (!segment) return;
      const pre = segment.text.substring(0, startOffset);
      const post = segment.text.substring(endOffset);
      newSegments[startIndex] = {
        text: pre + "\n" + post,
        color: segment.color,
        select: segment.select
      };
    } else {
      // 處理跨越多個 segments 的情況
      const startSeg = newSegments[startIndex];
      const endSeg = newSegments[endIndex];
      const startPre = startSeg?.text.substring(0, startOffset) || "";
      const endPost = endSeg?.text.substring(endOffset) || "";

      const replacements: ITextSegment[] = [];
      replacements.push({ text: startPre + "\n", color: startSeg?.color, select: startSeg?.select });
      if (endPost.length > 0) {
        replacements.push({ text: endPost, color: endSeg?.color, select: endSeg?.select });
      }
      newSegments.splice(startIndex, endIndex - startIndex + 1, ...replacements);
    }
    textSegments.value = newSegments;

    // 等待 DOM 更新後，將游標移動到換行符號之後 (位置 + 1)
    await nextTick();
    const newCursorPos = globalStart + 1;
    setSelectionByGlobalOffsets(newCursorPos, newCursorPos);
  } else if (event.key === "Backspace" || event.key === "Delete") {
    event.preventDefault();

    // 1. 計算要刪除的全域範圍
    const globalStartCursor = getGlobalOffset(startIndex, startOffset);
    let deleteStart = globalStartCursor;
    let deleteEnd = globalStartCursor;

    const isSelection = startIndex !== endIndex || startOffset !== endOffset;

    if (isSelection) {
      // 如果有選取範圍，則刪除選取範圍
      const globalEndCursor = getGlobalOffset(endIndex, endOffset);
      deleteStart = Math.min(globalStartCursor, globalEndCursor);
      deleteEnd = Math.max(globalStartCursor, globalEndCursor);
    } else {
      // 如果是游標狀態
      if (event.key === "Backspace") {
        if (deleteStart > 0) {
          deleteStart--; // 刪除游標前一個字元
        } else {
          return; // 已經在最前面，無法刪除
        }
      } else {
        // Delete 鍵
        const totalLen = textSegments.value.reduce((acc, cur) => acc + cur.text.length, 0);
        if (deleteEnd < totalLen) {
          deleteEnd++; // 刪除游標後一個字元
        } else {
          return; // 已經在最後面，無法刪除
        }
      }
    }

    // 2. 根據刪除範圍重建 Segments
    const startPos = getSegmentPosFromGlobal(deleteStart);
    const endPos = getSegmentPosFromGlobal(deleteEnd);
    const newSegments: ITextSegment[] = [];

    for (let i = 0; i < textSegments.value.length; i++) {
      const seg = textSegments.value[i];
      if (!seg) continue;
      if (i < startPos.index) {
        newSegments.push(seg);
      } else if (i > endPos.index) {
        newSegments.push(seg);
      } else if (i === startPos.index && i === endPos.index) {
        // 刪除範圍在同一個 segment 內
        const newText = seg.text.substring(0, startPos.offset) + seg.text.substring(endPos.offset);
        if (newText.length > 0) newSegments.push({ ...seg, text: newText });
      } else if (i === startPos.index) {
        // 刪除範圍的起始 segment
        const newText = seg.text.substring(0, startPos.offset);
        if (newText.length > 0) newSegments.push({ ...seg, text: newText });
      } else if (i === endPos.index) {
        // 刪除範圍的結束 segment
        const newText = seg.text.substring(endPos.offset);
        if (newText.length > 0) newSegments.push({ ...seg, text: newText });
      }
      // 介於 startPos.index 和 endPos.index 之間的 segments 會被略過 (刪除)
    }

    // 3. 若結果為空，保持一個空的 segment 以維持編輯器運作
    if (newSegments.length === 0) {
      newSegments.push({ text: " ", color: "black" });
    }

    textSegments.value = newSegments;

    // 4. 還原游標位置
    await nextTick();
    setSelectionByGlobalOffsets(deleteStart, deleteStart);
  }
};

// 暴露方法給父元件使用
defineExpose({
  applyColorToSelection,
  getText
});

onMounted(() => {
  document.addEventListener("selectionchange", handleSelectionChange);
});
onUnmounted(() => {
  document.removeEventListener("selectionchange", handleSelectionChange);
});
</script>

<template>
<div class="text-editable-container">
  <div 
    ref="textEditableRef" 
    class="text-editable" 
    contenteditable="true" 
    @keydown="handleKeydown"
    @input="handleInput"
    @compositionstart="handleCompositionStart"
    @compositionend="handleCompositionEnd"
    @paste="handlePaste"
  >
    <div>
      <template v-for="textSegment in textSegments">
        <span :style="{ color: textSegment.color }">{{ textSegment.text }}</span>
      </template>
    </div>
  </div>
  <el-button style="position: absolute; left: 0; top: 40px;" @click="applyColorToSelection(getRandomRgbColor())">rand-color</el-button>
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
  white-space: pre-wrap; /* 確保換行符號正確顯示 */

  &:focus {
    outline: none; /* 移除預設藍色外框 */
    border-color: #007bff; /* 換成其他顏色 */
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); /* 增加陰影 */
  }
}
</style>
