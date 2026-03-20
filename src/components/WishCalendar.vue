<template>
  <div class="wish-calendar">
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Left: Calendar Grid -->
      <div class="flex-1">
        <!-- Year Navigation -->
        <div class="flex items-center justify-between mb-4">
          <button
            @click="prevYear"
            class="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:bg-primary/10 hover:text-primary transition-all"
          >
            <ChevronLeft class="w-5 h-5" />
          </button>
          <h3 class="text-lg font-medium text-text-main">
            {{ currentYear }}年
          </h3>
          <button
            @click="nextYear"
            class="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:bg-primary/10 hover:text-primary transition-all"
          >
            <ChevronRight class="w-5 h-5" />
          </button>
        </div>

        <!-- Calendar Grid -->
         <div class="calendar-grid">
          <div
            v-for="month in 12"
            :key="month"
            class="month-cell p-3 rounded-xl transition-all relative"
            :class="{
              'has-wishes': getWishesForMonth(month).length > 0,
              'is-current': isCurrentMonth(month),
              'is-selected': selectedMonth === month,
            }"
            @click="selectMonth(month)"
          >
            <div class="text-center">
              <p class="text-sm font-medium text-text-main">
                {{ month }}月
              </p>
              <div
                v-if="getWishesForMonth(month).length > 0"
                class="mt-2 flex flex-wrap justify-center gap-1"
              >
                <!-- In-progress dots (primary color) -->
                <span
                  v-for="i in Math.min(getInProgressWishesForMonth(month).length, 2)"
                  :key="'ip-'+i"
                  class="w-2 h-2 rounded-full bg-primary"
                />
                <!-- Completed dots (green) -->
                <span
                  v-for="i in Math.min(getCompletedWishesForMonth(month).length, 2)"
                  :key="'c-'+i"
                  class="w-2 h-2 rounded-full bg-green-500"
                />
                <span
                  v-if="getWishesForMonth(month).length > 4"
                  class="text-[10px] text-text-secondary"
                >
                  +{{ getWishesForMonth(month).length - 4 }}
                </span>
              </div>
              <div 
                v-if="getWishesForMonth(month).length > 0"
                class="text-xs mt-1 flex items-center justify-center gap-2"
              >
                <span v-if="getInProgressWishesForMonth(month).length > 0" class="text-primary">
                  {{ getInProgressWishesForMonth(month).length }}进行中
                </span>
                <span v-if="getCompletedWishesForMonth(month).length > 0" class="text-green-600">
                  {{ getCompletedWishesForMonth(month).length }}已完成
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Month Detail Panel (Desktop) / Bottom Sheet (Mobile) -->
      <div class="lg:w-80 xl:w-96">
        <!-- Mobile Bottom Sheet -->
        <Teleport to="body">
          <Transition name="fade">
            <div
              v-if="selectedMonth && isMobile"
              class="fixed inset-0 z-50 flex items-end lg:hidden"
            >
              <div
                class="absolute inset-0 bg-black/50"
                @click="closeDetail"
              />
              <div
                class="relative w-full bg-card rounded-t-2xl p-4 max-h-[60vh] overflow-y-auto"
                @click.stop
              >
                <MonthDetail :month="selectedMonth" :year="currentYear" :wishes="getWishesForMonth(selectedMonth)" @close="closeDetail" />
              </div>
            </div>
          </Transition>
        </Teleport>

        <!-- Desktop Side Panel -->
        <div v-if="selectedMonth" class="hidden lg:block">
          <div class="glass-nav rounded-2xl p-4 sticky top-24">
            <MonthDetail :month="selectedMonth" :year="currentYear" :wishes="getWishesForMonth(selectedMonth)" @close="closeDetail" />
          </div>
        </div>

        <!-- Empty State (Desktop) -->
        <div v-if="!selectedMonth" class="hidden lg:block">
          <div class="glass-nav rounded-2xl p-8 text-center text-text-secondary">
            <CalendarIcon class="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>点击左侧月份查看愿望</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-vue-next';
import MonthDetail from './MonthDetail.vue';

const props = defineProps({
  wishes: {
    type: Array,
    required: true,
  },
});

const currentYear = ref(new Date().getFullYear());
const selectedMonth = ref(null);
const isMobile = ref(false);

// Check mobile
function checkMobile() {
  isMobile.value = window.innerWidth < 1024;
}

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  window.addEventListener('refresh-data', handleRefresh);
  
  // Auto-select current month if it has wishes
  const now = new Date();
  const currentMonthWishes = getWishesForMonth(now.getMonth() + 1);
  if (currentMonthWishes.length > 0) {
    selectedMonth.value = now.getMonth() + 1;
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  window.removeEventListener('refresh-data', handleRefresh);
});

// Handle refresh event
function handleRefresh() {
  // Reset selected month and let parent re-fetch data
  selectedMonth.value = null;
}

// Get wishes for a specific month (using targetDate for in-progress, completedDate for completed)
function getWishesForMonth(month) {
  return props.wishes.filter(wish => {
    // For completed wishes, use completedDate
    // For in-progress wishes, use targetDate
    const dateStr = wish.status === '已完成' ? wish.completedDate : wish.targetDate;
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date.getFullYear() === currentYear.value && date.getMonth() + 1 === month;
  });
}

// Get in-progress wishes for a specific month
function getInProgressWishesForMonth(month) {
  return props.wishes.filter(wish => {
    if (wish.status !== '进行中') return false;
    if (!wish.targetDate) return false;
    const date = new Date(wish.targetDate);
    return date.getFullYear() === currentYear.value && date.getMonth() + 1 === month;
  });
}

// Get completed wishes for a specific month
function getCompletedWishesForMonth(month) {
  return props.wishes.filter(wish => {
    if (wish.status !== '已完成') return false;
    if (!wish.completedDate) return false;
    const date = new Date(wish.completedDate);
    return date.getFullYear() === currentYear.value && date.getMonth() + 1 === month;
  });
}

// Check if month is current
function isCurrentMonth(month) {
  const now = new Date();
  return now.getFullYear() === currentYear.value && now.getMonth() + 1 === month;
}

// Navigation
function prevYear() {
  currentYear.value--;
  selectedMonth.value = null;
}

function nextYear() {
  currentYear.value++;
  selectedMonth.value = null;
}

// Select month
function selectMonth(month) {
  if (getWishesForMonth(month).length === 0) {
    selectedMonth.value = null;
    return;
  }
  selectedMonth.value = month;
}

function closeDetail() {
  selectedMonth.value = null;
}
</script>

<style scoped>
.wish-calendar {
  position: relative;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .calendar-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.month-cell {
  background: var(--color-card);
  cursor: pointer;
  min-height: 80px;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.month-cell:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.month-cell.has-wishes {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
}

.month-cell.has-wishes:hover {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.5);
}

.month-cell.is-current {
  border-color: var(--color-primary);
}

.month-cell.is-selected {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.1);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-from .relative,
.fade-leave-to .relative {
  transform: translateY(100%);
}
</style>