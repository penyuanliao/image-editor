<script setup lang="ts">
import { ref, watch } from "vue";
import gsap from "gsap";

const selectedIndex = ref(0);
const viewWidth = 280; // 每個 view 的寬度
const contentWrapper = ref<HTMLDivElement | null>(null);

const handleViewClick = (index: number) => {
  selectedIndex.value = index;
};

watch(selectedIndex, (newIndex) => {
  if (contentWrapper.value) {
    gsap.to(contentWrapper.value, {
      x: -newIndex * viewWidth,
      duration: 0.4,
      ease: "power2.inOut",
    });
  }
});
</script>

<template>
  <div class="viewport">
    <div class="content-wrapper" ref="contentWrapper">
      <div class="view view-a" @click="handleViewClick(1)">
        <div class="header">
          <el-icon size="20">
            <svg width="24" height="24" viewBox="0 0 0.51 0.51" xmlns="http://www.w3.org/2000/svg"><path d="M.45.225A.165.165 0 0 1 .285.39H.198l.079.079L.256.49.14.375.256.259.277.28.198.36h.087C.359.36.42.299.42.225S.359.09.285.09H.073V.06h.212C.376.06.45.134.45.225"/></svg>
          </el-icon>
        </div>
      </div>
      <div class="view-b" @click="handleViewClick(2)">View B</div>
      <div class="view-c" @click="handleViewClick(0)">View C</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.viewport {
  width: 280px;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.content-wrapper {
  display: flex;
  height: 100%;

  .view-a {
    min-width: 280px;
    min-height: 400px;
    background-color: #cccccc;

  }
  .view-b {
    min-width: 280px;
    min-height: 400px;
    background-color: #D9D9D9;

  }
  .view-c {
    min-width: 280px;
    min-height: 400px;
    background-color: #cccccc;

  }
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  border: #f15624 solid 1px;
}

</style>