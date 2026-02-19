<template>
  <div class="progress-ring relative inline-flex items-center justify-center">
    <svg class="transform -rotate-90" :width="size" :height="size">
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="trackColor"
        :stroke-width="strokeWidth"
      />
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="progressColor"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        stroke-linecap="round"
        class="transition-all duration-500"
      />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span class="text-2xl font-display text-primary">{{ percentage }}%</span>
      <span class="text-xs text-text-secondary">进度</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  percentage: { type: Number, default: 0 },
  size: { type: Number, default: 100 },
  strokeWidth: { type: Number, default: 8 },
  trackColor: { type: String, default: 'var(--color-border)' },
  progressColor: { type: String, default: 'var(--color-primary)' },
});

const center = computed(() => props.size / 2);
const radius = computed(() => (props.size - props.strokeWidth) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const offset = computed(() => circumference.value - (props.percentage / 100) * circumference.value);
</script>
