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
      viewBox="0 0 32 32"
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
      <!-- 猪猪头部轮廓 -->
      <ellipse
        cx="16"
        cy="18"
        rx="11"
        ry="9"
        class="piggy-body"
      />
      <!-- 猪猪耳朵 -->
      <path d="M7 10 L5 5 L10 8" class="piggy-ear left-ear" />
      <path d="M25 10 L27 5 L22 8" class="piggy-ear right-ear" />
      <!-- 猪猪鼻子 -->
      <ellipse cx="16" cy="19" rx="4" ry="3" class="piggy-nose" />
      <circle cx="14" cy="19" r="1" fill="currentColor" />
      <circle cx="18" cy="19" r="1" fill="currentColor" />
      <!-- 猪猪眼睛 -->
      <circle cx="11" cy="14" r="1.5" fill="currentColor" class="piggy-eye" />
      <circle cx="21" cy="14" r="1.5" fill="currentColor" class="piggy-eye" />
      <!-- 猪猪嘴巴 -->
      <path d="M14 23 Q16 25 18 23" class="piggy-mouth" />
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
  // 防止重复触发
  if (isAnimating.value) return;
  
  isAnimating.value = true;
  showHeart.value = true;
  heartX.value = x;
  heartY.value = y;
  
  // 动画结束后重置
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

/* 猪猪弹跳动画 */
@keyframes piggyBounce {
  0% {
    transform: scale(1) rotate(0deg);
  }
  20% {
    transform: scale(1.2) rotate(-5deg);
  }
  40% {
    transform: scale(1.1) rotate(5deg);
  }
  60% {
    transform: scale(1.15) rotate(-3deg);
  }
  80% {
    transform: scale(1.05) rotate(2deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

.animate-piggy-bounce {
  animation: piggyBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 耳朵动画 */
.piggy-ear {
  transition: transform 0.3s ease;
}

.piggy-icon-btn:hover .left-ear {
  transform: rotate(-10deg);
}

.piggy-icon-btn:hover .right-ear {
  transform: rotate(10deg);
}

.animate-piggy-bounce .left-ear {
  animation: earWiggle 0.6s ease;
}

.animate-piggy-bounce .right-ear {
  animation: earWiggle 0.6s ease;
}

@keyframes earWiggle {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-15deg);
  }
  75% {
    transform: rotate(15deg);
  }
}

/* 眼睛动画 */
.piggy-eye {
  transition: transform 0.2s ease;
}

.piggy-icon-btn:hover .piggy-eye {
  transform: scale(1.2);
}

/* 点击时的爱心特效 */
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
