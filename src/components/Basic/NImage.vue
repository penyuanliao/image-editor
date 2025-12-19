<script setup lang="ts">
import { Picture } from "@element-plus/icons-vue";
</script>

<template>
  <el-image v-bind="$attrs" lazy>
    <template #placeholder>
      <div class="skeleton" />
    </template>
    <template #error>
      <div class="image-error">
        <el-icon size="24"><Picture /></el-icon>
      </div>
    </template>
  </el-image>
</template>

<style scoped lang="scss">
@use "@/styles/theme";
.el-image {
  width: 100%;
  height: 100%;
}
.skeleton {
  width: 100%;
  height: 100%;
  background-color: rgba(80, 80, 80, 0.1);
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    animation: scan 1.5s infinite;
  }
}

@keyframes scan {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
