<script setup lang="ts"></script>

<template>
  <div class="loading-container">
    <div class="logo">
      <img src="/src/assets/icons/bbin.svg" alt="logo" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.loading-container {
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
}
.logo {
  width: 120px;
  height: 46px;
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
}
</style>
