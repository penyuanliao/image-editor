<script setup lang="ts">

import { defineProps, defineEmits, ref, onMounted, onUpdated, onUnmounted } from "vue";

const props = defineProps(['options', 'selected', "update:options"]);


const selected = ref<String>(props.selected)

const emits = defineEmits(['update:selected', 'change']);

const onChangeHandle = (tag: string) => {
  selected.value = tag;
  emits('update:selected', tag);
  emits('change', tag);
}

const tagGroupRef = ref<HTMLElement | null>(null);
const showPrev = ref(false);
const showNext = ref(true);

const updateButtons = () => {
  if (tagGroupRef.value) {
    const { scrollLeft, scrollWidth, clientWidth } = tagGroupRef.value;
    showPrev.value = scrollLeft > 0;
    showNext.value = scrollLeft < scrollWidth - clientWidth - 1;
  }
};

onMounted(() => {
  if (tagGroupRef.value) {
    tagGroupRef.value.addEventListener('scroll', updateButtons);
    updateButtons();
  }
});

onUpdated(() => {
  updateButtons();
});

onUnmounted(() => {
  if (tagGroupRef.value) {
    tagGroupRef.value.removeEventListener('scroll', updateButtons);
  }
});

const prev = () => {
  if (tagGroupRef.value) {
    tagGroupRef.value.scrollBy({ left: -100, behavior: 'smooth' });
  }
};

const next = () => {
  if (tagGroupRef.value) {
    tagGroupRef.value.scrollBy({ left: 100, behavior: 'smooth' });
  }
};

</script>

<template>
  <div class="tag-control">
    <div class="tag-group" ref="tagGroupRef">
      <div
          v-for="(tag, index) in props.options"
          :key="`tag-${index}`"
          :class="{
              'tag-item': true,
              'active': selected === tag
            }"
          @pointerup="onChangeHandle(tag)"
      >
        {{ tag }}
      </div>
    </div>
    <div class="tag-ctrl-btn prev" @click="prev" v-if="showPrev">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 12L6 8L10 4" stroke="black" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div class="tag-ctrl-btn next" @click="next" v-if="showNext">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 12L10 8L6 4" stroke="black" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "../../styles/theme";

.tag-control {
  position: relative;
  display: flex;
  width: 100%;
  height: 47px;
  padding-top: 23px;
  padding-bottom: 23px;
  align-items: center;
  .tag-ctrl-btn {
    position: absolute;
    width: 19px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: white;
    box-shadow: 0 3px 4px 0 #3F3F401A;
    &:active {
      scale: 0.95;
    }
  }
  .prev {
    left: -1px;
  }
  .next {
    right: -1px;
  }
}
.tag-group {
  width: 100%;
  min-height: 34px;
  display: flex;
  position: relative;
  flex-direction: row;
  flex-wrap: nowrap;
  flex-shrink: 0;
  gap: 10px;
  overflow: hidden;
  &::-webkit-scrollbar {
    display: none;
  }
  .tag-item {
    flex-shrink: 0;
    width: auto;
    min-width: 24px;
    height: 34px;
    border-radius: 20px;
    border: 1px solid #ccc;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
    padding-left: 12px;
    padding-right: 12px;
    font-size: 15px;
    font-weight: 400;
    cursor: pointer;
    &.active {
      background-color: #FFC3B0;
      border-color: transparent;
    }
    &:hover {
      background-color: #FFC3B0;
      border-color: transparent;
      color: white;
    }
  }
}
</style>