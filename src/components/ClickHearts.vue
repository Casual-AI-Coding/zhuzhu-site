<template>
  <div class="click-effects-container" @click="handleClick">
    <!-- 爱心 -->
    <div
      v-for="heart in hearts"
      :key="heart.id"
      class="click-heart"
      :style="heart.style"
    >
      {{ heart.emoji }}
    </div>
    <!-- 星星粒子 -->
    <div
      v-for="star in stars"
      :key="star.id"
      class="click-star"
      :style="star.style"
    >
      ✨
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const hearts = ref([]);
const stars = ref([]);
let heartId = 0;
let starId = 0;

const heartEmojis = ['❤️', '💕', '💗', '💖', '💘', '💞', '💟', '🧡', '💜', '🩷'];

function handleClick(event) {
  const x = event.clientX;
  const y = event.clientY;
  
  // 爱心 - 8-15个
  const heartCount = 8 + Math.floor(Math.random() * 8);
  for (let i = 0; i < heartCount; i++) {
    const id = ++heartId;
    const emoji = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    
    const angle = (Math.PI * 2 * i) / heartCount + (Math.random() - 0.5) * 0.8;
    const distance = 60 + Math.random() * 100;
    const endX = x + Math.cos(angle) * distance;
    const endY = y + Math.sin(angle) * distance - 80;
    const size = 16 + Math.random() * 16;
    const duration = 1.2 + Math.random() * 0.8;
    
    hearts.value.push({
      id,
      emoji,
      style: {
        left: `${x}px`,
        top: `${y}px`,
        fontSize: `${size}px`,
        '--end-x': `${endX}px`,
        '--end-y': `${endY}px`,
        animationDuration: `${duration}s`,
      },
    });
    
    setTimeout(() => {
      hearts.value = hearts.value.filter(h => h.id !== id);
    }, duration * 1000);
  }
  
  // 星星 - 5-10个
  const starCount = 5 + Math.floor(Math.random() * 6);
  for (let i = 0; i < starCount; i++) {
    const id = ++starId;
    
    const angle = (Math.PI * 2 * i) / starCount + (Math.random() - 0.5);
    const distance = 40 + Math.random() * 60;
    const endX = x + Math.cos(angle) * distance;
    const endY = y + Math.sin(angle) * distance - 60;
    const size = 10 + Math.random() * 12;
    const duration = 0.8 + Math.random() * 0.6;
    
    stars.value.push({
      id,
      style: {
        left: `${x}px`,
        top: `${y}px`,
        fontSize: `${size}px`,
        '--end-x': `${endX}px`,
        '--end-y': `${endY}px`,
        animationDuration: `${duration}s`,
      },
    });
    
    setTimeout(() => {
      stars.value = stars.value.filter(s => s.id !== id);
    }, duration * 1000);
  }
}
</script>

<style scoped>
.click-effects-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9998;
  overflow: hidden;
}

.click-heart {
  position: absolute;
  pointer-events: none;
  animation: heart-burst var(--duration, 1.5s) ease-out forwards;
  filter: drop-shadow(0 0 8px rgba(255, 105, 180, 0.6));
}

.click-star {
  position: absolute;
  pointer-events: none;
  animation: star-burst var(--duration, 1s) ease-out forwards;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));
}

@keyframes heart-burst {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
  }
  15% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.4) rotate(-10deg);
  }
  30% {
    transform: translate(-50%, -50%) scale(1.2) rotate(10deg);
  }
  100% {
    opacity: 0;
    transform: translate(calc(var(--end-x) - 50%), calc(var(--end-y) - 50%)) scale(0.3) rotate(45deg);
  }
}

@keyframes star-burst {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.5) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: translate(calc(var(--end-x) - 50%), calc(var(--end-y) - 50%)) scale(0) rotate(360deg);
  }
}
</style>
