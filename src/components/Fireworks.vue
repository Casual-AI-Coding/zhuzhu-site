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

// 更丰富的配色
const colors = [
  '#ff1461', '#ff0f4f', '#ff6b6b', '#ffd93d', '#6bcb77', 
  '#4d96ff', '#9b59b6', '#ff6bd3', '#ff8c42', '#00d2ff',
  '#ff9ff3', '#feca57', '#ff6b6b', '#48dbfb', '#1dd1a1',
  '#ff9ff3', '#54a0ff', '#5f27cd', '#ff9f43', '#ee5a24'
];

class Firework {
  constructor(x, targetY) {
    this.x = x;
    this.y = canvas.value?.height || 0;
    this.targetY = targetY;
    this.speed = 10 + Math.random() * 6;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.exploded = false;
    this.trail = [];
  }

  update() {
    // 保存轨迹
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 8) this.trail.shift();
    
    this.y -= this.speed;
    if (this.y <= this.targetY && !this.exploded) {
      this.exploded = true;
      return true;
    }
    return false;
  }

  draw() {
    if (!ctx || this.exploded) return;
    
    // 绘制轨迹
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      const alpha = (i / this.trail.length) * 0.8;
      const size = (i / this.trail.length) * 3;
      ctx.beginPath();
      ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
      ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
    }
    
    // 绘制头部
    ctx.beginPath();
    ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    
    // 光晕
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 20);
    gradient.addColorStop(0, this.color + '80');
    gradient.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

class Particle {
  constructor(x, y, color, type = 'normal') {
    this.x = x;
    this.y = y;
    this.color = color;
    this.type = type;
    
    if (type === 'ring') {
      // 环形爆炸
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 3;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
    } else if (type === 'sparkle') {
      // 闪烁粒子
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 5;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
    } else {
      // 普通粒子
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
    }
    
    this.alpha = 1;
    this.decay = 0.012 + Math.random() * 0.015;
    this.gravity = 0.04 + Math.random() * 0.03;
    this.friction = 0.96 + Math.random() * 0.02;
    this.size = 2 + Math.random() * 2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.alpha -= this.decay;
    
    // 闪烁效果
    if (this.type === 'sparkle') {
      this.size = 2 + Math.random() * 3;
    }
    
    return this.alpha <= 0;
  }

  draw() {
    if (!ctx) return;
    
    ctx.globalAlpha = this.alpha;
    
    if (this.type === 'sparkle') {
      // 闪烁粒子 - 十字光芒
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(this.x - this.size * 2, this.y);
      ctx.lineTo(this.x + this.size * 2, this.y);
      ctx.moveTo(this.x, this.y - this.size * 2);
      ctx.lineTo(this.x, this.y + this.size * 2);
      ctx.stroke();
    } else {
      // 普通粒子 - 圆形带光晕
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
      gradient.addColorStop(0, '#fff');
      gradient.addColorStop(0.3, this.color);
      gradient.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
  }
}

function launchFirework() {
  if (!canvas.value) return;
  const x = 150 + Math.random() * (canvas.value.width - 300);
  const targetY = 100 + Math.random() * (canvas.value.height * 0.35);
  fireworks.push(new Firework(x, targetY));
}

function createExplosion(x, y, color) {
  // 普通粒子 - 60%
  const normalCount = 40 + Math.floor(Math.random() * 20);
  for (let i = 0; i < normalCount; i++) {
    particles.push(new Particle(x, y, color, 'normal'));
  }
  
  // 环形粒子 - 20%
  const ringCount = 15 + Math.floor(Math.random() * 10);
  for (let i = 0; i < ringCount; i++) {
    particles.push(new Particle(x, y, color, 'ring'));
  }
  
  // 闪烁粒子 - 20%
  const sparkleCount = 20 + Math.floor(Math.random() * 15);
  for (let i = 0; i < sparkleCount; i++) {
    particles.push(new Particle(x, y, '#ffffff', 'sparkle'));
  }
}

function animate() {
  if (!ctx || !canvas.value) return;
  
  // 使用极低透明度创建拖尾效果
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
  
  // 更新烟花
  for (let i = fireworks.length - 1; i >= 0; i--) {
    const firework = fireworks[i];
    firework.draw();
    if (firework.update()) {
      createExplosion(firework.x, firework.y, firework.color);
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
    // 初始黑色背景
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
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
  width: 52px;
  height: 52px;
  font-size: 26px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s ease;
  z-index: 9999;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.3);
}

.firework-trigger:hover {
  transform: scale(1.15) rotate(15deg);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.2));
  box-shadow: 0 6px 30px rgba(255, 107, 107, 0.5);
}

.firework-trigger:active {
  transform: scale(0.95);
}
</style>
