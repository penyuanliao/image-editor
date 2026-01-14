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

const marqueeContainer = ref<HTMLDivElement | null>(null);
const content = ref<HTMLDivElement | null>(null);
let tween: gsap.core.Tween | null = null;

const initMarquee = async () => {
  await nextTick();
  if (!marqueeContainer.value || !content.value) return;

  // 清除舊動畫
  if (tween) tween.kill();

  const containerWidth = marqueeContainer.value.offsetWidth;
  const contentWidth = content.value.offsetWidth;

  if (containerWidth === 0) return;

  // 計算總距離與動態時間：保持速度一致
  // 公式：(總距離 / 容器寬度) * 基準時間
  const distance = containerWidth + contentWidth;
  const dynamicDuration = (distance / containerWidth) * props.duration;

  // 設定初始位置在容器右側外
  gsap.set(content.value, { x: containerWidth });

  // 動畫：從右側外移動到左側外，無限循環
  tween = gsap.to(content.value, {
    x: -contentWidth,
    duration: dynamicDuration,
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
  <div class="container">
    <el-icon size="34" class="icon">
      <svg
        width="33"
        height="22"
        viewBox="0 0 33 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M31.8499 7.8562H26.1501C25.5151 7.8562 25.0002 8.3683 25.0002 9C25.0002 9.63171 25.5151 10.1438 26.1501 10.1438H31.8499C32.485 10.1438 32.9998 9.63171 32.9998 9C32.9998 8.3683 32.485 7.8562 31.8499 7.8562Z"
          fill="#F15624"
        />
        <path
          d="M26.7932 4.4883L30.3619 2.09242C30.8879 1.73925 31.0267 1.02782 30.6717 0.504607C30.3166 -0.0186061 29.6014 -0.156676 29.0754 0.196493L25.5067 2.59237C24.9807 2.94554 24.8418 3.65624 25.1976 4.18018C25.5534 4.70412 26.2679 4.84147 26.7939 4.4883H26.7932Z"
          fill="#F15624"
        />
        <path
          d="M30.3617 15.9086L26.793 13.5127C26.267 13.1596 25.5518 13.2969 25.1967 13.8208C24.8417 14.3441 24.9797 15.0555 25.5065 15.4086L29.0752 17.8045C29.6012 18.1577 30.3164 18.0204 30.6715 17.4964C31.0265 16.9732 30.8885 16.2618 30.3617 15.9086Z"
          fill="#F15624"
        />
        <path
          d="M20.8195 0.100273L8.99525 4.39935H5.3155C2.38011 4.39935 0 6.73586 0 9.6175C0 11.8715 1.45579 13.7922 3.49559 14.5215L0.422243 20.9949C0.199568 21.463 0.548286 21.9999 1.07486 21.9999H5.5977C6.06686 21.9999 6.4947 21.7366 6.69847 21.3214L9.78792 15.0405L20.8902 18.5119C21.9342 18.8384 23 18.0734 23 16.9976V1.59058C23 0.483849 21.8761 -0.28399 20.8188 0.100273H20.8195ZM2.18964 9.54394C2.23026 7.86803 3.66644 6.5482 5.37432 6.5482H8.90422V12.6868H5.3155C3.56631 12.6868 2.14833 11.2693 2.18964 9.54325V9.54394ZM4.67409 20.2806H3.12516C3.00542 20.2806 2.92629 20.1576 2.97811 20.0517L5.52347 14.8583L7.74743 14.8996L5.15585 19.9885C5.06482 20.1679 4.87785 20.2806 4.67409 20.2806ZM20.8111 15.3649C20.8111 15.7939 20.386 16.0991 19.9694 15.9692L11.1079 13.1982V5.92266L19.9414 2.71106C20.3629 2.55777 20.8118 2.86436 20.8118 3.30568V15.3649H20.8111Z"
          fill="#F15624"
        />
      </svg>
    </el-icon>
    <div class="marquee-container" ref="marqueeContainer">
      <div class="marquee-content" ref="content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  width: 100%;
  position: relative;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
}
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
  color: black;
}
.icon {
  position: relative;
  justify-content: center;
}
</style>
