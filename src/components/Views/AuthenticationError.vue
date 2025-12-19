<script setup lang="ts"></script>

<template>
  <section class="error-container">
    <div class="icon">
      <el-icon size="50">
        <svg width="50" height="50" viewBox="0 0 1.5 1.5" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="none"
            d="M.188.813V.264L.309.255A1 1 0 0 0 .617.181L.75.125l.133.056a1 1 0 0 0 .308.074l.121.009v.549a.563.563 0 1 1-1.125 0m.751-.25L.75.751m0 0L.562.939M.75.751.563.563m.188.188.188.188"
            stroke="currentColor"
            stroke-width=".125"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </el-icon>
    </div>
    <h1>Authentication Error</h1>
    <p>Access Denied.</p>
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
