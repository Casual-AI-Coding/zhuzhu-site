<template>
  <div class="flip-clock flex items-center justify-center gap-3 sm:gap-4">
    <div v-for="unit in displayUnits" :key="unit.label" class="flip-unit">
      <!-- Circular Progress Container -->
      <div class="circular-container" :class="{ 'is-seconds': unit.label === '秒' }">
        <!-- SVG Ring -->
        <svg class="progress-ring" viewBox="0 0 60 60">
          <defs>
            <linearGradient id="secondsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#D4A574;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#E8B896;stop-opacity:1" />
            </linearGradient>
          </defs>
          <!-- Background Circle -->
          <circle 
            class="ring-bg" 
            cx="30" cy="30" :r="ringRadius"
          />
          <!-- Progress Circle -->
          <circle 
            class="ring-progress" 
            cx="30" cy="30" 
            :r="ringRadius"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="getProgressOffset(unit)"
            :class="{ 'seconds-ring': unit.label === '秒' }"
          />
        </svg>
        
        <!-- Number Display with Smooth Transition -->
        <div class="number-container">
          <span class="number" :class="{ 'seconds-number': unit.label === '秒' }">{{ unit.displayValue }}</span>
        </div>
      </div>
      
      <!-- Unit Label -->
      <span class="unit-label" :class="{ 'seconds-label': unit.label === '秒' }">{{ unit.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  days: { type: Number, required: true },
  hours: { type: Number, required: true },
  minutes: { type: Number, required: true },
  seconds: { type: Number, required: true },
});

// Ring configuration
const ringRadius = 26;
const circumference = 2 * Math.PI * ringRadius;

// Format number with leading zero
const formatNumber = (num) => String(num).padStart(2, '0');

// Unit definitions with Chinese labels
const unitLabels = ['天', '时', '分', '秒'];

// Track previous values for smooth transition
const previousValues = ref({
  days: props.days,
  hours: props.hours,
  minutes: props.minutes,
  seconds: props.seconds,
});

// Calculate progress offset for the ring
const getProgressOffset = (unit) => {
  const label = unit.label;
  let progress = 0;
  
  switch(label) {
    case '天':
      progress = 1;
      break;
    case '时':
      progress = props.hours / 24;
      break;
    case '分':
      progress = props.minutes / 60;
      break;
    case '秒':
      progress = props.seconds / 60;
      break;
  }
  
  return circumference - (progress * circumference);
};

// Display units with smooth transition
const displayUnits = computed(() => {
  return [
    { 
      label: unitLabels[0], 
      displayValue: formatNumber(props.days)
    },
    { 
      label: unitLabels[1], 
      displayValue: formatNumber(props.hours)
    },
    { 
      label: unitLabels[2], 
      displayValue: formatNumber(props.minutes)
    },
    { 
      label: unitLabels[3], 
      displayValue: formatNumber(props.seconds)
    },
  ];
});

// Update previous values
watch(() => props.days, (newVal) => {
  previousValues.value.days = newVal;
});

watch(() => props.hours, (newVal) => {
  previousValues.value.hours = newVal;
});

watch(() => props.minutes, (newVal) => {
  previousValues.value.minutes = newVal;
});

watch(() => props.seconds, (newVal) => {
  previousValues.value.seconds = newVal;
});
</script>

<style scoped>
.flip-clock {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flip-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
}

/* Circular Container - Smaller size */
.circular-container {
  position: relative;
  width: 3rem;
  height: 3rem;
}

@media (min-width: 640px) {
  .circular-container {
    width: 3.5rem;
    height: 3.5rem;
  }
}

@media (min-width: 1024px) {
  .circular-container {
    width: 4rem;
    height: 4rem;
  }
}

/* Seconds ring is slightly larger */
.circular-container.is-seconds {
  width: 3.25rem;
  height: 3.25rem;
}

@media (min-width: 640px) {
  .circular-container.is-seconds {
    width: 3.75rem;
    height: 3.75rem;
  }
}

@media (min-width: 1024px) {
  .circular-container.is-seconds {
    width: 4.25rem;
    height: 4.25rem;
  }
}

/* SVG Ring */
.progress-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: rgba(212, 165, 116, 0.12);
  stroke-width: 2.5;
}

.dark .ring-bg {
  stroke: rgba(232, 201, 168, 0.08);
}

.ring-progress {
  fill: none;
  stroke: #D4A574;
  stroke-width: 2.5;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease-out;
}

.dark .ring-progress {
  stroke: #E8C9A8;
}

/* Seconds ring with gradient effect */
.seconds-ring {
  stroke: url(#secondsGradient);
  filter: drop-shadow(0 0 3px rgba(212, 165, 116, 0.3));
}

/* Number Container */
.number-container {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Number Styling - Outfit font for modern look */
.number {
  font-family: 'Outfit', 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: #8B7355;
  line-height: 1;
  letter-spacing: -0.02em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (min-width: 640px) {
  .number {
    font-size: 1.25rem;
  }
}

@media (min-width: 1024px) {
  .number {
    font-size: 1.5rem;
  }
}

.dark .number {
  color: #E8C9A8;
}

/* Seconds number is more prominent */
.seconds-number {
  font-size: 1.125rem;
  font-weight: 600;
  color: #D4A574;
}

@media (min-width: 640px) {
  .seconds-number {
    font-size: 1.375rem;
  }
}

@media (min-width: 1024px) {
  .seconds-number {
    font-size: 1.625rem;
  }
}

.dark .seconds-number {
  color: #E8C9A8;
}

/* Unit Label */
.unit-label {
  font-family: 'Outfit', 'Inter', sans-serif;
  font-size: 0.5rem;
  font-weight: 400;
  color: #8B7355;
  letter-spacing: 0.02em;
  opacity: 0.6;
}

@media (min-width: 640px) {
  .unit-label {
    font-size: 0.625rem;
  }
}

.dark .unit-label {
  color: #E8C9A8;
  opacity: 0.5;
}

/* Seconds label is highlighted */
.seconds-label {
  color: #D4A574;
  opacity: 0.9;
  font-weight: 600;
}

.dark .seconds-label {
  color: #E8C9A8;
}

/* Hover effect */
.circular-container:hover .ring-progress {
  stroke-width: 3;
  filter: drop-shadow(0 0 4px rgba(212, 165, 116, 0.25));
  transition: all 0.3s ease;
}

.circular-container:hover .number {
  transform: scale(1.05);
}
</style>
