<script setup lang="ts">
import { ref, watch, onMounted, computed, nextTick } from "vue";
import { ElementTypesEnum } from "@/types.ts";
import { useEditorStore } from "@/store/editorStore.ts";

const emit = defineEmits(["updateScroll"]);
const editorStore = useEditorStore();

// 延伸寬度不包含本體
const props = defineProps({
  minX: { type: Number, default: 0 },
  maxX: { type: Number, required: true },
  minY: { type: Number, default: 0 },
  maxY: { type: Number, required: true }
});

// Initialize at (0,0) which is the center due to CSS centering
const translateX = ref(0);
const translateY = ref(0);

// Refs for tracks
const viewport = ref<HTMLDivElement | null>(null);
const trackX = ref<HTMLDivElement | null>(null);
const trackY = ref<HTMLDivElement | null>(null);

// Horizontal thumb state
const thumbWidth = ref(20);
const thumbLeft = ref(0);
let isDraggingX = false;
let dragStartX = 0;
let startThumbLeft = 0;

// Vertical thumb state
const thumbHeight = ref(20);
const thumbTop = ref(0);
let isDraggingY = false;
let dragStartY = 0;
let startThumbTop = 0;

const totalRangeX = computed(() => props.maxX - props.minX);
const totalRangeY = computed(() => props.maxY - props.minY);

const showHorizontalScrollbar = computed(() => totalRangeX.value > 0);
const showVerticalScrollbar = computed(() => totalRangeY.value > 0);

const container = ref<HTMLDivElement | null>(null);
const parentElement = ref<HTMLElement | null>(null);

const updateThumbs = () => {
  updateHorizontalThumb();
  updateVerticalThumb();
  handleUpdateScroll(translateX.value, translateY.value);
};

const updateHorizontalThumb = () => {
  if (!trackX.value || !showHorizontalScrollbar.value || totalRangeX.value <= 0) {
    thumbLeft.value = 0;
    return;
  }
  const trk = trackX.value;
  const visibleWidth = trk.clientWidth;

  thumbWidth.value = Math.max(
    30,
    (visibleWidth / (totalRangeX.value + visibleWidth)) * visibleWidth
  );
  const ratioX = (translateX.value - props.minX) / totalRangeX.value;
  thumbLeft.value = ratioX * (visibleWidth - thumbWidth.value);
};

const updateVerticalThumb = () => {
  if (!trackY.value || !showVerticalScrollbar.value || totalRangeY.value <= 0) {
    thumbTop.value = 0;
    return;
  }
  const trk = trackY.value;
  const visibleHeight = trk.clientHeight;

  thumbHeight.value = Math.max(
    30,
    (visibleHeight / (totalRangeY.value + visibleHeight)) * visibleHeight
  );
  const ratioY = (translateY.value - props.minY) / totalRangeY.value;
  thumbTop.value = ratioY * (visibleHeight - thumbHeight.value);
};

const onWheel = (e: WheelEvent) => {
  if (e.ctrlKey || e.metaKey) return;
  e.preventDefault();
  const newTranslateX = translateX.value + e.deltaX;
  const newTranslateY = translateY.value + e.deltaY;
  if (showHorizontalScrollbar.value) {
    translateX.value = Math.min(Math.max(newTranslateX, props.minX), props.maxX);
    editorStore.viewTranslate.x = translateX.value;
  }
  if (showVerticalScrollbar.value) {
    translateY.value = Math.min(Math.max(newTranslateY, props.minY), props.maxY);
    editorStore.viewTranslate.y = translateY.value;
  }
  updateThumbs();
};

// Track Click Handlers
const onTrackClickX = (e: MouseEvent) => {
  const rect = trackX.value?.getBoundingClientRect();
  const offset = e.clientX - (rect?.left || 0);
  const visibleWidth = trackX.value?.clientWidth || 1;

  const ratio = (offset - thumbWidth.value / 2) / (visibleWidth - thumbWidth.value);
  translateX.value = props.minX + ratio * totalRangeX.value;
  translateX.value = Math.min(Math.max(translateX.value, props.minX), props.maxX);
  editorStore.viewTranslate.x = translateX.value;
  updateHorizontalThumb();
};

const onTrackClickY = (e: MouseEvent) => {
  const rect = trackY.value?.getBoundingClientRect();
  const offset = e.clientY - (rect?.top || 0);
  const visibleHeight = trackY.value?.clientHeight || 1;

  const ratio = (offset - thumbHeight.value / 2) / (visibleHeight - thumbHeight.value);
  translateY.value = props.minY + ratio * totalRangeY.value;
  translateY.value = Math.min(Math.max(translateY.value, props.minY), props.maxY);
  editorStore.viewTranslate.y = translateY.value;
  updateVerticalThumb();
};

// Horizontal Thumb Drag Handlers
const onThumbDownX = (e: MouseEvent) => {
  isDraggingX = true;
  dragStartX = e.clientX;
  startThumbLeft = thumbLeft.value;
  document.addEventListener("mousemove", onThumbMoveX);
  document.addEventListener("mouseup", onThumbUpX);
};

