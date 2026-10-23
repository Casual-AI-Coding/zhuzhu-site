<template>
  <div class="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8 sm:mb-12">
        <h1 class="font-display text-3xl sm:text-4xl lg:text-5xl text-text-main mb-3 sm:mb-4">
          我们的年报
        </h1>
        <p class="text-text-secondary text-sm sm:text-lg">
          用数据回忆在一起的每一天
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 6" :key="i" class="glass-nav rounded-2xl p-6 animate-pulse">
          <div class="h-8 bg-primary/10 rounded w-16 mb-3"></div>
          <div class="h-4 bg-primary/10 rounded w-20"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-6xl mb-4">💔</div>
        <p class="text-text-secondary mb-4">统计数据加载失败，请稍后再试</p>
        <button
          type="button"
          class="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors"
          @click="handleRefresh"
        >
          重新加载
        </button>
      </div>

      <template v-else>
        <!-- 核心数字卡片 -->
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div class="stat-card glass-nav rounded-2xl p-6 text-center">
            <Heart class="w-6 h-6 text-primary mx-auto mb-2" />
            <p class="text-3xl sm:text-4xl font-display font-bold text-primary">{{ totalDays }}</p>
            <p class="text-text-secondary text-sm mt-1">在一起的天数</p>
          </div>
          <div class="stat-card glass-nav rounded-2xl p-6 text-center">
            <Camera class="w-6 h-6 text-primary mx-auto mb-2" />
            <p class="text-3xl sm:text-4xl font-display font-bold text-primary">{{ photos.length }}</p>
            <p class="text-text-secondary text-sm mt-1">记录的照片</p>
          </div>
          <div class="stat-card glass-nav rounded-2xl p-6 text-center">
            <MessageCircle class="w-6 h-6 text-primary mx-auto mb-2" />
            <p class="text-3xl sm:text-4xl font-display font-bold text-primary">{{ messages.length }}</p>
            <p class="text-text-secondary text-sm mt-1">写给对方的话</p>
          </div>
          <div class="stat-card glass-nav rounded-2xl p-6 text-center">
            <Sparkles class="w-6 h-6 text-primary mx-auto mb-2" />
            <p class="text-3xl sm:text-4xl font-display font-bold text-primary">
              {{ wishStats.completed }}<span class="text-lg text-text-secondary">/{{ wishStats.total }}</span>
            </p>
            <p class="text-text-secondary text-sm mt-1">愿望已实现</p>
          </div>
          <div class="stat-card glass-nav rounded-2xl p-6 text-center">
            <Clock class="w-6 h-6 text-primary mx-auto mb-2" />
            <p class="text-3xl sm:text-4xl font-display font-bold text-primary">{{ timeline.length }}</p>
            <p class="text-text-secondary text-sm mt-1">时光轴大事记</p>
          </div>
          <div class="stat-card glass-nav rounded-2xl p-6 text-center">
            <MapPin class="w-6 h-6 text-primary mx-auto mb-2" />
            <p class="text-3xl sm:text-4xl font-display font-bold text-primary">{{ placeCount }}</p>
            <p class="text-text-secondary text-sm mt-1">一起去过的地方</p>
          </div>
        </div>

        <!-- 最活跃月份 -->
        <div v-if="monthlyPhotos.length > 0" class="glass-nav rounded-2xl p-6 mb-8">
          <h2 class="font-display text-xl text-text-main mb-4 flex items-center gap-2">
            <Calendar class="w-5 h-5 text-primary" />
            最有回忆的月份
          </h2>
          <div class="space-y-3">
            <div
              v-for="month in monthlyPhotos"
              :key="month.key"
              class="flex items-center gap-3"
            >
              <span class="text-text-secondary text-sm w-20 shrink-0">{{ month.label }}</span>
              <div class="flex-1 h-6 bg-primary/10 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-primary to-pink-400 rounded-full transition-all duration-700"
                  :style="{ width: month.percent + '%' }"
                ></div>
              </div>
              <span class="text-text-secondary text-sm w-14 text-right shrink-0">{{ month.count }} 张</span>
            </div>
          </div>
        </div>

        <!-- 足迹排行 + 愿望分类 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="topPlaces.length > 0" class="glass-nav rounded-2xl p-6">
            <h2 class="font-display text-xl text-text-main mb-4 flex items-center gap-2">
              <MapPin class="w-5 h-5 text-primary" />
              最常出现的地方
            </h2>
            <div
              v-for="(place, index) in topPlaces"
              :key="place.name"
              class="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
            >
              <div class="flex items-center gap-3">
                <span class="font-display text-primary font-bold w-6">{{ index + 1 }}</span>
                <span class="text-text-main">{{ place.name }}</span>
              </div>
              <span class="text-text-secondary text-sm">{{ place.count }} 张照片</span>
            </div>
            <RouterLink
              v-if="placeCount > 0"
              to="/map"
              class="inline-flex items-center gap-1.5 mt-4 text-sm text-primary hover:underline"
            >
              在地图上查看足迹 →
            </RouterLink>
          </div>

          <div v-if="categoryStats.length > 0" class="glass-nav rounded-2xl p-6">
            <h2 class="font-display text-xl text-text-main mb-4 flex items-center gap-2">
              <Sparkles class="w-5 h-5 text-primary" />
              愿望的类别
            </h2>
            <div class="space-y-3">
              <div v-for="cat in categoryStats" :key="cat.name" class="flex items-center gap-3">
                <span class="text-text-secondary text-sm w-12 shrink-0">{{ cat.name }}</span>
                <div class="flex-1 h-4 bg-primary/10 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-primary rounded-full transition-all duration-700"
                    :style="{ width: cat.percent + '%' }"
                  ></div>
                </div>
                <span class="text-text-secondary text-xs w-12 text-right shrink-0">{{ cat.count }} 个</span>
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
import { Heart, Camera, MessageCircle, Sparkles, Clock, MapPin, Calendar } from 'lucide-vue-next';
import { fetchPhotos, fetchWishes, fetchMessages, fetchTimeline, invalidate } from '@/lib/notion.js';
import { useDaysCount } from '@/composables/useDaysCount.js';

