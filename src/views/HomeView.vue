<template>
  <div class="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <p class="text-text-secondary text-lg mb-4 font-handwriting">
          从 {{ formattedStartDate }} 开始
        </p>
        
        <h1 class="font-display text-3xl sm:text-5xl lg:text-7xl text-text-main mb-4 sm:mb-6">
          我们在一起
        </h1>
        
        <!-- Days Counter -->
        <div class="relative inline-block">
          <!-- Milestone celebration overlay -->
          <Transition name="milestone-fade">
            <div v-if="isMilestone" class="milestone-celebration absolute -inset-8 sm:-inset-12 pointer-events-none">
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="milestone-ring w-40 h-40 sm:w-56 sm:h-56 rounded-full border-4 border-primary/30 animate-pulse"></div>
              </div>
              <div class="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span class="text-2xl sm:text-3xl animate-bounce inline-block">🎉</span>
              </div>
              <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span class="font-display text-primary text-lg sm:text-xl font-bold">
                  {{ milestoneLabel }}
                </span>
              </div>
            </div>
          </Transition>
          
          <!-- Glow wave effect -->
          <div class="glow-wave-container absolute -inset-x-8 top-1/2 -translate-y-1/2 pointer-events-none">
            <div class="glow-wave"></div>
          </div>
          
          <div class="days-counter text-5xl sm:text-7xl lg:text-9xl 3xl:text-[10rem] 4xl:text-[12rem] font-display font-bold tracking-tight" :class="isMilestone ? 'text-primary animate-pulse' : 'text-primary'">
            <span v-for="(digit, index) in totalDaysDigits" :key="index" class="digit">
              {{ digit }}
            </span>
          </div>
          <div class="text-base sm:text-xl lg:text-2xl text-text-secondary mt-1 sm:mt-2">
            天
          </div>
          
          <!-- Decorative line -->
          <div class="deco-line-container mt-4">
            <div class="deco-line"></div>
            <div class="deco-heart">💕</div>
            <div class="deco-line deco-line-right"></div>
          </div>
          
          <!-- Share Button -->
          <div class="mt-6">
            <button 
              @click="showSharePoster = true"
              class="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
            >
              📤 分享我们的故事
            </button>
          </div>
        </div>
        
        <!-- Next Milestone & Countdown with Flip Clock -->
        <div class="mt-6 sm:mt-8 flex flex-wrap justify-center gap-4 sm:gap-6">
          <!-- 百天里程碑卡片 -->
          <div class="countdown-card milestone-card glass-nav rounded-2xl px-4 sm:px-6 py-4 sm:py-6 min-w-[280px] sm:min-w-[340px] relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-pink-400 to-primary"></div>
            <div class="flex items-center justify-center gap-2 mb-3">
              <span class="text-lg">🎯</span>
              <p class="text-text-secondary text-sm text-center">
                百天里程碑
              </p>
            </div>
            <p class="text-text-secondary text-sm mb-3 text-center">
              距离 <span class="font-display text-primary font-bold">{{ nextMilestone.days }}</span> 天纪念日
            </p>
            <FlipClock
              v-if="milestoneCountdown"
              :days="milestoneCountdown.days"
              :hours="milestoneCountdown.hours"
              :minutes="milestoneCountdown.minutes"
              :seconds="milestoneCountdown.seconds"
            />
            <p v-else class="text-2xl font-display text-primary text-center py-4">{{ nextMilestone.daysUntil }} 天</p>
          </div>

          <!-- 周年纪念卡片 -->
          <div class="countdown-card anniversary-card glass-nav rounded-2xl px-4 sm:px-6 py-4 sm:py-6 min-w-[280px] sm:min-w-[340px] relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-primary to-pink-400"></div>
            <div class="flex items-center justify-center gap-2 mb-3">
              <span class="text-lg">💝</span>
              <p class="text-text-secondary text-sm text-center">
                周年纪念
              </p>
            </div>
            <p class="text-text-secondary text-sm mb-3 text-center">
              距离 <span class="font-display text-primary font-bold">{{ nextAnniversary.year }}</span> 周年
            </p>
            <FlipClock
              v-if="countdown"
              :days="countdown.days"
              :hours="countdown.hours"
              :minutes="countdown.minutes"
              :seconds="countdown.seconds"
            />
            <p v-else class="text-2xl font-display text-primary text-center py-4">{{ nextAnniversary.daysUntil }} 天</p>
          </div>
        </div>
      </div>
      
      <!-- Featured Photos Preview -->
      <div class="mt-12 sm:mt-16">
        <h2 class="font-display text-xl sm:text-2xl text-text-main text-center mb-6 sm:mb-8">精选瞬间</h2>
        
        <!-- Skeleton Loading -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="i in featuredCount" :key="i" class="animate-pulse">
            <div class="bg-card rounded-2xl overflow-hidden">
              <div class="aspect-[4/3] bg-primary/10 dark:bg-primary/5"></div>
              <div class="p-4 space-y-2">
                <div class="h-4 bg-primary/10 dark:bg-primary/5 rounded w-3/4"></div>
                <div class="h-3 bg-primary/10 dark:bg-primary/5 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="error" class="text-center py-12">
          <div class="text-6xl mb-4">💔</div>
          <p class="text-text-secondary mb-4">照片加载失败，请稍后再试</p>
          <button
            type="button"
            class="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors"
            @click="handleRefresh"
          >
            重新加载
          </button>
        </div>

        <div v-else-if="photos.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">📷</div>
          <p class="text-text-secondary">暂无照片</p>
        </div>
        
        <div v-else class="photo-carousel-container">
          <PhotoCarousel 
            :photos="displayedPhotos" 
            :format-date="formatDate"
            @open-gallery="$router.push('/gallery')"
          />
        </div>
        
        <div class="text-center mt-8">
          <RouterLink
            to="/gallery"
            class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/80 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:bg-primary/70 active:translate-y-0 active:scale-95 transition-all duration-200"
          >
            <Image class="w-5 h-5" />
            查看更多照片
          </RouterLink>
        </div>
      </div>
    </div>
    
    <!-- Share Poster Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div 
          v-if="showSharePoster" 
          class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          @click.self="showSharePoster = false"
        >
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-display text-text-main">分享海报</h3>
              <button type="button" @click="showSharePoster = false" class="text-text-secondary hover:text-text-main p-2 -m-2 cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">✕</button>
            </div>
            <div class="flex justify-center">
              <SharePoster :photo-url="selectedPosterPhoto" />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Image } from 'lucide-vue-next';
