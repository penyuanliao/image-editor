<script setup lang="ts">
import Symbols from "../Symbols.vue";
import { onMounted, reactive, ref } from "vue";

const emits = defineEmits(['change']);

const popoverRef = ref<HTMLDivElement | null>(null);

const popoverMenu = reactive({
  route: 'image',
  menus: [
    {
      event: 'delete',
      icon: 'delete',
      title: '刪除'
    }
  ]
});

onMounted(() => {
  console.log(`width:${popoverRef.value?.clientWidth}`);
})

const popoverWidth = () => {
  return popoverRef.value?.clientWidth || 0;
}

const handleOnClick = (value: string) => {
  emits('change', value);
}

defineExpose({ popoverWidth })
</script>

<template>
  <div class="popover" ref="popoverRef">
    <div class="button-group">
      <div @click="handleOnClick('left')">
        <span class="icon">
          <Symbols name="align-left"/>
        </span>
      </div>
      <div @click="handleOnClick('center')">
        <span class="icon">
          <Symbols name="align-center"/>
        </span>
      </div>
      <div @click="handleOnClick('right')">
        <span class="icon">
          <Symbols name="align-right"/>
        </span>
      </div>
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
  position: fixed;
  display: flex;
  width: auto;
  height: 36px;
  background-color: white;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2), 0 2px 6px 0 rgba(0, 0, 0, 0.19);
  border-radius: 8px;
  z-index: 100;
  padding: 0 6px;

}
.icon {
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.button-group {
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  flex-wrap: wrap;
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