const { totalDays } = useDaysCount();

const photos = ref([]);
const wishes = ref([]);
const messages = ref([]);
const timeline = ref([]);
const loading = ref(true);
const error = ref(false);

const wishStats = computed(() => ({
  total: wishes.value.length,
  completed: wishes.value.filter((w) => w.status === '已完成').length,
}));

// 去重后的地点数（有名字的）
const placeCount = computed(() => {
  const names = new Set(photos.value.filter((p) => p.place).map((p) => p.place));
  return names.size;
});

// 照片最多的月份 Top 6（含年份，跨年不合并）
const monthlyPhotos = computed(() => {
  const byMonth = {};
  for (const photo of photos.value) {
    const key = photo.date?.slice(0, 7);
    if (!key) continue;
    byMonth[key] = (byMonth[key] || 0) + 1;
  }
  const entries = Object.entries(byMonth)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const max = entries.length ? entries[0][1] : 1;
  return entries.map(([key, count]) => ({
    key,
    label: `${key.slice(0, 4)}年${Number(key.slice(5, 7))}月`,
    count,
    percent: Math.round((count / max) * 100),
  }));
});

// 地点排行 Top 5
const topPlaces = computed(() => {
  const byPlace = {};
  for (const photo of photos.value) {
    if (!photo.place) continue;
    byPlace[photo.place] = (byPlace[photo.place] || 0) + 1;
  }
  return Object.entries(byPlace)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
});

// 愿望分类分布
const categoryStats = computed(() => {
  const byCategory = {};
  for (const wish of wishes.value) {
    const name = wish.category || '其他';
    byCategory[name] = (byCategory[name] || 0) + 1;
  }
  const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const max = entries.length ? entries[0][1] : 1;
  return entries.map(([name, count]) => ({
    name,
    count,
    percent: Math.round((count / max) * 100),
  }));
});

async function loadAll() {
  loading.value = true;
  error.value = false;
  try {
    // 全部并行拉取, 任一成功即有内容可看; 全部失败才显示错误
    const [photosResult, wishesResult, messagesResult, timelineResult] = await Promise.allSettled([
      fetchPhotos(),
      fetchWishes(),
      fetchMessages(),
      fetchTimeline(),
    ]);
    if (photosResult.status === 'fulfilled') photos.value = photosResult.value;
    if (wishesResult.status === 'fulfilled') wishes.value = wishesResult.value;
    if (messagesResult.status === 'fulfilled') messages.value = messagesResult.value;
    if (timelineResult.status === 'fulfilled') timeline.value = timelineResult.value;

    const anySuccess = [photosResult, wishesResult, messagesResult, timelineResult].some((r) => r.status === 'fulfilled');
    error.value = !anySuccess;
  } finally {
    loading.value = false;
  }
}

function handleRefresh() {
  invalidate('photos');
  invalidate('wishes');
  invalidate('messages');
  invalidate('timeline');
  loadAll();
}

onMounted(() => {
  loadAll();
  window.addEventListener('refresh-data', handleRefresh);
});

onUnmounted(() => {
  window.removeEventListener('refresh-data', handleRefresh);
});
</script>

<style scoped>
.stat-card {
  animation: statIn 0.5s ease-out both;
}

.stat-card:nth-child(2) { animation-delay: 0.05s; }
.stat-card:nth-child(3) { animation-delay: 0.1s; }
.stat-card:nth-child(4) { animation-delay: 0.15s; }
.stat-card:nth-child(5) { animation-delay: 0.2s; }
.stat-card:nth-child(6) { animation-delay: 0.25s; }

@keyframes statIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
