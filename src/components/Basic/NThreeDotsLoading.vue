<script setup lang="ts"></script>

<template>
  <div class="loading-dots">
    <span class="dot bounce1"></span>
    <span class="dot bounce2"></span>
    <span class="dot bounce3"></span>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/theme";

.loading-dots {
  text-align: center;
}

.dot {
  display: inline-block;
  width: 15px;
  height: 15px;
  background-color: theme.$border-color-base;
  border-radius: 50%;
  animation: bounce-delay 1.4s infinite ease-in-out both;
  margin: 0 4px;
}

.loading-dots .bounce1 {
  animation-delay: -0.32s;
}

.loading-dots .bounce2 {
  animation-delay: -0.16s;
}

@keyframes bounce-delay {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
</style>
