<template>
  <div class="skeleton-card animate-pulse">
    <div class="skeleton-image bg-gray-200 dark:bg-gray-700 rounded-2xl" :class="aspectClass"></div>
    <div class="skeleton-content p-4 space-y-2">
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  aspectClass: { type: String, default: 'aspect-[4/3]' },
});
</script>

<style scoped>
.skeleton-card {
  background: var(--color-card);
  border-radius: 1rem;
  overflow: hidden;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
