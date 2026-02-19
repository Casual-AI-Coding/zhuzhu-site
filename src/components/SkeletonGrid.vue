<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <SkeletonCard
      v-for="i in count"
      :key="i"
      :aspect-class="aspectClass"
    />
  </div>
</template>

<script setup>
import SkeletonCard from './SkeletonCard.vue';

defineProps({
  count: { type: Number, default: 6 },
  aspectClass: { type: String, default: 'aspect-[4/3]' },
});
</script>
