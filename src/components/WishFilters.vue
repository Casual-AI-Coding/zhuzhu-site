<template>
  <div class="wish-filters">
    <!-- Desktop Filters - 紧凑下拉框 -->
    <div class="hidden sm:flex items-center gap-3">
      <!-- Category Dropdown -->
      <div class="filter-dropdown relative">
        <select
          :value="selectedCategory"
          @change="setCategory($event.target.value)"
          class="filter-select px-4 py-2 pr-10 rounded-xl bg-card border border-border text-sm text-text-main focus:outline-none focus:border-primary cursor-pointer appearance-none min-w-[100px]"
        >
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ categoryEmoji(cat) }} {{ cat }}
          </option>
        </select>
        <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
      </div>

      <!-- Priority Dropdown -->
      <div class="filter-dropdown relative">
        <select
          :value="selectedPriority"
          @change="setPriority($event.target.value)"
          class="filter-select px-4 py-2 pr-10 rounded-xl bg-card border border-border text-sm text-text-main focus:outline-none focus:border-primary cursor-pointer appearance-none min-w-[100px]"
        >
          <option v-for="pri in priorities" :key="pri" :value="pri">
            {{ priorityEmoji(pri) }} {{ pri }}
          </option>
        </select>
        <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
      </div>

      <!-- Reset -->
      <button
        v-if="selectedCategory !== '全部' || selectedPriority !== '全部'"
        @click="resetFilters"
        class="text-sm text-text-secondary hover:text-primary transition-colors px-2"
      >
        重置
      </button>
    </div>

    <!-- Mobile Filters (保持原样) -->
    <div class="sm:hidden">
      <button
        @click="expanded = !expanded"
        class="flex items-center justify-between w-full py-2 px-3 bg-card rounded-xl text-text-main"
      >
        <span class="text-sm flex items-center gap-2">
          <span v-if="selectedCategory !== '全部'">{{ categoryEmoji(selectedCategory) }} {{ selectedCategory }}</span>
          <span v-if="selectedPriority !== '全部'">{{ priorityEmoji(selectedPriority) }} {{ selectedPriority }}</span>
          <span v-if="selectedCategory === '全部' && selectedPriority === '全部'">筛选</span>
        </span>
        <ChevronDown
          class="w-4 h-4 transition-transform"
          :class="{ 'rotate-180': expanded }"
        />
      </button>

      <Transition name="expand">
        <div v-if="expanded" class="mt-3 space-y-3 p-3 bg-card rounded-xl">
          <!-- Category -->
          <div>
            <p class="text-text-secondary text-xs mb-2">分类</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="cat in categories"
                :key="cat"
                @click="setCategory(cat)"
                class="filter-btn px-3 py-1.5 rounded-full text-sm transition-all"
                :class="selectedCategory === cat 
                  ? 'bg-primary text-white' 
                  : 'bg-background text-text-secondary'"
              >
                {{ categoryEmoji(cat) }} {{ cat }}
              </button>
            </div>
          </div>

          <!-- Priority -->
          <div>
            <p class="text-text-secondary text-xs mb-2">优先级</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="pri in priorities"
                :key="pri"
                @click="setPriority(pri)"
                class="filter-btn px-3 py-1.5 rounded-full text-sm transition-all"
                :class="selectedPriority === pri 
                  ? 'bg-primary text-white' 
                  : 'bg-background text-text-secondary'"
              >
                {{ priorityEmoji(pri) }} {{ pri }}
              </button>
            </div>
          </div>

          <!-- Reset -->
          <button
            v-if="selectedCategory !== '全部' || selectedPriority !== '全部'"
            @click="resetFilters"
            class="w-full py-2 text-text-secondary text-sm hover:text-primary transition-colors border-t border-border pt-3"
          >
            重置筛选
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ChevronDown } from 'lucide-vue-next';

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

const expanded = ref(false);

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

function priorityEmoji(pri) {
  const emojis = {
    '全部': '⭐',
    '高': '🔴',
    '中': '🟡',
    '低': '🟢',
  };
  return emojis[pri] || '⭐';
}

function setCategory(cat) {
  emit('setCategory', cat);
}

function setPriority(pri) {
  emit('setPriority', pri);
}

function resetFilters() {
  emit('resetFilters');
  expanded.value = false;
}
</script>

<style scoped>
.filter-select {
  background-image: none;
}

.filter-select:focus {
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 300px;
}

.filter-btn {
  min-height: 36px;
}
</style>