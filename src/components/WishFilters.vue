<template>
  <div class="wish-filters">
    <!-- Filter Toggle Button -->
    <button
      @click="togglePanel"
      class="filter-toggle flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-sm text-text-main hover:bg-primary/5 transition-all"
      :class="{ 'bg-primary/10 border-primary': isActive }"
    >
      <Filter class="w-4 h-4" :class="isActive ? 'text-primary' : 'text-text-secondary'" />
      <span>{{ buttonText }}</span>
      <ChevronDown 
        class="w-4 h-4 transition-transform duration-200" 
        :class="{ 'rotate-180': showPanel }"
      />
      <!-- Active indicator dot -->
      <span v-if="isActive" class="w-2 h-2 rounded-full bg-primary" />
    </button>

    <!-- Floating Filter Panel -->
    <Teleport to="body">
      <Transition name="fade">
        <!-- Backdrop -->
        <div
          v-if="showPanel"
          class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          @click="closePanel"
        />
      </Transition>
      
      <Transition name="panel">
        <div
          v-if="showPanel"
          class="fixed z-50 bg-card rounded-2xl shadow-2xl border border-border p-4 w-[280px]"
          :style="panelPosition"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <h3 class="font-medium text-text-main">筛选愿望</h3>
            <button
              @click="closePanel"
              class="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-primary/10 transition-colors"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Category -->
          <div class="mb-4">
            <p class="text-text-secondary text-xs mb-2 flex items-center gap-1">
              <Folder class="w-3 h-3" />
              分类
            </p>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="cat in categories"
                :key="cat"
                @click="selectCategory(cat)"
                class="px-2 py-2 rounded-lg text-sm transition-all flex flex-col items-center gap-1"
                :class="tempCategory === cat 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-background text-text-secondary hover:bg-primary/10'"
              >
                <span class="text-lg">{{ categoryEmoji(cat) }}</span>
                <span class="text-xs">{{ cat }}</span>
              </button>
            </div>
          </div>

          <!-- Priority -->
          <div class="mb-4">
            <p class="text-text-secondary text-xs mb-2 flex items-center gap-1">
              <Flag class="w-3 h-3" />
              优先级
            </p>
            <div class="flex gap-2">
              <button
                v-for="pri in priorities"
                :key="pri"
                @click="selectPriority(pri)"
                class="flex-1 px-3 py-2 rounded-lg text-sm transition-all"
                :class="tempPriority === pri 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-background text-text-secondary hover:bg-primary/10'"
              >
                {{ pri }}
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex gap-2 pt-3 border-t border-border">
            <button
              @click="resetFilters"
              class="flex-1 py-2 rounded-lg text-sm text-text-secondary hover:bg-background transition-colors"
              :disabled="!isActive"
              :class="{ 'opacity-50 cursor-not-allowed': !isActive }"
            >
              重置
            </button>
            <button
              @click="applyFilters"
              class="flex-1 py-2 rounded-lg text-sm bg-primary text-white hover:opacity-90 transition-opacity"
            >
              应用
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { Filter, ChevronDown, X, Folder, Flag } from 'lucide-vue-next';

const props = defineProps({
  categories: {
    type: Array,
    required: true,
  },
  priorities: {
    type: Array,
    required: true,
  },
  selectedCategory: {
    type: String,
    default: '全部',
  },
  selectedPriority: {
    type: String,
    default: '全部',
  },
});

const emit = defineEmits(['setCategory', 'setPriority', 'resetFilters']);

const showPanel = ref(false);
const panelPosition = ref({ top: '0px', left: '0px' });

// 临时选择状态
const tempCategory = ref(props.selectedCategory);
const tempPriority = ref(props.selectedPriority);

const isActive = computed(() => {
  return props.selectedCategory !== '全部' || props.selectedPriority !== '全部';
});

const buttonText = computed(() => {
  if (!isActive.value) return '筛选';
  const parts = [];
  if (props.selectedCategory !== '全部') parts.push(props.selectedCategory);
  if (props.selectedPriority !== '全部') parts.push(props.selectedPriority);
  return parts.join(' · ');
});

function categoryEmoji(cat) {
  const emojis = {
    '全部': '🌟',
    '旅行': '✈️',
    '美食': '🍽️',
    '体验': '🎯',
    '家居': '🏠',
    '其他': '✨',
  };
  return emojis[cat] || '✨';
}

function togglePanel(event) {
  if (showPanel.value) {
    closePanel();
  } else {
    // 初始化临时状态
    tempCategory.value = props.selectedCategory;
    tempPriority.value = props.selectedPriority;
    showPanel.value = true;
    
    // 计算面板位置
    nextTick(() => {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const panelWidth = 280;
      
      // 默认显示在按钮下方，左对齐
      let left = rect.left;
      let top = rect.bottom + 8;
      
      // 如果右边超出屏幕，向左对齐
      if (left + panelWidth > window.innerWidth - 16) {
        left = window.innerWidth - panelWidth - 16;
      }
      
      // 如果左边超出屏幕（小屏幕），向右对齐
      if (left < 16) {
        left = 16;
      }
      
      // 如果下方超出屏幕，显示在按钮上方
      const panelHeight = 380;
      if (top + panelHeight > window.innerHeight - 16) {
        top = rect.top - panelHeight - 8;
      }
      
      // 确保不会超出顶部
      if (top < 16) {
        top = 16;
      }
      
      panelPosition.value = {
        top: `${top}px`,
        left: `${left}px`,
      };
    });
  }
}

function closePanel() {
  showPanel.value = false;
}

function selectCategory(cat) {
  tempCategory.value = cat;
}

function selectPriority(pri) {
  tempPriority.value = pri;
}

function applyFilters() {
  emit('setCategory', tempCategory.value);
  emit('setPriority', tempPriority.value);
  closePanel();
}

function resetFilters() {
  tempCategory.value = '全部';
  tempPriority.value = '全部';
  emit('resetFilters');
  closePanel();
}
</script>

<style scoped>
.filter-toggle {
  position: relative;
}

/* Fade transition for backdrop */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Panel transition */
.panel-enter-active,
.panel-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.panel-enter-to,
.panel-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}
</style>