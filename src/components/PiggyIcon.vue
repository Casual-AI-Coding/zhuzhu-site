<template>
  <button
    class="piggy-icon-btn relative cursor-pointer"
    :class="[{ 'is-scrolled': isScrolled }]"
    @click="handleClick"
    @touchstart="handleTouch"
    aria-label="回到首页"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      class="piggy-icon w-6 h-6 transition-all duration-300"
      :class="[
        { 'w-5 h-5': isScrolled },
        animationClass
      ]"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <!-- 猪猪脸部轮廓 - 简洁的圆形 -->
      <circle cx="12" cy="12" r="9" />
      
      <!-- 猪猪耳朵 - 简单的三角形 -->
      <path d="M5 6 L4 3 L7 5" />
      <path d="M19 6 L20 3 L17 5" />
      
      <!-- 猪猪鼻子 - 横着的椭圆 -->
      <ellipse cx="12" cy="13" rx="3" ry="2" />
      <circle cx="10.5" cy="13" r="0.8" />
      <circle cx="13.5" cy="13" r="0.8" />
      
      <!-- 猪猪眼睛 - 小圆点 -->
      <circle cx="8" cy="10" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="10" r="1.2" fill="currentColor" stroke="none" />
    </svg>
    
    <!-- 点击时的爱心特效 -->
    <span
      v-if="showHeart"
      class="click-heart"
      :style="{ '--x': heartX + 'px', '--y': heartY + 'px' }"
    >💕</span>
  </button>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  isScrolled: {
    type: Boolean,
    default: false
  }
});

const isAnimating = ref(false);
const showHeart = ref(false);
const heartX = ref(0);
const heartY = ref(0);

const animationClass = computed(() => {
  if (isAnimating.value) {
    return 'animate-piggy-bounce';
  }
  return 'group-hover:scale-110';
});

function handleClick(event) {
  triggerAnimation(event.clientX, event.clientY);
}

function handleTouch(event) {
  if (event.touches.length > 0) {
    triggerAnimation(event.touches[0].clientX, event.touches[0].clientY);
  }
}

function triggerAnimation(x, y) {
  if (isAnimating.value) return;
  
  isAnimating.value = true;
  showHeart.value = true;
  heartX.value = x;
  heartY.value = y;
  
  setTimeout(() => {
    isAnimating.value = false;
  }, 600);
  
  setTimeout(() => {
    showHeart.value = false;
  }, 1000);
}
</script>

<style scoped>
.piggy-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 4px;
  border-radius: 50%;
  -webkit-tap-highlight-color: transparent;
}

.piggy-icon {
  color: var(--color-primary);
  transform-origin: center center;
}

.piggy-icon-btn:hover .piggy-icon {
  transform: scale(1.1);
}

@keyframes piggyBounce {
  0% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.15) rotate(-5deg);
  }
  50% {
    transform: scale(1.1) rotate(5deg);
  }
  75% {
    transform: scale(1.12) rotate(-3deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

.animate-piggy-bounce {
  animation: piggyBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.click-heart {
  position: fixed;
  left: var(--x);
  top: var(--y);
  font-size: 24px;
  pointer-events: none;
  z-index: 1000;
  animation: heartFloat 1s ease-out forwards;
  transform: translate(-50%, -50%);
}

@keyframes heartFloat {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0.5);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -100%) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -150%) scale(1);
  }
}
</style>
