<script setup lang="ts">

import { Delete, Lock } from "@element-plus/icons-vue";
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
  visible: {
    type: Boolean,
    default: false
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
      <el-dropdown-menu>
        <el-dropdown-item :icon="Delete" command="delete">
          <div class="item-text"><span>删除</span><span>Backspace</span></div>
        </el-dropdown-item>
        <el-dropdown-item :icon="Lock" command="lock">
          <div class="item-text"><span>鎖定</span><span>Ctrl + L</span></div>
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
  width: 100%;
}
</style>