import { useDaysCount } from '@/composables/useDaysCount.js';
import { fetchPhotos, invalidate } from '@/lib/notion.js';
import PhotoCarousel from '@/components/PhotoCarousel.vue';
import FlipClock from '@/components/FlipClock.vue';
import SharePoster from '@/components/SharePoster.vue';

const { totalDays, nextMilestone, nextMilestoneDate, nextAnniversary, nextAnniversaryDate, formattedStartDate, formatDate, getCountdown } = useDaysCount();

// 天数拆分为数字数组（用于动画）
const totalDaysDigits = computed(() => String(totalDays.value).split(''));

// 里程碑检测 (百天整数倍与有特殊含义的日子)
const milestoneConfig = computed(() => {
  const days = totalDays.value;
  const milestones = [100, 200, 300, 365, 500, 520, 666, 730, 777, 888, 999, 1000, 1095, 1111, 1234, 1314, 1500, 2000, 2500, 3000, 5000, 10000];
  
  for (const milestone of milestones) {
    if (days === milestone) {
      return { isMilestone: true, value: milestone };
    }
  }
  
  // Also check if it's a 100-day multiple
  if (days > 0 && days % 100 === 0) {
    return { isMilestone: true, value: days };
  }
  
  return { isMilestone: false, value: null };
});

const isMilestone = computed(() => milestoneConfig.value.isMilestone);

const milestoneLabel = computed(() => {
  const value = milestoneConfig.value.value;
  if (!value) return '';
  
  if (value === 365) return '一周年';
  if (value === 730) return '两周年';
  if (value === 1095) return '三周年';
  if (value === 1314) return '一生一世';
  if (value === 520) return '我爱你';
  if (value < 1000) return `${value}天`;
  return `${(value / 1000).toFixed(1)}千天`;
});

const photos = ref([]);
const loading = ref(true);
const error = ref(false);
const countdown = ref(null);
const milestoneCountdown = ref(null);
const showSharePoster = ref(false);

