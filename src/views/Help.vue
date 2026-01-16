<template>
  <div class="help-container">
    <h1>Help Page</h1>
    <p>This is the help page for the image editor.</p>
    <button @click="$emit('close')">Close</button>
  </div>
</template>

<script setup lang="ts">
defineEmits(['close']);
</script>

<style scoped>
.help-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  z-index: 1001;
}
</style>
