<script setup lang="ts">
import { Warning } from "@element-plus/icons-vue";
</script>

<template>
  <section class="error-container">
    <div class="icon">
      <el-icon size="50"><Warning /></el-icon>
    </div>
    <h1>Oops... page not found</h1>
    <p>The page you are looking for doesn't exist.</p>
  </section>
</template>

<style scoped lang="scss">
@use "@/styles/theme";

.error-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: black;

  .icon {
    width: 100px;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 999px;
    color: white;
    background-color: #f15624;
  }
}
</style>