// 分享海报使用的照片：以天数取模挑选，同一天内稳定不变
const selectedPosterPhoto = computed(() => {
  if (photos.value.length > 0) {
    return photos.value[totalDays.value % photos.value.length].url;
  }
  return '';
});

let countdownTimer = null;

// 响应式窗口宽度（用于骨架屏数量）
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);

function updateWindowWidth() {
  windowWidth.value = window.innerWidth;
}

// 只显示一行的照片数量 (for skeleton)
const featuredCount = computed(() => {
  const width = windowWidth.value;
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
});

// 轮播显示的照片数量
const carouselCount = 5;

// 轮播展示的照片
const displayedPhotos = computed(() => {
  return photos.value.slice(0, carouselCount);
});

function updateCountdown() {
  countdown.value = getCountdown(nextAnniversaryDate.value);
  milestoneCountdown.value = getCountdown(nextMilestoneDate.value);
}

onMounted(async () => {
  try {
    photos.value = await fetchPhotos();
    error.value = false;
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
  updateCountdown();
  countdownTimer = setInterval(updateCountdown, 1000);

  // 监听窗口大小变化
  window.addEventListener('resize', updateWindowWidth);
  window.addEventListener('refresh-data', handleRefresh);

  // 如果是里程碑，触发庆祝烟花
  if (isMilestone.value && window.__launchCelebration) {
    setTimeout(() => {
      window.__launchCelebration();
    }, 500);
  }
});

function handleRefresh() {
  loading.value = true;
  error.value = false;
  invalidate('photos');
  fetchPhotos()
    .then((data) => {
      photos.value = data;
    })
    .catch(() => {
      error.value = true;
    })
    .finally(() => {
      loading.value = false;
    });
}

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer);
  window.removeEventListener('resize', updateWindowWidth);
  window.removeEventListener('refresh-data', handleRefresh);
});
</script>

<style scoped>
/* 天数计数器动画 */
.days-counter {
  display: inline-flex;
  gap: 2px;
}

.days-counter .digit {
  display: inline-block;
  animation: digitPop 0.6s ease-out both;
}

.days-counter .digit:nth-child(1) { animation-delay: 0.1s; }
.days-counter .digit:nth-child(2) { animation-delay: 0.2s; }
.days-counter .digit:nth-child(3) { animation-delay: 0.3s; }
.days-counter .digit:nth-child(4) { animation-delay: 0.4s; }
.days-counter .digit:nth-child(5) { animation-delay: 0.5s; }

@keyframes digitPop {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(20px);
  }
  60% {
    transform: scale(1.1) translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Glow Wave Effect - simplified */
.glow-wave-container {
  opacity: 0.4;
}

.glow-wave {
  width: 200%;
  height: 60px;
  background: radial-gradient(ellipse at center, 
    rgba(212, 165, 116, 0.2) 0%, 
    transparent 70%
  );
  animation: wavePulse 4s ease-in-out infinite;
}

@keyframes wavePulse {
  0%, 100% {
    opacity: 0.3;
    transform: scaleX(0.9);
  }
  50% {
    opacity: 0.5;
    transform: scaleX(1);
  }
}

/* Decorative Line */
.deco-line-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.deco-line {
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
  animation: lineExpand 0.8s ease-out 0.6s both;
}

.deco-line-right {
  animation: lineExpandRight 0.8s ease-out 0.6s both;
}

@keyframes lineExpand {
  from {
    width: 0;
    opacity: 0;
  }
  to {
    width: 40px;
    opacity: 1;
  }
}

@keyframes lineExpandRight {
  from {
    width: 0;
    opacity: 0;
  }
  to {
    width: 40px;
    opacity: 1;
  }
}

.deco-heart {
  animation: heartBeat 1.5s ease-in-out 1s infinite;
}

@keyframes heartBeat {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

/* Milestone Celebration */
.milestone-celebration {
  z-index: 10;
}

.milestone-ring {
  animation: ringPulse 2s ease-in-out infinite;
}

@keyframes ringPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.6;
  }
}

.milestone-fade-enter-active,
.milestone-fade-leave-active {
  transition: opacity 0.5s ease;
}

.milestone-fade-enter-from,
.milestone-fade-leave-to {
  opacity: 0;
}

/* Photo Carousel Container */
.photo-carousel-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}
</style>
