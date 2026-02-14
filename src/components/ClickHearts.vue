<template>
  <div class="click-hearts-container" @click="handleClick">
    <div
      v-for="heart in hearts"
      :key="heart.id"
      class="click-heart"
      :style="heart.style"
    >
      {{ heart.emoji }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const hearts = ref([]);
let heartId = 0;

const emojis = ['❤️', '💕', '💗', '💖', '💘', '💞', '💟'];

function handleClick(event) {
  const x = event.clientX;
  const y = event.clientY;
  const count = 8 + Math.floor(Math.random() * 5); // 8-12个

  for (let i = 0; i < count; i++) {
    const id = ++heartId;
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    // 随机角度和距离
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const distance = 50 + Math.random() * 80;
    const endX = x + Math.cos(angle) * distance;
    const endY = y + Math.sin(angle) * distance - 50; // 向上飘
    
    const heart = {
      id,
      emoji,
      style: {
        left: `${x}px`,
        top: `${y}px`,
        '--end-x': `${endX}px`,
        '--end-y': `${endY}px`,
      },
    };
    
    hearts.value.push(heart);
    
    // 1.5秒后移除
    setTimeout(() => {
      hearts.value = hearts.value.filter(h => h.id !== id);
    }, 1500);
  }
}
</script>

<style scoped>
.click-hearts-container {
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
  font-size: 20px;
  pointer-events: none;
  animation: heart-burst 1.5s ease-out forwards;
}

@keyframes heart-burst {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translate(calc(var(--end-x) - 50%), calc(var(--end-y) - 50%)) scale(0.5) rotate(30deg);
  }
}
</style>
