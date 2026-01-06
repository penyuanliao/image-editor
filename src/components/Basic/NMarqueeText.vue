<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick } from "vue";
import gsap from "gsap";

const props = defineProps({
  duration: {
    type: Number,
    default: 10
  },
  loop: {
    type: Boolean,
    default: true
  }
});

const container = ref<HTMLDivElement | null>(null);
const content = ref<HTMLDivElement | null>(null);
let tween: gsap.core.Tween | null = null;

const initMarquee = async () => {
  await nextTick();
  if (!container.value || !content.value) return;

  // 清除舊動畫
  if (tween) tween.kill();

  const containerWidth = container.value.offsetWidth;
  const contentWidth = content.value.offsetWidth;

  // 設定初始位置在容器右側外
  gsap.set(content.value, { x: containerWidth });

  // 動畫：從右側外移動到左側外，無限循環
  tween = gsap.to(content.value, {
    x: -contentWidth,
    duration: props.duration,
    ease: "none",
    repeat: props.loop ? -1 : 1
  });
};

onMounted(() => {
  initMarquee();
  window.addEventListener("resize", initMarquee);
});

onUnmounted(() => {
  if (tween) tween.kill();
  window.removeEventListener("resize", initMarquee);
});
</script>

<template>
  <div class="marquee-container" ref="container">
    <div class="marquee-content" ref="content">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
  .marquee-container {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    position: relative;
  }
  .marquee-content {
    display: inline-block;
    white-space: nowrap;
    will-change: transform;
  }
</style>