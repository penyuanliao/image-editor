<script setup lang="ts">

const props = defineProps([ "label", "data", "selected"]);
const emits = defineEmits(['item-click', "update:selected"]);

const onItemClickHandle = (value: any, index: number) => {
  emits('update:selected', index);
  emits('item-click', value);
}

</script>

<template>
  <div class="gallery">
    <span class="label">{{ props.label }}></span>
    <div class="image-wrapper">
      <slot v-if="$slots.default"/>
      <div
          v-else
          v-for="(item, index) in props.data"
          :key="index"
          class="image-grid"
          @click="onItemClickHandle(item.value, index)">
        <img v-if="item.url" :src="item.url" alt=""/>
        <div class="content" :class="{ selected: index === selected }">
          <span v-if="item.title">{{ item.title }}</span>
          <span v-if="item.content">{{ item.content }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/theme";

.gallery {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 20px;
}
.image-wrapper {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-between;
  gap: 10px;
}
.image-grid {
  width: 140px;
  height: 80px;
  flex-shrink: 0;
  background-color: rgba(80, 80, 80, 0.3);
  border-radius: 5px;
  margin-top: 5px;
  margin-bottom: 5px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background-size: cover;
  background-position: center;
  &:active {
    background-color: rgba(80, 80, 80, 0.6);
  }
  &:hover {
    background-color: rgba(80, 80, 80, 0.6);
  }
}
.image-grid span {
  font-size: 15px;
}
.content {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.selected {
  border: 2px solid theme.$secondary-color;
  border-radius:  5px;
}
</style>