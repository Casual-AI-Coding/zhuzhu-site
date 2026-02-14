<template>
  <div class="falling-hearts">
    <div
      v-for="heart in hearts"
      :key="heart.id"
      class="falling-heart"
      :style="heart.style"
    >
      {{ heart.emoji }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const emojis = ['💕', '💗', '💖', '💘', '💞', '💟', '❤️'];
const hearts = ref([]);
let heartId = 0;
let intervalId = null;

function createHeart() {
  const screenWidth = window.innerWidth;
  const count = Math.floor(screenWidth / 50); // 约15-20个
  
  // 每隔一段时间添加一个新爱心
  if (hearts.value.length < count) {
    const id = ++heartId;
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const left = Math.random() * 100; // 0-100%
    const delay = Math.random() * 2;
    const duration = 8 + Math.random() * 6; // 8-14秒
    const size = 12 + Math.random() * 8; // 12-20px
    
    hearts.value.push({
      id,
      emoji,
      style: {
        left: `${left}%`,
        top: '-30px',
        fontSize: `${size}px`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      },
    });
    
    // 移除超出屏幕的爱心
    setTimeout(() => {
      hearts.value = hearts.value.filter(h => h.id !== id);
    }, (duration + delay) * 1000);
  }
}

onMounted(() => {
  // 初始化一些爱心
  for (let i = 0; i < 10; i++) {
    setTimeout(createHeart, i * 200);
  }
  
  // 持续添加爱心
  intervalId = setInterval(createHeart, 1500);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
.falling-hearts {
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
  top: -30px;
  opacity: 0.6;
  animation: fall linear infinite;
  text-shadow: 0 0 5px rgba(255, 105, 180, 0.3);
}

@keyframes fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}
</style>
