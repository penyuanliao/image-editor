<script setup lang="ts">
import NLoading from "@/views/NLoading.vue";
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Suspense>
      <template #default>
        <div>
          <component :is="Component" />
        </div>
      </template>
      <template #fallback>
        <NLoading />
      </template>
    </Suspense>
  </RouterView>
</template>

<style scoped></style>
