<template>
  <div class="share-poster" :style="cssVars">
    <!-- 模板选择器 -->
    <div class="template-selector mb-4">
      <p class="text-sm text-text-secondary mb-2">选择海报风格</p>
      <div class="flex gap-2">
        <button
          v-for="tpl in templates"
          :key="tpl.id"
          @click="selectedTemplate = tpl.id"
          class="template-btn px-3 py-2 rounded-lg border-2 transition-all"
          :class="selectedTemplate === tpl.id ? 'border-primary' : 'border-transparent'"
          :style="{ background: `linear-gradient(135deg, ${tpl.gradient[0]}, ${tpl.gradient[1]})` }"
        >
          <span class="text-lg">{{ tpl.icon }}</span>
        </button>
      </div>
    </div>
    
    <!-- 预览画布 -->
    <div ref="posterRef" class="poster-canvas">
      <!-- 背景 -->
      <div class="poster-bg">
        <!-- 装饰元素 -->
        <div class="poster-decorations">
          <span class="deco deco-1" v-text="currentDecorations[0]"></span>
          <span class="deco deco-2" v-text="currentDecorations[1]"></span>
          <span class="deco deco-3" v-text="currentDecorations[2]"></span>
          <span class="deco deco-4" v-text="currentDecorations[3]"></span>
          <span class="deco deco-5">✨</span>
          <span class="deco deco-6">⭐</span>
        </div>
        
        <!-- 内容 -->
        <div class="poster-content">
          <!-- 里程碑标题 -->
          <div v-if="milestoneInfo" class="milestone-badge">
            {{ milestoneInfo.emoji }} {{ milestoneInfo.label }} {{ milestoneInfo.emoji }}
          </div>
          
          <h1 class="poster-title" :class="{ 'with-milestone': milestoneInfo }">✨ zhuzhu ✨</h1>
          
          <!-- 照片预览 -->
          <div v-if="photoUrl" class="poster-photo-preview" :style="photoStyle">
            <img :src="photoUrl" alt="情侣照片" />
          </div>
          
          <div class="poster-main">
            <p class="poster-subtitle">我们在一起</p>
            <p class="poster-days">{{ totalDays }}</p>
            <p class="poster-days-label">天</p>
          </div>
          
          <p class="poster-date">从 {{ startDate }} 开始</p>
          
          <p class="poster-signature">💕 大萝卜 ❤️ 小葡萄</p>
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
import { ref, computed, onMounted } from 'vue';
import { useDaysCount } from '@/composables/useDaysCount';

const props = defineProps({
  photoUrl: { type: String, default: '' },
});

// 模板配置
const templates = [
  { id: 'romantic', name: '浪漫', icon: '💕', gradient: ['#FFF5F0', '#FFE4D6'], accent: '#FF6B6B', decorations: ['💕', '💗', '💖', '💘'] },
  { id: 'simple', name: '简约', icon: '🌙', gradient: ['#FAFAFA', '#F5F5F5'], accent: '#666666', decorations: ['○', '─', '│', '○'] },
  { id: 'cute', name: '可爱', icon: '🎀', gradient: ['#FFF8E7', '#FFE4E1'], accent: '#FFB6C1', decorations: ['🎀', '🌸', '⭐', '🎀'] },
  { id: 'fresh', name: '清新', icon: '🌿', gradient: ['#F0F8FF', '#E8F4F8'], accent: '#87CEEB', decorations: ['🌿', '🌸', '🍃', '🌼'] },
];

const selectedTemplate = ref('romantic');

// 获取当前模板
const currentTemplate = computed(() => templates.find(t => t.id === selectedTemplate.value) || templates[0]);

// 获取当前装饰（模板或里程碑）
const currentDecorations = computed(() => {
  const t = currentTemplate.value;
  const m = milestoneInfo.value;
  if (m) {
    switch(m.theme) {
      case 'love': return ['💖', '💗', '💕', '❤️'];
      case 'forever': return ['💕', '💑', '💏', '❤️'];
      case 'anniversary': return ['🎂', '🕯️', '🎉', '🎁'];
      case 'lucky': return ['✨', '⭐', '💫', '🌟'];
    }
  }
  return t.decorations;
});

// CSS变量用于动态样式
const cssVars = computed(() => {
  const t = currentTemplate.value;
  const m = milestoneInfo.value;
  let accent = t.accent;
  if (m) {
    switch(m.theme) {
      case 'love': accent = '#FF6B9D'; break;
      case 'forever': accent = '#FF4757'; break;
      case 'anniversary': accent = '#FFB347'; break;
      case 'lucky': accent = '#FFD700'; break;
    }
  }
  return {
    '--poster-accent': accent,
    '--poster-gradient-start': m?.theme === 'lucky' ? '#FFFEF0' : t.gradient[0],
    '--poster-gradient-end': m?.theme === 'lucky' ? '#FFF8E7' : t.gradient[1],
    '--poster-deco-1': currentDecorations.value[0],
    '--poster-deco-2': currentDecorations.value[1],
    '--poster-deco-3': currentDecorations.value[2],
    '--poster-deco-4': currentDecorations.value[3],
  };
});

