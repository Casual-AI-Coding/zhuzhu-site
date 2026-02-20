<template>
  <div class="share-poster">
    <!-- 预览画布 -->
    <div ref="posterRef" class="poster-canvas">
      <!-- 背景 -->
      <div class="poster-bg">
        <!-- 装饰元素 -->
        <div class="poster-decorations">
          <span class="deco-heart deco-1">💕</span>
          <span class="deco-heart deco-2">💗</span>
          <span class="deco-heart deco-3">💖</span>
          <span class="deco-star deco-4">✨</span>
          <span class="deco-star deco-5">⭐</span>
        </div>
        
        <!-- 内容 -->
        <div class="poster-content">
          <h1 class="poster-title">✨ zhuzhu ✨</h1>
          
          <div class="poster-main">
            <p class="poster-subtitle">我们在一起</p>
            <p class="poster-days">{{ totalDays }}</p>
            <p class="poster-days-label">天</p>
          </div>
          
          <p class="poster-date">从 {{ startDate }} 开始</p>
          
          <p class="poster-signature">💕 大萝卜 ❤️ 猪猪</p>
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="poster-actions mt-4">
      <button 
        @click="downloadPoster" 
        class="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/25 flex items-center gap-2 mx-auto"
      >
        📥 保存海报
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useDaysCount } from '@/composables/useDaysCount';

const { totalDays, formattedStartDate } = useDaysCount();
const posterRef = ref(null);

const startDate = computed(() => formattedStartDate.value);

async function downloadPoster() {
  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size (high resolution)
  const width = 600;
  const height = 900;
  canvas.width = width;
  canvas.height = height;
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#FFF5F0');
  gradient.addColorStop(1, '#FFE4D6');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Draw decorations
  ctx.font = '32px serif';
  ctx.textAlign = 'center';
  
  // Hearts
  const hearts = ['💕', '💗', '💖', '💘'];
  const heartPositions = [
    { x: 50, y: 80 },
    { x: 550, y: 150 },
    { x: 40, y: 400 },
    { x: 560, y: 350 },
  ];
  heartPositions.forEach((pos, i) => {
    ctx.fillText(hearts[i % hearts.length], pos.x, pos.y);
  });
  
  // Stars
  const stars = ['✨', '⭐', '💫'];
  const starPositions = [
    { x: 520, y: 80 },
    { x: 80, y: 200 },
    { x: 530, y: 280 },
  ];
  starPositions.forEach((pos, i) => {
    ctx.fillText(stars[i % stars.length], pos.x, pos.y);
  });
  
  // Title
  ctx.fillStyle = '#D4A574';
  ctx.font = 'bold 36px serif, Georgia';
  ctx.fillText('✨ zhuzhu ✨', width / 2, 100);
  
  // Subtitle
  ctx.fillStyle = '#666666';
  ctx.font = '24px serif, Georgia';
  ctx.fillText('我们在一起', width / 2, 200);
  
  // Days number
  ctx.fillStyle = '#D4A574';
  ctx.font = 'bold 120px serif, Georgia';
  ctx.fillText(String(totalDays.value), width / 2, 400);
  
  // Days label
  ctx.fillStyle = '#999999';
  ctx.font = '36px serif, Georgia';
  ctx.fillText('天', width / 2, 460);
  
  // Start date
  ctx.fillStyle = '#999999';
  ctx.font = '18px sans-serif';
  ctx.fillText(`从 ${startDate.value} 开始`, width / 2, 550);
  
  // Divider
  ctx.strokeStyle = '#D4A574';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(150, 600);
  ctx.lineTo(450, 600);
  ctx.stroke();
  
  // Signature
  ctx.fillStyle = '#D4A574';
  ctx.font = '24px serif, Georgia';
  ctx.fillText('💕 大萝卜 ❤️ 猪猪', width / 2, 680);
  
  // Footer
  ctx.fillStyle = '#CCCCCC';
  ctx.font = '14px sans-serif';
  ctx.fillText('zhuzhu.site', width / 2, 820);
  
  // Convert to image and download
  const link = document.createElement('a');
  link.download = `zhuzhu-${totalDays.value}days.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
</script>

<style scoped>
.poster-canvas {
  width: 280px;
  height: 420px;
  margin: 0 auto;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.poster-bg {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #FFF5F0 0%, #FFE4D6 100%);
  position: relative;
  padding: 24px;
}

.poster-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding-top: 20px;
}

.poster-title {
  font-family: serif;
  font-size: 24px;
  color: #D4A574;
  margin-bottom: 40px;
}

.poster-main {
  margin: 40px 0;
}

.poster-subtitle {
  font-size: 20px;
  color: #666;
  margin-bottom: 8px;
}

.poster-days {
  font-size: 100px;
  font-weight: bold;
  color: #D4A574;
  line-height: 1;
  font-family: serif;
}

.poster-days-label {
  font-size: 32px;
  color: #999;
}

.poster-date {
  font-size: 16px;
  color: #999;
}

.poster-signature {
  margin-top: 60px;
  font-size: 20px;
  color: #D4A574;
}

/* Decorations */
.poster-decorations {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.deco-heart,
.deco-star {
  position: absolute;
  animation: float 3s ease-in-out infinite;
}

.deco-1 { top: 20px; left: 20px; animation-delay: 0s; }
.deco-2 { top: 40px; right: 30px; animation-delay: 0.5s; }
.deco-3 { top: 180px; left: 15px; animation-delay: 1s; }
.deco-4 { top: 60px; right: 15px; animation-delay: 1.5s; }
.deco-5 { top: 200px; right: 20px; animation-delay: 2s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>
