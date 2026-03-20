<template>
  <div
    class="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8"
    @touchstart="handlePullStart"
    @touchmove="handlePullMove"
    @touchend="handlePullEnd"
  >
    <!-- Pull to refresh indicator -->
    <div
      v-if="refreshing"
      class="fixed top-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary text-white rounded-full shadow-lg z-50 flex items-center gap-2"
    >
      <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      <span class="text-sm">刷新中...</span>
    </div>

    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-6 sm:mb-8">
        <h1 class="font-display text-3xl sm:text-4xl lg:text-5xl text-text-main mb-2 sm:mb-3">
          愿望清单
        </h1>
        <p class="text-text-secondary text-sm sm:text-base">
          一起完成的美好愿望 ✨
        </p>
      </div>

      <!-- Stats -->
      <div class="flex justify-center gap-4 sm:gap-8 mb-6 sm:mb-8">
        <div class="text-center">
          <p class="text-2xl sm:text-3xl font-bold text-primary">{{ stats.inProgress }}</p>
          <p class="text-xs sm:text-sm text-text-secondary">进行中</p>
        </div>
        <div class="w-px bg-border" />
        <div class="text-center">
          <p class="text-2xl sm:text-3xl font-bold text-green-500">{{ stats.completed }}</p>
          <p class="text-xs sm:text-sm text-text-secondary">已完成</p>
        </div>
      </div>

      <!-- Filters + Status Filter + View Mode Toggle -->
      <div class="flex items-center justify-between gap-3 mb-6">
        <div class="flex items-center gap-3">
          <WishFilters
            :categories="categories"
            :priorities="priorities"
            :selected-category="selectedCategory"
            :selected-priority="selectedPriority"
            @set-category="setCategory"
            @set-priority="setPriority"
            @reset-filters="resetFilters"
          />
          <!-- Status Filter -->
          <div class="flex items-center gap-1 p-1 bg-card rounded-lg">
            <button
              v-for="status in ['全部', '进行中', '已完成']"
              :key="status"
              @click="selectedStatus = status"
              class="px-3 py-1.5 rounded-md text-sm transition-all"
              :class="selectedStatus === status ? 'bg-primary text-white' : 'text-text-secondary hover:bg-primary/10'"
            >
              {{ status }}
            </button>
          </div>
        </div>
        <div class="flex items-center gap-1 p-1 bg-card rounded-lg shrink-0">
          <button
            @click="setViewMode('list')"
            class="p-2 rounded-md transition-all"
            :class="viewMode === 'list' ? 'bg-primary text-white' : 'text-text-secondary'"
          >
            <List class="w-4 h-4" />
          </button>
          <button
            @click="setViewMode('calendar')"
            class="p-2 rounded-md transition-all"
            :class="viewMode === 'calendar' ? 'bg-primary text-white' : 'text-text-secondary'"
          >
            <Calendar class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div v-for="i in 4" :key="i" class="animate-pulse">
          <div class="glass-nav rounded-2xl p-5">
            <div class="flex justify-between mb-3">
              <div class="h-5 bg-primary/10 rounded w-32" />
              <div class="h-5 bg-primary/10 rounded w-10" />
            </div>
            <div class="h-4 bg-primary/10 rounded w-full mb-2" />
            <div class="h-4 bg-primary/10 rounded w-3/4" />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <WishEmptyState
        v-else-if="filteredWishes.length === 0"
        :type="emptyStateType"
        @add="openModal"
      />

      <!-- Content -->
      <template v-else>
        <!-- List View -->
        <TransitionGroup
          v-if="viewMode === 'list'"
          name="wish"
          tag="div"
          class="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <WishCard
            v-for="wish in filteredWishes"
            :key="wish.id"
            :wish="wish"
            @complete="handleComplete"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </TransitionGroup>

        <!-- Calendar View -->
        <WishCalendar
          v-else
          :wishes="completedWishes"
        />
      </template>

      <!-- Add Button (FAB) - positioned on left side to avoid overlap with back-to-top -->
      <button
        @click="openModal"
        class="fab fixed left-4 sm:left-8 bottom-20 sm:bottom-8 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-primary to-pink-400 text-white shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-30"
      >
        <Plus class="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>

    <!-- Modal -->
    <WishModal
      :show="showModal"
      :wish="editingWish"
      @close="closeModal"
      @submit="handleSubmit"
    />

    <!-- Completion Date Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showCompleteModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-black/50" @click="cancelComplete" />
          <div class="relative bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 class="text-lg font-medium text-text-main mb-2">完成愿望</h3>
            <p class="text-text-secondary text-sm mb-4">
              选择完成日期
            </p>
            <div class="mb-4">
              <input
                v-model="completeDate"
                type="date"
                class="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-main focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div class="flex gap-3">
              <button
                @click="cancelComplete"
                class="flex-1 py-2 bg-background rounded-xl text-text-secondary font-medium"
              >
                取消
              </button>
              <button
                @click="confirmComplete"
                class="flex-1 py-2 bg-green-500 text-white rounded-xl font-medium"
              >
                确认完成
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirmation -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showDeleteConfirm"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-black/50" @click="cancelDelete" />
          <div class="relative bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 class="text-lg font-medium text-text-main mb-2">确认删除</h3>
            <p class="text-text-secondary text-sm mb-4">
              确定要删除这个愿望吗？此操作无法撤销。
            </p>
            <div class="flex gap-3">
              <button
                @click="cancelDelete"
                class="flex-1 py-2 bg-background rounded-xl text-text-secondary font-medium"
              >
                取消
              </button>
              <button
                @click="confirmDelete"
                class="flex-1 py-2 bg-red-500 text-white rounded-xl font-medium"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Plus, List, Calendar } from 'lucide-vue-next';
