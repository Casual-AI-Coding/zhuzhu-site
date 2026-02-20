<template>
  <div class="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8 sm:mb-12">
        <h1 class="font-display text-3xl sm:text-4xl lg:text-5xl text-text-main mb-3 sm:mb-4">
          纪念日
        </h1>
        <p class="text-text-secondary text-sm sm:text-lg">
          记录我们共同的每一个重要时刻
        </p>
      </div>
      
      <!-- Days Counter Card with Progress -->
      <div class="glass-nav rounded-3xl p-6 sm:p-8 mb-8 sm:mb-12">
        <div class="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
          <!-- Progress Ring -->
          <div class="relative">
            <svg class="progress-ring w-32 h-32 sm:w-40 sm:h-40" viewBox="0 0 120 120">
              <!-- Background Circle -->
              <circle 
                class="ring-bg" 
                cx="60" cy="60" r="52"
              />
              <!-- Progress Circle -->
              <circle 
                class="ring-progress" 
                cx="60" cy="60" r="52"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="progressOffset"
              />
            </svg>
            <!-- Center Number -->
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-3xl sm:text-4xl font-display text-primary font-bold">{{ totalDays }}</span>
              <span class="text-text-secondary text-sm">天</span>
            </div>
          </div>
          
          <!-- Progress Info -->
          <div class="text-center sm:text-left">
            <p class="text-text-secondary text-sm mb-1">我们在一起已经</p>
            <p class="text-text-main text-lg mb-3">
              距离下一个里程碑 <span class="text-primary font-bold">{{ nextMilestone.days }}</span> 天
            </p>
            <!-- Progress Bar -->
            <div class="w-48 sm:w-56">
              <div class="h-2 bg-primary/10 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-primary to-pink-400 rounded-full transition-all duration-1000"
                  :style="{ width: milestoneProgress + '%' }"
                ></div>
              </div>
              <p class="text-text-secondary text-xs mt-1 text-right">{{ nextMilestone.daysUntil }} 天后</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 4" :key="i" class="glass-nav rounded-2xl p-6 animate-pulse">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/5"></div>
              <div class="space-y-2">
                <div class="h-5 bg-primary/10 dark:bg-primary/5 rounded w-24"></div>
                <div class="h-3 bg-primary/10 dark:bg-primary/5 rounded w-20"></div>
              </div>
            </div>
            <div class="text-right space-y-2">
              <div class="h-7 bg-primary/10 dark:bg-primary/5 rounded w-12 ml-auto"></div>
              <div class="h-4 bg-primary/10 dark:bg-primary/5 rounded w-10 ml-auto"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <EmptyState
        v-else-if="anniversaries.length === 0"
        type="anniversary"
        title="还没有纪念日哦~"
        subtitle="记录属于你们的特别日子吧"
        actionText="💝 添加纪念日"
      />
      
      <!-- Upcoming Anniversaries -->
      <template v-else>
        <div v-if="upcomingAnniversaries.length > 0">
          <h2 class="text-lg font-display text-text-main mb-4 flex items-center gap-2">
            <span class="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            即将到来
          </h2>
          <div class="space-y-4 mb-8">
            <div
              v-for="anniversary in upcomingAnniversaries"
              :key="anniversary.id"
              class="anniversary-card upcoming glass-nav rounded-2xl p-6 card-hover"
              :class="{ 'is-today': getDaysUntil(anniversary.date) === 0 }"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="anniversary-icon w-12 h-12 rounded-xl flex items-center justify-center" :class="getDaysUntil(anniversary.date) === 0 ? 'bg-primary text-white' : 'bg-primary/10'">
                    <Heart v-if="getDaysUntil(anniversary.date) !== 0" class="w-6 h-6 text-primary" />
                    <span v-else class="text-xl">🎉</span>
                  </div>
                  <div>
                    <h3 class="font-display text-xl text-text-main">{{ anniversary.title }}</h3>
                    <p class="text-text-secondary text-sm">{{ formatDate(anniversary.date) }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-display" :class="getDaysUntil(anniversary.date) === 0 ? 'text-primary' : 'text-primary'">
                    {{ Math.abs(getDaysUntil(anniversary.date)) }}
                  </p>
                  <p class="text-text-secondary text-sm">
                    {{ getDaysUntil(anniversary.date) < 0 ? '天前' : getDaysUntil(anniversary.date) === 0 ? '就是今天!' : '天后' }}
                  </p>
                  <!-- Progress bar for upcoming -->
                  <div v-if="getDaysUntil(anniversary.date) > 0 && getDaysUntil(anniversary.date) <= 7" class="w-16 h-1 bg-primary/10 rounded-full mt-2 ml-auto overflow-hidden">
                    <div 
                      class="h-full bg-primary rounded-full"
                      :style="{ width: ((7 - getDaysUntil(anniversary.date)) / 7 * 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Future Anniversaries -->
        <div v-if="futureAnniversaries.length > 0">
          <h2 class="text-lg font-display text-text-main mb-4">
            未来纪念日
          </h2>
          <div class="space-y-4">
            <div
              v-for="anniversary in futureAnniversaries"
              :key="anniversary.id"
              class="anniversary-card glass-nav rounded-2xl p-6 card-hover"
              :class="{ 'is-past': getDaysUntil(anniversary.date) < 0 }"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Heart class="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 class="font-display text-xl text-text-main">{{ anniversary.title }}</h3>
                    <p class="text-text-secondary text-sm">{{ formatDate(anniversary.date) }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-display" :class="getDaysUntil(anniversary.date) < 0 ? 'text-gray-400' : 'text-primary'">
                    {{ Math.abs(getDaysUntil(anniversary.date)) }}
                  </p>
                  <p class="text-text-secondary text-sm">
                    {{ getDaysUntil(anniversary.date) < 0 ? '天前' : '天后' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Heart } from 'lucide-vue-next';
import { useDaysCount } from '@/composables/useDaysCount.js';
import { fetchAnniversaries } from '@/lib/notion.js';
import EmptyState from '@/components/EmptyState.vue';

const { totalDays, nextMilestone, formatDate, getDaysUntil } = useDaysCount();

const anniversaries = ref([]);
const loading = ref(true);

// Progress ring calculations
const circumference = 2 * Math.PI * 52;
const milestoneProgress = computed(() => {
  const current = totalDays.value % 100;
  return Math.min(100, (current / 100) * 100);
});
const progressOffset = computed(() => {
  return circumference - (milestoneProgress.value / 100) * circumference;
});

// Separate anniversaries into upcoming and future
const upcomingAnniversaries = computed(() => {
  return anniversaries.value
    .filter(a => getDaysUntil(a.date) >= 0 && getDaysUntil(a.date) <= 7)
    .sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date));
});

const futureAnniversaries = computed(() => {
  return anniversaries.value
    .filter(a => getDaysUntil(a.date) > 7 || getDaysUntil(a.date) < 0)
    .sort((a, b) => Math.abs(getDaysUntil(a.date)) - Math.abs(getDaysUntil(b.date)));
});

onMounted(async () => {
  anniversaries.value = await fetchAnniversaries();
  loading.value = false;
  window.addEventListener('refresh-data', handleRefresh);
});

function handleRefresh() {
  loading.value = true;
  fetchAnniversaries().then(data => {
    anniversaries.value = data;
    loading.value = false;
  });
}

onUnmounted(() => {
  window.removeEventListener('refresh-data', handleRefresh);
});
</script>

<style scoped>
/* Progress Ring */
.progress-ring {
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: rgba(212, 165, 116, 0.15);
  stroke-width: 6;
}

.dark .ring-bg {
  stroke: rgba(232, 201, 168, 0.1);
}

.ring-progress {
  fill: none;
  stroke: #D4A574;
  stroke-width: 6;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s ease-out;
}

.dark .ring-progress {
  stroke: #E8C9A8;
}

/* Anniversary Cards */
.anniversary-card.upcoming {
  border-left: 3px solid #D4A574;
}

.dark .anniversary-card.upcoming {
  border-left-color: #E8C9A8;
}

.anniversary-card.is-today {
  background: linear-gradient(135deg, rgba(212, 165, 116, 0.15) 0%, rgba(212, 165, 116, 0.05) 100%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(212, 165, 116, 0.2);
  }
  50% {
    box-shadow: 0 0 20px 5px rgba(212, 165, 116, 0.1);
  }
}

.anniversary-card.is-past {
  opacity: 0.6;
}

/* Card entrance animation */
.anniversary-card {
  animation: slideIn 0.5s ease-out forwards;
  opacity: 0;
}

.anniversary-card:nth-child(1) { animation-delay: 0.1s; }
.anniversary-card:nth-child(2) { animation-delay: 0.2s; }
.anniversary-card:nth-child(3) { animation-delay: 0.3s; }
.anniversary-card:nth-child(4) { animation-delay: 0.4s; }
.anniversary-card:nth-child(5) { animation-delay: 0.5s; }

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