const { totalDays, formattedStartDate } = useDaysCount();
const posterRef = ref(null);

const startDate = computed(() => formattedStartDate.value);

// 照片预览样式 - 保持原图比例
const photoStyle = ref({});
const photoLoaded = ref(false);

onMounted(async () => {
  if (props.photoUrl) {
    try {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        const maxW = 160;
        const maxH = 70;
        
        let width = maxW;
        let height = width / ratio;
        
        if (height > maxH) {
          height = maxH;
          width = height * ratio;
        }
        
        // 容器和图片尺寸一致包裹
        photoStyle.value = {
          width: `${width}px`,
          height: `${height}px`,
        };
        photoLoaded.value = true;
      };
      img.src = props.photoUrl;
    } catch (e) {
      // use default
    }
  }
});

// 获取里程碑信息
function getMilestoneInfo(days) {
  const milestones = {
    520: { label: '我爱你', emoji: '💖', theme: 'love' },
    1314: { label: '一生一世', emoji: '💕', theme: 'forever' },
    365: { label: '一周年', emoji: '🎂', theme: 'anniversary' },
    730: { label: '两周年', emoji: '🎂', theme: 'anniversary' },
    1095: { label: '三周年', emoji: '🎂', theme: 'anniversary' },
    666: { label: '666', emoji: '✨', theme: 'lucky' },
    888: { label: '发发发', emoji: '✨', theme: 'lucky' },
    999: { label: '久久久', emoji: '✨', theme: 'lucky' },
  };
  
  return milestones[days] || null;
}

const milestoneInfo = computed(() => getMilestoneInfo(totalDays.value));