import { useWishes } from '@/composables/useWishes.js';
import WishCard from '@/components/WishCard.vue';
import WishFilters from '@/components/WishFilters.vue';
import WishModal from '@/components/WishModal.vue';
import WishCalendar from '@/components/WishCalendar.vue';
import WishEmptyState from '@/components/WishEmptyState.vue';

const {
  wishes,
  loading,
  selectedCategory,
  selectedPriority,
  selectedStatus,
  viewMode,
  categories,
  priorities,
  statuses,
  filteredWishes,
  completedWishes,
  stats,
  loadWishes,
  addWish,
  updateWish,
  completeWish,
  deleteWish,
  setCategory,
  setPriority,
  setStatus,
  setViewMode,
  resetFilters,
} = useWishes();

// Modal state
const showModal = ref(false);
const editingWish = ref(null);

// Delete confirmation
const showDeleteConfirm = ref(false);
const deletingWishId = ref(null);

// Completion modal
const showCompleteModal = ref(false);
const completingWishId = ref(null);
const completeDate = ref('');

// Refresh
const refreshing = ref(false);

// Empty state type
const emptyStateType = computed(() => {
  if (wishes.value.length === 0) return 'empty';
  if (viewMode.value === 'calendar' && completedWishes.value.length === 0) return 'completed';
  return 'filtered';
});

// Modal handlers
function openModal() {
  editingWish.value = null;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingWish.value = null;
}

function handleEdit(wish) {
  editingWish.value = wish;
  showModal.value = true;
}

async function handleSubmit(formData) {
  let success;
  if (editingWish.value) {
    success = await updateWish(editingWish.value.id, formData);
  } else {
    success = await addWish(formData);
  }
  closeModal();
}

// Complete handlers
function handleComplete(wishId) {
  completingWishId.value = wishId;
  completeDate.value = new Date().toISOString().split('T')[0]; // Default to today
  showCompleteModal.value = true;
}

function cancelComplete() {
  showCompleteModal.value = false;
  completingWishId.value = null;
  completeDate.value = '';
}

async function confirmComplete() {
  if (completingWishId.value && completeDate.value) {
    await completeWish(completingWishId.value, completeDate.value);
  }
  showCompleteModal.value = false;
  completingWishId.value = null;
  completeDate.value = '';
}

// Delete handlers
function handleDelete(wishId) {
  deletingWishId.value = wishId;
  showDeleteConfirm.value = true;
}

function cancelDelete() {
  showDeleteConfirm.value = false;
  deletingWishId.value = null;
}

async function confirmDelete() {
  if (deletingWishId.value) {
    await deleteWish(deletingWishId.value);
  }
  showDeleteConfirm.value = false;
  deletingWishId.value = null;
}

// Pull to refresh
let pullStartY = 0;
function handlePullStart(e) {
  if (window.scrollY === 0) {
    pullStartY = e.touches[0].clientY;
  }
}

function handlePullMove(e) {
  if (pullStartY > 0 && window.scrollY === 0) {
    const pullCurrentY = e.touches[0].clientY;
    if (pullCurrentY - pullStartY > 100 && !refreshing.value && !loading.value) {
      refreshing.value = true;
      loadWishes().then(() => {
        refreshing.value = false;
      });
      pullStartY = 0;
    }
  }
}

function handlePullEnd() {
  pullStartY = 0;
}

// Lifecycle
onMounted(() => {
  loadWishes();
});
</script>

<style scoped>
/* Wish card animations */
.wish-enter-active {
  animation: wishIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.wish-leave-active {
  animation: wishOut 0.3s ease-in;
}

.wish-move {
  transition: transform 0.4s ease;
}

@keyframes wishIn {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes wishOut {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.9);
  }
}

/* FAB animation */
.fab {
  animation: fabIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes fabIn {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Tab button */
.tab-btn {
  min-height: 40px;
}
</style>