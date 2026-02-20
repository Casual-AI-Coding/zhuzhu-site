<template>
  <div class="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8 sm:mb-12">
        <h1 class="font-display text-3xl sm:text-4xl lg:text-5xl text-text-main mb-3 sm:mb-4">
          时光轴
        </h1>
        <p class="text-text-secondary text-sm sm:text-lg">
          我们的恋爱历程
        </p>
      </div>
      
      <!-- Loading -->
      <div v-if="loading" class="space-y-8">
        <div v-for="i in 4" :key="i" class="relative flex items-start gap-4 sm:gap-8 animate-pulse" :class="i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'">
          <div class="absolute left-4 sm:left-1/2 w-8 h-8 -translate-x-1/2 rounded-full bg-primary/10 dark:bg-primary/5"></div>
          <div class="ml-12 sm:ml-0 sm:w-1/2" :class="i % 2 === 0 ? 'sm:pr-12 sm:text-right' : 'sm:pl-12'">
            <div class="glass-nav rounded-2xl p-6">
              <div class="flex items-center gap-2 mb-2" :class="i % 2 === 0 ? 'sm:justify-end' : ''">
                <div class="h-5 bg-primary/10 dark:bg-primary/5 rounded-full w-16"></div>
              </div>
              <div class="h-5 bg-primary/10 dark:bg-primary/5 rounded w-24 mb-2" :class="i % 2 === 0 ? 'sm:ml-auto' : ''"></div>
              <div class="h-6 bg-primary/10 dark:bg-primary/5 rounded w-32 mb-2" :class="i % 2 === 0 ? 'sm:ml-auto' : ''"></div>
              <div class="h-4 bg-primary/10 dark:bg-primary/5 rounded w-full"></div>
              <div class="h-4 bg-primary/10 dark:bg-primary/5 rounded w-2/3 mt-2"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="events.length === 0" class="text-center text-text-secondary">
        暂无时光轴数据
      </div>
      
      <!-- Timeline -->
      <div v-else class="relative">
        <!-- Timeline Line -->
        <div class="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-border sm:-translate-x-1/2"></div>
        
        <!-- Timeline Items -->
        <div class="space-y-8 landscape:space-y-4">
          <div
            v-for="(event, index) in events"
            :key="event.id"
            :ref="el => setItemRef(el, index)"
            class="timeline-item relative flex items-start gap-4 sm:gap-8"
            :class="[
              index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse',
              { 'is-visible': visibleItems[index] }
            ]"
          >
            <!-- Icon -->
            <div class="timeline-icon absolute left-4 sm:left-1/2 w-8 h-8 -translate-x-1/2 rounded-full bg-primary flex items-center justify-center z-10 text-lg shadow-lg">
              {{ event.icon || '💕' }}
            </div>
            
            <!-- Content Card -->
            <div class="timeline-card ml-12 sm:ml-0 sm:w-1/2" :class="index % 2 === 0 ? 'sm:pr-12 sm:text-right' : 'sm:pl-12'">
              <div class="glass-nav rounded-2xl p-6 card-hover">
                <div class="flex items-center gap-2 mb-2" :class="index % 2 === 0 ? 'sm:justify-end' : ''">
                  <span :class="importanceClasses[event.importance]">{{ importanceLabels[event.importance] }}</span>
                </div>
                <p class="text-primary font-handwriting text-lg mb-1">{{ formatDate(event.date) }}</p>
                <h3 class="font-display text-xl text-text-main mb-2">{{ event.title }}</h3>
                <p class="text-text-secondary text-sm">{{ event.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { fetchTimeline } from '@/lib/notion.js';
import { useDaysCount } from '@/composables/useDaysCount.js';

const { formatDate } = useDaysCount();

const events = ref([]);
const loading = ref(true);
const visibleItems = reactive({});
const itemRefs = ref([]);

let observer = null;

function setItemRef(el, index) {
  if (el) {
    itemRefs.value[index] = el;
  }
}

const importanceLabels = {
  '高': '❤️ 重要',
  '中': '💫 纪念',
};

const importanceClasses = {
  '高': 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-600',
  '中': 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600',
};

onMounted(async () => {
  events.value = await fetchTimeline();
  loading.value = false;
  window.addEventListener('refresh-data', handleRefresh);
  
  // 设置滚动观察器
  setupObserver();
});

function setupObserver() {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const index = itemRefs.value.indexOf(entry.target);
        if (index !== -1 && entry.isIntersecting) {
          visibleItems[index] = true;
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
  );
  
  // 延迟观察，确保 DOM 已渲染
  setTimeout(() => {
    itemRefs.value.forEach(el => {
      if (el) observer.observe(el);
    });
  }, 100);
}

function handleRefresh() {
  loading.value = true;
  fetchTimeline().then(data => {
    events.value = data;
    loading.value = false;
    // 重置可见状态
    Object.keys(visibleItems).forEach(key => {
      visibleItems[key] = false;
    });
    // 重新设置观察
    setTimeout(setupObserver, 100);
  });
}

onUnmounted(() => {
  window.removeEventListener('refresh-data', handleRefresh);
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style scoped>
/* 时间线入场动画 */
.timeline-item {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}

.timeline-item.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.timeline-item .timeline-icon {
  opacity: 0;
  transform: translateX(-50%) scale(0);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out;
  transition-delay: 0.2s;
}

.timeline-item.is-visible .timeline-icon {
  opacity: 1;
  transform: translateX(-50%) scale(1);
}

/* 移动端：交替从左/右滑入 */
.timeline-item .timeline-card {
  opacity: 0;
  transform: translateX(20px);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
  transition-delay: 0.3s;
}

.timeline-item.is-visible .timeline-card {
  opacity: 1;
  transform: translateX(0);
}

/* 移动端：奇数项从左滑入，偶数项从右滑入 */
@media (max-width: 639px) {
  .timeline-item:nth-child(odd) .timeline-card {
    transform: translateX(-20px);
  }
  
  .timeline-item:nth-child(even) .timeline-card {
    transform: translateX(20px);
  }
  
  .timeline-item:nth-child(odd).is-visible .timeline-card,
  .timeline-item:nth-child(even).is-visible .timeline-card {
    transform: translateX(0);
  }
}

/* 桌面端：左右交替 */
@media (min-width: 640px) {
  .timeline-item .timeline-card {
    transform: translateX(20px);
  }
  
  .timeline-item:nth-child(odd) .timeline-card {
    transform: translateX(-20px);
  }
  
  .timeline-item.is-visible .timeline-card {
    transform: translateX(0);
  }
}
</style>
