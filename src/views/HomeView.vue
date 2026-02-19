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
          <div class="days-counter text-5xl sm:text-7xl lg:text-9xl 3xl:text-[10rem] 4xl:text-[12rem] font-display text-primary font-bold tracking-tight">
            <span v-for="(digit, index) in totalDaysDigits" :key="index" class="digit">
              {{ digit }}
            </span>
          </div>
          <div class="text-base sm:text-xl lg:text-2xl text-text-secondary mt-1 sm:mt-2">
            天
          </div>
        </div>
        
        <!-- Next Milestone & Countdown -->
        <div class="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
          <div class="glass-nav rounded-2xl px-4 sm:px-6 py-3 sm:py-4 min-w-[160px]">
            <p class="text-text-secondary dark:text-text-secondary-dark text-xs sm:text-sm mb-2 text-center">距离 {{ nextMilestone.days }} 天</p>
            <div v-if="milestoneCountdown" class="flex items-baseline justify-center gap-1 text-primary">
              <span class="text-xl sm:text-2xl font-display font-bold">{{ milestoneCountdown.days }}</span>
              <span class="text-xs">天</span>
              <span class="text-xl sm:text-2xl font-display font-bold">{{ milestoneCountdown.hours }}</span>
              <span class="text-xs">时</span>
              <span class="text-xl sm:text-2xl font-display font-bold">{{ milestoneCountdown.minutes }}</span>
              <span class="text-xs">分</span>
            </div>
            <p v-else class="text-xl sm:text-2xl font-display text-primary text-center">{{ nextMilestone.daysUntil }} 天</p>
          </div>
          
          <div class="glass-nav rounded-2xl px-4 sm:px-6 py-3 sm:py-4 min-w-[160px]">
            <p class="text-text-secondary text-xs sm:text-sm mb-2 text-center">距离 {{ nextAnniversary.year }} 周年</p>
            <div v-if="countdown" class="flex items-baseline justify-center gap-1 text-primary">
              <span class="text-xl sm:text-2xl font-display font-bold">{{ countdown.days }}</span>
              <span class="text-xs">天</span>
              <span class="text-xl sm:text-2xl font-display font-bold">{{ countdown.hours }}</span>
              <span class="text-xs">时</span>
              <span class="text-xl sm:text-2xl font-display font-bold">{{ countdown.minutes }}</span>
              <span class="text-xs">分</span>
            </div>
            <p v-else class="text-xl sm:text-2xl font-display text-primary text-center">{{ nextAnniversary.daysUntil }} 天</p>
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
              <div class="aspect-[4/3] bg-gray-200"></div>
              <div class="p-4 space-y-2">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="photos.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">📷</div>
          <p class="text-text-secondary">暂无照片</p>
        </div>
        
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 landscape:grid-cols-2 gap-4">
          <div
            v-for="(photo, index) in photos.slice(0, featuredCount)"
            :key="photo.id"
            class="card-hover cursor-pointer photo-item"
            :style="{ animationDelay: `${index * 0.1}s` }"
            @click="$router.push('/gallery')"
          >
            <PhotoCard
              :src="photo.thumbnailUrl || photo.url"
              :alt="photo.title"
              :title="photo.title"
              :date="formatDate(photo.date)"
            />
          </div>
        </div>
        
        <div class="text-center mt-8">
          <RouterLink
            to="/gallery"
            class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 active:bg-primary/80 transition-colors"
          >
            <Image class="w-5 h-5" />
            查看更多照片
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Image } from 'lucide-vue-next';
import { useDaysCount } from '@/composables/useDaysCount.js';
import { fetchPhotos } from '@/lib/notion.js';
import PhotoCard from '@/components/PhotoCard.vue';

const { totalDays, nextMilestone, nextMilestoneDate, nextAnniversary, nextAnniversaryDate, formattedStartDate, formatDate, getCountdown } = useDaysCount();

// 天数拆分为数字数组（用于动画）
const totalDaysDigits = computed(() => String(totalDays.value).split(''));

const photos = ref([]);
const loading = ref(true);
const countdown = ref(null);
const milestoneCountdown = ref(null);

let countdownTimer = null;

function updateCountdown() {
  countdown.value = getCountdown(nextAnniversaryDate.value);
  milestoneCountdown.value = getCountdown(nextMilestoneDate.value);
}

// 根据屏幕宽度动态显示照片数量
const featuredCount = computed(() => {
  const width = window.innerWidth;
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
});

onMounted(async () => {
  photos.value = await fetchPhotos();
  loading.value = false;
  updateCountdown();
  countdownTimer = setInterval(updateCountdown, 1000);
  
  // 监听刷新数据事件
  window.addEventListener('refresh-data', handleRefresh);
});

function handleRefresh() {
  loading.value = true;
  fetchPhotos().then(data => {
    photos.value = data;
    loading.value = false;
  });
}

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer);
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

/* 照片入场动画 */
.photo-item {
  opacity: 0;
  animation: photoFadeIn 0.5s ease-out forwards;
}

@keyframes photoFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
