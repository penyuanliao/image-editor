<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['delete-selected', 'move-selected', 'text-editing']);

const handleKeyDown = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement;

  // 如果焦點在輸入框或可編輯區域，則忽略快捷鍵，避免干擾打字
  if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) {
    return;
  }

  // 處理組合鍵 (如 Ctrl+B)
  if (event.ctrlKey || event.metaKey) { // metaKey 對應 Mac 的 Command 鍵
    if (event.key.toLowerCase() === 'b') {
      event.preventDefault(); // 防止瀏覽器預設的粗體行為
      emit('text-editing', 'text', 'bold');
    }
  }
  // 根據按下的按鍵執行不同操作
  switch (event.key) {
    case 'Delete':
    case 'Backspace':
      event.preventDefault(); // 防止在某些瀏覽器上觸發返回上一頁
      emit('delete-selected');
      break;
    case 'ArrowUp':
      event.preventDefault();
      emit('move-selected', { dx: 0, dy: -1 });
      break;
    case 'ArrowDown':
      event.preventDefault();
      emit('move-selected', { dx: 0, dy: 1 });
      break;
    case 'ArrowLeft':
      event.preventDefault();
      emit('move-selected', { dx: -1, dy: 0 });
      break;
    case 'ArrowRight':
      event.preventDefault();
      emit('move-selected', { dx: 1, dy: 0 });
      break;
  }
};

// 在元件掛載時新增監聽器
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

// 在元件卸載時移除監聽器，防止記憶體洩漏
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template><!-- 此元件不渲染任何內容 --></template>