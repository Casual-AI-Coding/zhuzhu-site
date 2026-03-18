<template>
  <div class="wish-calendar">
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
        class="month-cell p-2 sm:p-3 rounded-xl transition-all"
        :class="{
          'has-wishes': getWishesForMonth(month).length > 0,
          'is-current': isCurrentMonth(month),
        }"
        @click="showMonthWishes(month)"
      >
        <div class="text-center">
          <p class="text-xs sm:text-sm font-medium text-text-main">
            {{ month }}月
          </p>
          <div
            v-if="getWishesForMonth(month).length > 0"
            class="mt-1 flex flex-wrap justify-center gap-0.5"
          >
            <span
              v-for="i in Math.min(getWishesForMonth(month).length, 3)"
              :key="i"
              class="w-1.5 h-1.5 rounded-full bg-green-500"
            />
            <span
              v-if="getWishesForMonth(month).length > 3"
              class="text-[10px] text-text-secondary"
            >
              +{{ getWishesForMonth(month).length - 3 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Month Detail Popup (Mobile) -->
    <Transition name="fade">
      <div
        v-if="selectedMonth && showDetail"
        class="fixed inset-0 z-50 flex items-end sm:hidden"
      >
        <div
          class="absolute inset-0 bg-black/50"
          @click="closeDetail"
        />
        <div
          class="relative w-full bg-card rounded-t-2xl p-4 max-h-[60vh] overflow-y-auto"
          @click.stop
        >
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-medium text-text-main">
              {{ currentYear }}年{{ selectedMonth }}月完成的愿望
            </h4>
            <button
              @click="closeDetail"
              class="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-primary/10"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          <div class="space-y-3">
            <div
              v-for="wish in getWishesForMonth(selectedMonth)"
              :key="wish.id"
              class="p-3 bg-background rounded-xl"
            >
              <p class="font-medium text-text-main">{{ wish.title }}</p>
              <p v-if="wish.description" class="text-sm text-text-secondary mt-1">
                {{ wish.description }}
              </p>
              <p class="text-xs text-green-500 mt-2">
                {{ formatDate(wish.completedDate) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Desktop Tooltip -->
    <div
      v-if="hoveredMonth && !isMobile"
      class="hidden sm:block absolute z-10 bg-card rounded-xl shadow-lg border border-border p-3 max-w-[200px]"
      :style="tooltipStyle"
    >
      <p class="text-xs text-text-secondary mb-2">
        {{ currentYear }}年{{ hoveredMonth }}月
      </p>
      <div class="space-y-1.5">
        <div
          v-for="wish in getWishesForMonth(hoveredMonth).slice(0, 3)"
          :key="wish.id"
          class="text-sm text-text-main truncate"
        >
          {{ wish.title }}
        </div>
        <p
          v-if="getWishesForMonth(hoveredMonth).length > 3"
          class="text-xs text-text-secondary"
        >
          还有 {{ getWishesForMonth(hoveredMonth).length - 3 }} 个...
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ChevronLeft, ChevronRight, X } from 'lucide-vue-next';
import { useDaysCount } from '@/composables/useDaysCount.js';

const props = defineProps({
  wishes: {
    type: Array,
    required: true,
  },
});

const { formatDate } = useDaysCount();

const currentYear = ref(new Date().getFullYear());
const selectedMonth = ref(null);
const showDetail = ref(false);
const hoveredMonth = ref(null);
const isMobile = ref(false);
const tooltipStyle = ref({});

// Check mobile
function checkMobile() {
  isMobile.value = window.innerWidth < 640;
}

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

// Get wishes completed in a specific month
function getWishesForMonth(month) {
  return props.wishes.filter(wish => {
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
}

function nextYear() {
  currentYear.value++;
}

// Show month wishes
function showMonthWishes(month) {
  if (getWishesForMonth(month).length === 0) return;
  
  if (isMobile.value) {
    selectedMonth.value = month;
    showDetail.value = true;
  }
}

function closeDetail() {
  showDetail.value = false;
  selectedMonth.value = null;
}
</script>

<style scoped>
.wish-calendar {
  position: relative;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

@media (min-width: 640px) {
  .calendar-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 0.75rem;
  }
}

.month-cell {
  background: var(--color-card);
  cursor: pointer;
  min-height: 48px;
}

.month-cell:hover {
  background: var(--color-primary);
  opacity: 0.1;
}

.month-cell.has-wishes {
  background: rgba(34, 197, 94, 0.1);
}

.month-cell.is-current {
  border: 2px solid var(--color-primary);
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