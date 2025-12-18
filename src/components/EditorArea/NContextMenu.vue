<script setup lang="ts">

import {CopyDocument, Delete, Lock, Unlock, List} from "@element-plus/icons-vue";
import {type PropType, ref, watch} from "vue";
import type {DropdownInstance} from "element-plus";

const props = defineProps({
  position: {
    type: Object as PropType<DOMRect>,
    required: true,
    default: {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    }
  },
  lock: {
    type: Boolean,
    default: false
  },
  visible: {
    type: Boolean,
    default: false
  },
  element: {
    type: Object as PropType<any>,
    default: null
  }
});
const emit = defineEmits(['command']);

const contextMenuRef = ref<DropdownInstance>();

const triggerRef = ref({
  getBoundingClientRect: () => props.position
})

const handleCommand = (command: string) => {
  emit('command', command);
}

watch(() => props.visible, () => {
  if (props.visible) {
    contextMenuRef.value?.handleOpen();
  } else {
    contextMenuRef.value?.handleClose();
  }
});

</script>

<template>
  <el-dropdown
      ref="contextMenuRef"
      :show-arrow="false"
      :virtual-ref="triggerRef"
      :popper-options="{
              modifiers: [{ name: 'offset', options: { offset: [ 0, 0 ] }}]
            }"
      virtual-triggering
      placement="bottom-start"
      trigger="contextmenu"
      @command="handleCommand">
    <template #dropdown>
      <el-dropdown-menu v-if="props.element">
        <el-dropdown-item :icon="CopyDocument" command="copy">
          <div class="item-text"><span>複製</span><span>Ctrl + C</span></div>
        </el-dropdown-item>
        <el-dropdown-item :icon="List" command="paste">
          <div class="item-text"><span>貼上</span><span>Ctrl + V</span></div>
        </el-dropdown-item>
        <el-dropdown-item :icon="Delete" command="delete">
          <div class="item-text"><span>删除</span><span>Backspace</span></div>
        </el-dropdown-item>
        <el-dropdown-item v-if="props.lock" :icon="Lock" command="lock">
          <div class="item-text">
            <span>鎖定</span>
            <span>Ctrl +
              <el-icon size="14" class="shift">
                <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-shift"><path d="M7.27 2.047a1 1 0 0 1 1.46 0l6.345 6.77c.6.638.146 1.683-.73 1.683H11.5v3a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-3H1.654C.78 10.5.326 9.455.924 8.816zM14.346 9.5 8 2.731 1.654 9.5H4.5a1 1 0 0 1 1 1v3h5v-3a1 1 0 0 1 1-1z"/></svg>
              </el-icon>
            + L</span>
          </div>
        </el-dropdown-item>
        <el-dropdown-item v-else :icon="Unlock" command="unlock">
          <div class="item-text">
            <span>解除鎖定</span>
            <span>Ctrl +
              <el-icon size="14" class="shift">
                <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-shift"><path d="M7.27 2.047a1 1 0 0 1 1.46 0l6.345 6.77c.6.638.146 1.683-.73 1.683H11.5v3a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-3H1.654C.78 10.5.326 9.455.924 8.816zM14.346 9.5 8 2.731 1.654 9.5H4.5a1 1 0 0 1 1 1v3h5v-3a1 1 0 0 1 1-1z"/></svg>
              </el-icon>
            + L</span>
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
      <el-dropdown-menu v-else>
        <el-dropdown-item :icon="List" command="paste">
          <div class="item-text"><span>貼上</span><span>Ctrl + V</span></div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped lang="scss">
@use "@/styles/theme";

.el-dropdown-menu {
  width: 200px;
}

.item-text {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.shift {
  transform: translateY(1px) translateX(2px);
}
</style>