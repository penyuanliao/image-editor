<script setup lang="ts">
import Symbols from "../Symbols.vue";
import {reactive} from "vue";

const emits = defineEmits(['change']);

const popoverMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  element: null as HTMLElement | null,
})

const handleOnClick = (value: string) => {
  emits('change', value);
}
</script>

<template>
  <div class="popover">
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
    </div>

  </div>
</template>

<style scoped>
.popover {
  position: fixed;
  width: 100px;
  height: 36px;
  background-color: white;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2), 0 2px 6px 0 rgba(0, 0, 0, 0.19);
  border-radius: 8px;
  z-index: 100;

}
.icon {
  width: 20px;
  height: 20px;
  color: #3a3a3a;
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
      border: #3a3a3a solid 1px;
    }
  }
}
</style>