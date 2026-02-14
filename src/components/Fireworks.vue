<template>
  <div class="fireworks-container">
    <canvas ref="canvas"></canvas>
    <!-- 触发按钮 -->
    <button
      @click="launchFirework"
      class="firework-trigger"
      title="点击燃放烟花"
    >
      🎆
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const canvas = ref(null);
let ctx = null;
let animationId = null;
const fireworks = [];
const particles = [];

const colors = [
  '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', 
  '#ff6bd3', '#ff8c42', '#a66cff', '#ff6b6b'
];

class Firework {
  constructor(x, targetY) {
    this.x = x;
    this.y = canvas.value?.height || 0;
    this.targetY = targetY;
    this.speed = 8 + Math.random() * 4;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.exploded = false;
  }

  update() {
    this.y -= this.speed;
    if (this.y <= this.targetY && !this.exploded) {
      this.exploded = true;
      return true; // 需要爆炸
    }
    return false;
  }

  draw() {
    if (!ctx || this.exploded) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    
    // 拖尾
    ctx.beginPath();
    ctx.arc(this.x, this.y + 10, 2, 0, Math.PI * 2);
    ctx.fillStyle = this.color + '80';
    ctx.fill();
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.alpha = 1;
    this.decay = 0.015 + Math.random() * 0.01;
    this.gravity = 0.05;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.vx *= 0.98;
    this.alpha -= this.decay;
    return this.alpha <= 0;
  }

  draw() {
    if (!ctx) return;
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function launchFirework() {
  if (!canvas.value) return;
  const x = 100 + Math.random() * (canvas.value.width - 200);
  const targetY = 100 + Math.random() * (canvas.value.height * 0.4);
  fireworks.push(new Firework(x, targetY));
}

function animate() {
  if (!ctx || !canvas.value) return;
  
  // 清除画布 - 使用 clearRect 保持透明
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  
  // 更新烟花
  for (let i = fireworks.length - 1; i >= 0; i--) {
    const firework = fireworks[i];
    firework.draw();
    if (firework.update()) {
      // 爆炸生成粒子
      const particleCount = 50 + Math.floor(Math.random() * 30);
      for (let j = 0; j < particleCount; j++) {
        particles.push(new Particle(firework.x, firework.y, firework.color));
      }
      fireworks.splice(i, 1);
    }
  }
  
  // 更新粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    particle.draw();
    if (particle.update()) {
      particles.splice(i, 1);
    }
  }
  
  animationId = requestAnimationFrame(animate);
}

function handleResize() {
  if (canvas.value) {
    canvas.value.width = window.innerWidth;
    canvas.value.height = window.innerHeight;
  }
}

onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext('2d');
    canvas.value.width = window.innerWidth;
    canvas.value.height = window.innerHeight;
    window.addEventListener('resize', handleResize);
    animate();
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});
</script>

<style scoped>
.fireworks-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9997;
}

.fireworks-container canvas {
  width: 100%;
  height: 100%;
  background: transparent;
}

.firework-trigger {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 48px;
  height: 48px;
  font-size: 24px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s ease;
  z-index: 9999;
}

.firework-trigger:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.3);
}

.firework-trigger:active {
  transform: scale(0.95);
}
</style>
