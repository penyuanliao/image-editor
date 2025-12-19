<script setup lang="ts">
import { computed, onBeforeUpdate, type PropType, ref, watch } from "vue";
import { useEditorStore } from "@/store/editorStore.ts";
import draggable from "vuedraggable";
import { ElementTypesEnum, type ICanvasElement, type ITextConfig } from "@/types.ts";
import { Lock } from "@element-plus/icons-vue";
import { nanoid } from "nanoid";
import { storeToRefs } from "pinia";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import NImage from "@/components/Basic/NImage.vue";

gsap.registerPlugin(ScrollToPlugin);

const props = defineProps({
  // 排序方式
  stageSettingPosition: {
    type: String as PropType<"top" | "bottom">,
    default: "top",
    validator: (value: string) => {
      return ["top", "bottom"].includes(value);
    }
  },
  scrollToSelected: {
    type: Boolean,
    default: false
  }
});

const editorStore = useEditorStore();

const { elements } = storeToRefs(editorStore);

const layersContainer = ref<HTMLDivElement | null>(null);

const layerRefs = ref<Map<string, HTMLElement>>(new Map());

const reversedElements = computed({
  get() {
    return [...elements.value].reverse();
  },
  set(newValue) {
    elements.value = [...newValue].reverse();
  }
});
const onClickLayerHandle = (event: MouseEvent, element: ICanvasElement) => {
  if (event.ctrlKey || event.metaKey) {
    editorStore.addToSelection(element);
  } else {
    editorStore.setSelectedOnce(element);
  }
};
const onClickBGHandle = () => {
  const el = {
    id: nanoid(12),
    type: ElementTypesEnum.Stage,
    name: "stage",
    config: {
      width: editorStore.originalImage?.width,
      height: editorStore.originalImage?.height,
      x: 0,
      y: 0
    }
  } as ICanvasElement;
  editorStore.setSelectedOnce(el);
};
const layersObjectStyle = () => {
  return {
    "--layout-direction": props.stageSettingPosition === "top" ? "column" : "column-reverse"
  };
};
const textElementStyle = (element: ICanvasElement) => {
  const config = element.config as ITextConfig;
  return {
    color: config.color,
    "text-align": config.textAlign
  };
};
const setLayerRef = (el: Element | null, id: string) => {
  if (el instanceof HTMLElement) {
    layerRefs.value.set(id, el);
  }
};
onBeforeUpdate(() => {
  layerRefs.value.clear();
});

watch(
  () => editorStore.selectedElements,
  (newSelection) => {
    if (newSelection.length === 1 && layersContainer.value) {
      const selectedId = newSelection[0]?.id;
      if (!selectedId) return;
      const targetElement = layerRefs.value.get(selectedId);

      if (targetElement) {
        const containerRect = layersContainer.value.getBoundingClientRect();
        const elementRect = targetElement.getBoundingClientRect();

        // 檢查元素是否完全在容器的可視範圍內
        const isVisible =
          elementRect.top >= containerRect.top && elementRect.bottom <= containerRect.bottom;

        // 如果元素不在可視範圍內，才執行滾動
        if (!isVisible && props.scrollToSelected) {
          gsap.to(layersContainer.value, {
            duration: 0.5,
            scrollTo: { y: targetElement, offsetY: 100 },
            ease: "power2.out"
          });
        }
      }
    }
  },
  { deep: true, flush: "post" }
);
</script>

<template>
  <section ref="layersContainer" class="layers-section">
    <div class="layers-background">
      <div class="layers-object" :style="layersObjectStyle()">
        <div class="layers-wrapper">
          <div class="layer" @click="onClickBGHandle">
            <div class="mask"><span>背景</span></div>
            <img v-if="editorStore.originalImage" :src="editorStore.originalImage?.src" alt="" />
          </div>
        </div>
        <el-divider border-style="dashed" v-if="reversedElements.length > 0" />
        <draggable
          v-show="reversedElements.length > 0"
          v-model="reversedElements"
          item-key="id"
          class="layers-wrapper"
          ghost-class="ghost"
          :animation="150"
        >
          <template #item="{ element }">
            <div
              :class="{
                layer: true,
                selected: editorStore.selectedElements.includes(element)
              }"
              :ref="(el) => setLayerRef(el as Element, element.id)"
              @click="(event) => onClickLayerHandle(event, element)"
            >
              <NImage
                v-if="element.type === ElementTypesEnum.Image"
                :src="element.config.url"
                alt=""
                fit="contain"
              />
              <div class="text-editor-input" v-else :style="textElementStyle(element)">
                {{ element.config.content }}
              </div>
              <div v-if="!element.config.draggable" class="state">
                <el-icon size="16" class="icon"><Lock /></el-icon>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use "@/styles/theme";

.layers-section {
}

.layers-background {
  position: relative;
  display: flex;
  width: 122px;
  height: 100%;
  border-radius: 20px;
  background-color: theme.$panel-background-color;
  box-shadow: 0 3px 3px 0 theme.$shadow-color;
}

.layers-object {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: flex-start;
  flex-direction: var(--layout-direction, column);
  flex-wrap: nowrap;
  align-items: center;
  overflow: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  gap: 16px;
  padding-top: 16px;
  padding-bottom: 16px;
  span {
    font-size: 18px;
    font-weight: 400;
    color: white;
    font-family: theme.$font-family;
  }
}
.layers-object :deep(.el-divider) {
  margin: 0 0;
}
.layers-wrapper {
  width: 100%;
  min-width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  box-sizing: border-box;
  border-radius: 5px;
}
.layer {
  width: 80px;
  height: 80px;
  font-size: 12px;
  display: flex;
  position: relative;
  align-items: center; /* Vertically center the text */
  justify-content: center;
  cursor: grab;
  background-color: #f5f5f5;
  color: theme.$primary-color;
  border-radius: 5px;
  box-sizing: border-box;
  overflow: hidden;
  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  border: 2px solid transparent; /* Add a transparent border by default */
  img {
    position: relative;
    width: 72px;
    height: 72px;
    object-fit: contain;
  }
}
.layer:hover {
  border-color: #78efb2; /* Only change the color on hover */
}
.selected {
  border-color: #78efb2;
}
.mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #00000080;
  border-radius: 5px;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-editor-input {
  white-space: pre;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  width: 100%;
  max-height: 100%;
}
.state {
  position: absolute;
  display: flex;
  left: 5px;
  bottom: 5px;
  justify-content: center;
  align-items: center;
  .icon {
    background-color: rgba(0, 0, 0, 1);
    padding: 4px 4px;
    border-radius: 4px;
  }
}

.ghost {
  opacity: 0.5;
  background: #409eff;
}
</style>
