<template>
  <div class="text-center mb-8 sm:mb-12">
    <h1 class="font-display text-3xl sm:text-4xl lg:text-5xl text-text-main mb-3 sm:mb-4">
      {{ title }}
    </h1>
    <p v-if="subtitle" class="text-text-secondary text-sm sm:text-lg">
      {{ subtitle }}
    </p>
    <slot name="extra" />
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' }
});
</script>
