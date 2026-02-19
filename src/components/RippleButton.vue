<template>
  <button
    ref="buttonRef"
    class="ripple-button relative overflow-hidden"
    @click="handleClick"
  >
    <slot />
    <span
      v-for="ripple in ripples"
      :key="ripple.id"
      class="ripple"
      :style="{
        left: ripple.x + 'px',
        top: ripple.y + 'px',
        width: ripple.size + 'px',
        height: ripple.size + 'px',
      }"
    ></span>
  </button>
</template>

<script setup>
import { ref } from 'vue';
import { useRipple } from '@/composables/useRipple.js';

const buttonRef = ref(null);
const { ripples, createRipple } = useRipple();

const emit = defineEmits(['click']);

function handleClick(event) {
  createRipple(event, buttonRef.value);
  emit('click', event);
}
</script>

<style scoped>
.ripple-button {
  position: relative;
  overflow: hidden;
}

.ripple {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(0);
  animation: ripple-animation 600ms linear;
  pointer-events: none;
}

@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
</style>
