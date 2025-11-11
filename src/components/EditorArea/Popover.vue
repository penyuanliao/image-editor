<script setup lang="ts">
import Symbols from "../Symbols.vue";
import {computed, nextTick, onMounted, onUpdated, reactive, ref} from "vue";
import {useImagesStore} from "@/store/images.ts";
import type {DropdownInstance} from "element-plus";
import NButton from "@/components/Basic/NButton.vue";
import NPosition from "@/components/Basic/NPosition.vue";
import {advancedDefaults} from "@/config/settings.ts";

const imagesStore = useImagesStore();

const emit = defineEmits(['change', 'alignElement']);

const popoverRef = ref<HTMLDivElement | null>(null);
const controls = ref<HTMLDivElement | null>(null);
const moveLayerDropdown = ref<DropdownInstance | null>(null);

const hasTop = computed(() => imagesStore.selectedIndex === imagesStore.elements.length - 1);

const hasBottom = computed(() => imagesStore.selectedIndex === 0);

const popoverMenu = reactive({
  route: 'image',
  menus: [
    /*    {
          event: 'left',
          icon: 'align-left',
          title: '靠左對齊'
        },
        {
          event: 'center',
          icon: 'align-center',
          title: '靠左對齊'
        },
        {
          event: 'right',
          icon: 'align-right',
          title: '靠左對齊'
        },*/
    {
      event: 'delete',
      icon: 'delete',
      title: '刪除'
    }
  ]
});

const handleMoveLayer = (value: "up" | "down" | "top" | "bottom") => {
  if (!imagesStore.selectedElement) return;
  switch (value) {
    case 'up':
      imagesStore.moveForwardElement(imagesStore.selectedElement.id);
      break;
    case 'down':
      imagesStore.moveBackwardElement(imagesStore.selectedElement.id);
      break;
    case 'top':
      imagesStore.moveTopElement(imagesStore.selectedElement.id);
      break;
    case 'bottom':
      imagesStore.moveBottomElement(imagesStore.selectedElement.id);
      break;

  }
}
const handlePositionChange = (value: string) => {

  if (value === 'flip-horizontal') {
    imagesStore.flipHorizontal();
  } else if (value === 'flip-vertical') {
    imagesStore.flipVertical();
  } else {
    const horizontally: string[] = ['left', 'center', 'right'];
    const vertically: string[] = ['top', 'middle', 'bottom'];
    let horizontal = null;
    let vertical = null;
    if (horizontally.includes(value)) {
      horizontal = value;
    }
    if (vertically.includes(value)) {
      vertical = value;
    }
    if (horizontal || vertical) {
      emit('alignElement', horizontal, vertical);
    }
  }
}


const updatePosition = () => {
  nextTick(() => {
    const element = popoverRef.value as HTMLDivElement;
    if (!element) return;
    // const e = controls.value as HTMLDivElement;
    element.style.left = `${(-1 * element.offsetWidth / 2)}px`;
    element.style.top = `${-1 * element.offsetHeight / 2}px`
  })
}

onMounted(updatePosition);
onUpdated(updatePosition)

const handleOnClick = (value: string) => {
  emit('change', value);
}

</script>

<template>
  <div class="popover" ref="popoverRef">
    <div class="button-group" ref="controls">
      <el-tooltip
          content="圖層"
          placement="top">
        <el-dropdown
            ref="moveLayerDropdown"
            placement="bottom-start"
            trigger="click"
            :showArrow="false">
          <el-button class="el-btn">
            <el-icon size="20">
              <Symbols name="layers"/>
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :disabled="hasTop" @pointerup="handleMoveLayer('top')">
                <el-icon size="20">
                  <Symbols name="layers-top"/>
                </el-icon>
                <span>移至頂層</span>
              </el-dropdown-item>
              <el-dropdown-item :disabled="hasTop" @pointerup="handleMoveLayer('up')">
                <el-icon size="20">
                  <Symbols name="layers-up"/>
                </el-icon>
                <span>上移一層</span>
              </el-dropdown-item>
              <el-dropdown-item :disabled="hasBottom" @pointerup="handleMoveLayer('down')">
                <el-icon size="20">
                  <Symbols name="layers-down"/>
                </el-icon>
                <span>下移一層</span>
              </el-dropdown-item>
              <el-dropdown-item :disabled="hasBottom" @pointerup="handleMoveLayer('bottom')">
                <el-icon size="20">
                  <Symbols name="layers-bottom"/>
                </el-icon>
                <span>移至底層</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-tooltip>
      <NPosition :flipEnabled="false" v-if="advancedDefaults.alignEnabled" @change="handlePositionChange">
        <NButton icon="align-left" size="20" tip="對齊"></NButton>
      </NPosition>
      <template v-for="item in popoverMenu.menus">
        <NButton :tip="item.title" size="20" :icon="item.icon" @click="handleOnClick(item.event)"/>
      </template>
      <slot/>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/theme";

.popover {
  position: absolute;
  display: flex;
  width: fit-content;
  height: 36px;
  background-color: white;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2), 0 2px 6px 0 rgba(0, 0, 0, 0.19);
  border-radius: 8px;
  z-index: 100;
  padding: 0 6px;
  top: 0;
  left: 0;
  flex-wrap: nowrap;
}

.icon {
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.button-group {
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  flex-wrap: nowrap;
  flex-shrink: 0;
  gap: 4px;
  color: #3a3a3a;

  div {
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-radius: 4px;
    box-sizing: border-box;

    &:hover {
      background-color: #EEEEEE;
    }
  }
}

.el-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  padding: 0 0;
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

:deep(.el-dropdown-menu__item) {
  &:not(.is-disabled):hover,
  &:not(.is-disabled):focus {
    background-color: #EEEEEE;
    color: #3a3a3a;
  }

  &.is-disabled:focus {
    background-color: transparent;
    color: var(--el-color-info-light-3);
  }
}

</style>