async function downloadPoster() {
  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size - 紧凑竖版海报
  const width = 540;
  const withPhoto = !!props.photoUrl;
  const height = withPhoto ? 800 : 680;
  canvas.width = width;
  canvas.height = height;
  
  // 获取模板样式
  const template = currentTemplate.value;
  const accentColor = template.accent;
  
  // 获取里程碑信息
  const milestone = milestoneInfo.value;
  const isMilestone = !!milestone;
  
  // 里程碑优先于模板颜色
  let finalAccentColor = accentColor;
  let themeDecorations = template.decorations;
  
  if (isMilestone) {
    switch(milestone.theme) {
      case 'love':
        finalAccentColor = '#FF6B9D';
        themeDecorations = ['💖', '💗', '💕', '❤️'];
        break;
      case 'forever':
        finalAccentColor = '#FF4757';
        themeDecorations = ['💕', '💑', '💏', '❤️'];
        break;
      case 'anniversary':
        finalAccentColor = '#FFB347';
        themeDecorations = ['🎂', '🕯️', '🎉', '🎁'];
        break;
      case 'lucky':
        finalAccentColor = '#FFD700';
        themeDecorations = ['✨', '⭐', '💫', '🌟'];
        break;
    }
  }
  
  // Background gradient (使用模板颜色，但里程碑时微调)
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  if (isMilestone) {
    gradient.addColorStop(0, milestone.theme === 'lucky' ? '#FFFEF0' : template.gradient[0]);
    gradient.addColorStop(1, milestone.theme === 'lucky' ? '#FFF8E7' : template.gradient[1]);
  } else {
    gradient.addColorStop(0, template.gradient[0]);
    gradient.addColorStop(1, template.gradient[1]);
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Draw decorations (使用模板/里程碑装饰)
  ctx.font = '32px serif';
  ctx.textAlign = 'center';
  
  const decoPositions = [
    { x: 50, y: 80 },
    { x: 550, y: 150 },
    { x: 40, y: 400 },
    { x: 560, y: 350 },
  ];
  decoPositions.forEach((pos, i) => {
    ctx.fillText(themeDecorations[i % themeDecorations.length], pos.x, pos.y);
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
  
  // 布局参数
  let photoLoaded = false;
  let photoHeight = 0;
  let baseY = 50;
  const centerX = width / 2;
  
  // 里程碑标题
  if (isMilestone) {
    ctx.fillStyle = finalAccentColor;
    ctx.font = 'bold 28px serif, Georgia';
    ctx.fillText(`${milestone.emoji} ${milestone.label} ${milestone.emoji}`, centerX, baseY + 25);
    baseY += 40;
  }
  
  // Title
  ctx.fillStyle = finalAccentColor;
  ctx.font = 'bold 32px serif, Georgia';
  ctx.fillText('✨ zhuzhu ✨', centerX, baseY + 35);
  baseY += 55;
  
  // 照片 - 保持原图长宽比
  let loadedImg = null;
  if (props.photoUrl) {
    try {
      loadedImg = await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = props.photoUrl;
      });
      
      if (loadedImg) {
        // 计算保持原图比例的照片尺寸
        const maxPhotoW = 450;
        const maxPhotoH = 300;
        const imgRatio = loadedImg.width / loadedImg.height;
        
        let photoW, photoH;
        if (imgRatio > maxPhotoW / maxPhotoH) {
          // 图片更宽，以宽度为限制
          photoW = maxPhotoW;
          photoH = maxPhotoW / imgRatio;
        } else {
          // 图片更高，以高度为限制
          photoH = maxPhotoH;
          photoW = maxPhotoH * imgRatio;
        }
        
        const photoX = (width - photoW) / 2;
        const photoY = baseY;
        photoHeight = photoH;
        
        ctx.save();
        ctx.beginPath();
        roundedRect(ctx, photoX, photoY, photoW, photoH, 12);
        ctx.clip();
        ctx.drawImage(loadedImg, photoX, photoY, photoW, photoH);
        ctx.restore();
        
        // 照片边框
        ctx.strokeStyle = finalAccentColor;
        ctx.lineWidth = 2;
        roundedRect(ctx, photoX, photoY, photoW, photoH, 12);
        ctx.stroke();
        
      photoLoaded = true;
    }
    } catch {
      // 静默处理，图片加载失败不影响海报生成
    }
  }
  
  // 调整后续元素位置
  const contentStartY = photoLoaded ? baseY + photoHeight + 30 : baseY + 35;
  
  // Subtitle
  ctx.fillStyle = '#666666';
  ctx.font = '22px serif, Georgia';
  ctx.fillText('我们在一起', centerX, contentStartY);
  
  // Days number
  ctx.fillStyle = finalAccentColor;
  ctx.font = 'bold 100px serif, Georgia';
  ctx.fillText(String(totalDays.value), centerX, contentStartY + 100);
  
  // Days label
  ctx.fillStyle = '#999999';
  ctx.font = '32px serif, Georgia';
  ctx.fillText('天', centerX, contentStartY + 140);
  
  // 里程碑特殊标签
  if (isMilestone && milestone.theme === 'love') {
    ctx.fillStyle = finalAccentColor;
    ctx.font = '18px serif, Georgia';
    ctx.fillText('我爱你', centerX, contentStartY + 170);
  }
  
  // Start date
  ctx.fillStyle = '#999999';
  ctx.font = '16px sans-serif';
  ctx.fillText(`从 ${startDate.value} 开始`, centerX, contentStartY + 200);
  
  // Divider
  ctx.strokeStyle = finalAccentColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(120, contentStartY + 230);
  ctx.lineTo(420, contentStartY + 230);
  ctx.stroke();
  
  // Signature
  ctx.fillStyle = finalAccentColor;
  ctx.font = '22px serif, Georgia';
  ctx.fillText('💕 大萝卜 ❤️ 小葡萄', centerX, contentStartY + 270);
  
  // Footer
  ctx.fillStyle = '#CCCCCC';
  ctx.font = '12px sans-serif';
  ctx.fillText('zhuzhu.site', centerX, height - 20);
  
  // Convert to image and download
  const link = document.createElement('a');
  link.download = `zhuzhu-${totalDays.value}days.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// 圆角矩形辅助函数
function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
</script>

<style scoped>
.poster-canvas {
  width: 200px;
  height: 320px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  transform-origin: top center;
}

@media (min-width: 400px) {
  .poster-canvas {
    width: 220px;
    height: 350px;
  }
}

.poster-bg {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--poster-gradient-start) 0%, var(--poster-gradient-end) 100%);
  position: relative;
  padding: 16px;
}

.poster-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding-top: 8px;
}

.poster-title {
  font-family: serif;
  font-size: 16px;
  color: var(--poster-accent);
  margin-bottom: 8px;
}

.poster-title.with-milestone {
  margin-top: 0;
}

.milestone-badge {
  font-size: 11px;
  color: var(--poster-accent);
  margin-bottom: 2px;
  animation: pulse 2s ease-in-out infinite;
}

.poster-photo-preview {
  width: 100%;
  max-width: 160px;
  min-height: 50px;
  border-radius: 6px;
  overflow: hidden;
  margin: 0 auto 8px;
  border: 1px solid var(--poster-accent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.poster-photo-preview img {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 70px;
  object-fit: contain;
}

.poster-main {
  margin: 12px 0;
}

.poster-subtitle {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.poster-days {
  font-size: 60px;
  font-weight: bold;
  color: var(--poster-accent);
  line-height: 1;
  font-family: serif;
}

.poster-days-label {
  font-size: 18px;
  color: #999;
}

.poster-date {
  font-size: 10px;
  color: #999;
}

.poster-signature {
  margin-top: 16px;
  font-size: 12px;
  color: var(--poster-accent);
}

/* Decorations */
.poster-decorations {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.deco {
  position: absolute;
  font-size: 24px;
  animation: float 3s ease-in-out infinite;
}

.deco-1 { top: 10px; left: 15px; animation-delay: 0s; }
.deco-2 { top: 30px; right: 20px; animation-delay: 0.5s; }
.deco-3 { top: 120px; left: 10px; animation-delay: 1s; }
.deco-4 { top: 100px; right: 15px; animation-delay: 1.5s; }
.deco-5 { top: 160px; right: 20px; animation-delay: 2s; }
.deco-6 { top: 200px; left: 15px; animation-delay: 2.5s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>