const onThumbMoveX = (e: MouseEvent) => {
  if (!isDraggingX) return;
  const visibleWidth = trackX.value?.clientWidth || 1;
  const diff = e.clientX - dragStartX;
  const newLeft = Math.min(Math.max(startThumbLeft + diff, 0), visibleWidth - thumbWidth.value);
  thumbLeft.value = newLeft;
  const ratio = newLeft / (visibleWidth - thumbWidth.value);
  translateX.value = props.minX + ratio * totalRangeX.value;
  editorStore.viewTranslate.x = translateX.value;
};

const onThumbUpX = () => {
  isDraggingX = false;
  document.removeEventListener("mousemove", onThumbMoveX);
  document.removeEventListener("mouseup", onThumbUpX);
};

// Vertical Thumb Drag Handlers
const onThumbDownY = (e: MouseEvent) => {
  isDraggingY = true;
  dragStartY = e.clientY;
  startThumbTop = thumbTop.value;
  document.addEventListener("mousemove", onThumbMoveY);
  document.addEventListener("mouseup", onThumbUpY);
};

const onThumbMoveY = (e: MouseEvent) => {
  if (!isDraggingY) return;
  const visibleHeight = trackY.value?.clientHeight || 1;
  const diff = e.clientY - dragStartY;
  const newTop = Math.min(Math.max(startThumbTop + diff, 0), visibleHeight - thumbHeight.value);
  thumbTop.value = newTop;
  const ratio = newTop / (visibleHeight - thumbHeight.value);
  translateY.value = props.minY + ratio * totalRangeY.value;
  editorStore.viewTranslate.y = translateY.value;
};

const onThumbUpY = () => {
  isDraggingY = false;
  document.removeEventListener("mousemove", onThumbMoveY);
  document.removeEventListener("mouseup", onThumbUpY);
};

const centerView = () => {
  scrollTo(0, 0);
};

const scrollTo = (x: number, y: number) => {
  if (showHorizontalScrollbar.value) {
    translateX.value = Math.min(Math.max(x, props.minX), props.maxX);
    editorStore.viewTranslate.x = translateX.value;
  }
  if (showVerticalScrollbar.value) {
    translateY.value = Math.min(Math.max(y, props.minY), props.maxY);
    editorStore.viewTranslate.y = translateY.value;
  }
  updateThumbs();
};

const handlePointerUp = (event: PointerEvent) => {
  event.preventDefault();
  if (
    editorStore.selectedElement?.type !== ElementTypesEnum.Stage &&
    editorStore.selectedElements &&
    editorStore.selectedElements.length !== 0
  ) {
    editorStore.saveHistory();
    editorStore.clearSelection();
  }
};
const handleUpdateScroll = (x: number, y: number) => {
  emit("updateScroll", { x, y });
};

onMounted(() => {
  if (viewport.value) {
    viewport.value.addEventListener("wheel", onWheel, { passive: false });
  }
  parentElement.value = container.value?.parentElement || null;
  updateThumbs();
});

watch(
  () => [props.minX, props.maxX, props.minY, props.maxY],
  async () => {
    // console.log(`minX=%s, maxX=%s, minY=%s, maxY=%s`, props.minX, props.maxX, props.minY, props.maxY);
    // 當滾動範圍變化時，確保目前的 translate 值仍在新的範圍內
    translateX.value = Math.min(Math.max(translateX.value, props.minX), props.maxX);
    translateY.value = Math.min(Math.max(translateY.value, props.minY), props.maxY);
    editorStore.viewTranslate.x = translateX.value;
    editorStore.viewTranslate.y = translateY.value;

    // 等待 DOM 更新 (v-if 可能會新增/移除滾動條)
    await nextTick();
    updateThumbs(); // 在 DOM 更新後再計算滾動條狀態
  },
  { flush: "post" }
);

// Expose public API
defineExpose({
  centerView,
  scrollTo,
  translateX,
  translateY,
  parentElement
});
</script>

<template>
  <div class="container" ref="container">
    <div class="main-area">
      <div class="viewport" ref="viewport" @pointerup.self="handlePointerUp">
        <div class="content">
          <slot />
        </div>
      </div>
      <div class="track-y" @mousedown="onTrackClickY" ref="trackY" v-if="showVerticalScrollbar">
        <div
          class="thumb-y"
          :style="{ height: thumbHeight + 'px', top: thumbTop + 'px' }"
          @mousedown.stop="onThumbDownY"
        ></div>
      </div>
    </div>
    <div class="track-x" @mousedown="onTrackClickX" ref="trackX" v-if="showHorizontalScrollbar">
      <div
        class="thumb-x"
        :style="{ width: thumbWidth + 'px', left: thumbLeft + 'px' }"
        @mousedown.stop="onThumbDownX"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.main-area {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
}

.viewport {
  flex-grow: 1;
  overflow: hidden;
}

.content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0s;
}

.track-x {
  position: relative;
  width: calc(100% - 16px);
  height: 8px;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 8px;
}

.thumb-x {
  position: absolute;
  height: 100%;
  background: #c1c1c1;
  border-radius: 4px;
  cursor: grab;
}

.thumb-x:hover {
  background: #a8a8a8;
}

.track-y {
  position: relative;
  width: 8px;
  height: 100%;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
}

.thumb-y {
  position: absolute;
  width: 100%;
  background: #c1c1c1;
  border-radius: 4px;
  cursor: grab;
}

.thumb-y:hover {
  background: #a8a8a8;
}
</style>
