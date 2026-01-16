<script setup lang="ts"></script>

<template>
  <div class="loading-container">
    <div class="logo">
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="46" viewBox="0 0 120 45.6">
        <defs />
        <path
          d="M115 15.2a17.9 17.9 0 0 0-25-.3 5.7 5.7 0 0 0-5.5-3.4V20L77 26.9A17.8 17.8 0 0 0 46.7 15v-7S47.2 0 40.2 0v21.6s6.1 2.8 11-1.8a11.4 11.4 0 0 1 16.2 16l-.1.1a11.4 11.4 0 0 1-15.7.4l-.4-.4-10.4-10.3-10.3-10.3a17.9 17.9 0 0 0-24-1.1V8S7 0 0 0v27.9a17.8 17.8 0 0 0 30.5 12.6l6.3-6.3s-6-2.9-11 1.7-11.6 4.5-16 0a11.3 11.3 0 0 1-3.4-8A11.3 11.3 0 0 1 9.6 20l.4-.4a11.4 11.4 0 0 1 15.9.2l10.3 10.3 10.4 10.3a18 18 0 0 0 25.2 0l12.7-11.6v16.9c7 0 6.5-8.2 6.5-8.2V22.8l3.2-3h.1a11.4 11.4 0 0 1 19.5 8v10.5c0 2.1.8 7.4 6.5 7.4v-18a17.6 17.6 0 0 0-5.3-12.5z"
          fill="#D42F27"
        />
        <path
          d="M85.2 6.2l2.6 2.6 2.6-2.6a3.7 3.7 0 0 0 0-5.2 3.7 3.7 0 1 0-5.2 5.2z"
          fill="#D42F27"
        />
      </svg>
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
