<template>
  <div class="floating-decorations">
    <!-- Floating Hearts -->
    <div 
      v-for="heart in hearts" 
      :key="heart.id"
      class="floating-heart"
      :style="heart.style"
    >
      {{ heart.emoji }}
    </div>
    
    <!-- Twinkling Stars -->
    <div 
      v-for="star in stars" 
      :key="star.id"
      class="twinkling-star"
      :style="star.style"
    >
      ✨
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const hearts = ref([]);
const stars = ref([]);

const heartEmojis = ['❤️', '💕', '💗', '💖', '💝', '💘', '💓', '💞', '🩷', '🩵'];

onMounted(() => {
  // Generate random positioned hearts
  for (let i = 0; i < 12; i++) {
    hearts.value.push({
      id: `heart-${i}`,
      emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        fontSize: `${14 + Math.random() * 18}px`,
        animationDuration: `${4 + Math.random() * 4}s`,
        animationDelay: `${Math.random() * 3}s`,
        opacity: 0.3 + Math.random() * 0.3,
      }
    });
  }
  
  // Generate random positioned stars
  for (let i = 0; i < 20; i++) {
    stars.value.push({
      id: `star-${i}`,
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        fontSize: `${8 + Math.random() * 10}px`,
        animationDuration: `${2 + Math.random() * 2}s`,
        animationDelay: `${Math.random() * 3}s`,
      }
    });
  }
});
</script>

<style scoped>
.floating-decorations {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

/* Floating Heart Animation */
.floating-heart {
  position: absolute;
  animation: floatHeart var(--duration, 5s) ease-in-out infinite;
  animation-delay: var(--delay, 0s);
  opacity: var(--opacity, 0.4);
}

@keyframes floatHeart {
  0%, 100% {
    transform: translateY(0) rotate(-5deg);
  }
  25% {
    transform: translateY(-15px) rotate(5deg);
  }
  50% {
    transform: translateY(-5px) rotate(-3deg);
  }
  75% {
    transform: translateY(-20px) rotate(3deg);
  }
}

/* Twinkling Star Animation */
.twinkling-star {
  position: absolute;
  animation: twinkle var(--duration, 2s) ease-in-out infinite;
  animation-delay: var(--delay, 0s);
  opacity: 0.3;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.2;
    transform: scale(0.8);
    filter: blur(0px);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.2);
    filter: blur(1px);
  }
}

/* Responsive: reduce animations on mobile for performance */
@media (max-width: 640px) {
  .floating-heart,
  .twinkling-star {
    animation: none;
    opacity: 0.3;
  }
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .floating-heart,
  .twinkling-star {
    animation: none;
  }
}
</style>
