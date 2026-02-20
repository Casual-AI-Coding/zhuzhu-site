<template>
  <div class="falling-effects">
    <!-- 爱心 -->
    <div
      v-for="heart in hearts"
      :key="'h' + heart.id"
      class="falling-heart"
      :style="heart.style"
    >
      {{ heart.emoji }}
    </div>
    <!-- 星星 -->
    <div
      v-for="star in stars"
      :key="'s' + star.id"
      class="falling-star"
      :style="star.style"
    >
      {{ star.emoji }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const emojis = ['💕', '💗', '💖', '💘', '💞', '💟', '❤️', '🧡', '💜', '🩷', '🩵', '💚'];
const starEmojis = ['✨', '⭐', '🌟', '💫'];

const hearts = ref([]);
const stars = ref([]);
let heartId = 0;
let starId = 0;
let heartInterval = null;
let starInterval = null;

function createHeart() {
  const screenWidth = window.innerWidth;
  const count = Math.floor(screenWidth / 60);
  
  if (hearts.value.length < count) {
    const id = ++heartId;
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 3;
    const duration = 10 + Math.random() * 8;
    const size = 14 + Math.random() * 12;
    const rotation = Math.random() * 360;
    
    hearts.value.push({
      id,
      emoji,
      style: {
        left: `${left}%`,
        top: '-40px',
        fontSize: `${size}px`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        '--rotation': `${rotation}deg`,
      },
    });
    
    setTimeout(() => {
      hearts.value = hearts.value.filter(h => h.id !== id);
    }, (duration + delay) * 1000);
  }
}

function createStar() {
  const screenWidth = window.innerWidth;
  const count = Math.floor(screenWidth / 100);
  
  if (stars.value.length < count) {
    const id = ++starId;
    const emoji = starEmojis[Math.floor(Math.random() * starEmojis.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 4;
    const duration = 12 + Math.random() * 6;
    const size = 8 + Math.random() * 8;
    
    stars.value.push({
      id,
      emoji,
      style: {
        left: `${left}%`,
        top: '-20px',
        fontSize: `${size}px`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      },
    });
    
    setTimeout(() => {
      stars.value = stars.value.filter(s => s.id !== id);
    }, (duration + delay) * 1000);
  }
}

onMounted(() => {
  // 初始一些爱心
  for (let i = 0; i < 5; i++) {
    setTimeout(createHeart, i * 400);
  }
  
  // 初始一些星星
  for (let i = 0; i < 3; i++) {
    setTimeout(createStar, i * 600);
  }
  
  // 持续添加 - reduced frequency
  heartInterval = setInterval(createHeart, 3000);
  starInterval = setInterval(createStar, 5000);
});

onUnmounted(() => {
  if (heartInterval) clearInterval(heartInterval);
  if (starInterval) clearInterval(starInterval);
});
</script>

<style scoped>
.falling-effects {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9996;
  overflow: hidden;
}

.falling-heart {
  position: absolute;
  top: -40px;
  opacity: 0.7;
  animation: fall-rotate linear infinite;
}

.falling-star {
  position: absolute;
  top: -20px;
  opacity: 0.6;
  animation: star-fall linear infinite;
}

@keyframes fall-rotate {
  0% {
    transform: translateY(0) rotate(var(--rotation, 0deg)) scale(0.8);
    opacity: 0;
  }
  5% {
    opacity: 0.7;
    transform: translateY(20px) rotate(calc(var(--rotation, 0deg) + 20deg)) scale(1);
  }
  20% {
    transform: translateY(100px) rotate(calc(var(--rotation, 0deg) - 30deg)) scale(1.1);
  }
  50% {
    opacity: 0.8;
    transform: translateY(50vh) rotate(calc(var(--rotation, 0deg) + 45deg)) scale(1);
  }
  80% {
    opacity: 0.5;
  }
  100% {
    transform: translateY(100vh) rotate(calc(var(--rotation, 0deg) + 90deg)) scale(0.6);
    opacity: 0;
  }
}

@keyframes star-fall {
  0% {
    transform: translateY(0) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
    transform: translateY(30px) scale(1.2);
  }
  30% {
    transform: translateY(80px) scale(1);
  }
  50% {
    opacity: 0.9;
    transform: translateY(120px) scale(1.1);
  }
  80% {
    opacity: 0.4;
  }
  100% {
    transform: translateY(100vh) scale(0.5);
    opacity: 0;
  }
}
</style>
