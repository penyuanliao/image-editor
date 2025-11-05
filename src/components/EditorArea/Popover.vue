<script setup lang="ts">
import Symbols from "../Symbols.vue";
import {nextTick, onMounted, onUpdated, reactive, ref} from "vue";

const emits = defineEmits(['change']);

const popoverRef = ref<HTMLDivElement | null>(null);
const controls = ref<HTMLDivElement | null>(null);

const popoverMenu = reactive({
  route: 'image',
  menus: [
    {
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
    },
    {
      event: 'delete',
      icon: 'delete',
      title: '刪除'
    }
  ]
});

const updatePosition = () => {
  nextTick(() => {
    const element = popoverRef.value as HTMLDivElement;
    const e = controls.value as HTMLDivElement;
    element.style.left = `${(-1 * element.offsetWidth / 2)}px`;
    element.style.top = `${-1 * element.offsetHeight / 2}px`
    console.log(e.offsetHeight, element.clientHeight);
  })
}

onMounted(updatePosition);
onUpdated(updatePosition)

const handleOnClick = (value: string) => {
  emits('change', value);
}

</script>

<template>
  <div class="popover" ref="popoverRef">
    <div class="button-group" ref="controls">
      <template v-for="item in popoverMenu.menus">
        <el-tooltip
            :content="item.title"
            placement="top">
          <div @click="handleOnClick(item.event)">
        <span class="icon">
          <Symbols :name="item.icon"/>
        </span>
          </div>
        </el-tooltip>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/theme";

.popover {
  position: absolute;
  display: flex;
  width: 100%;
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
</style>