<template>
  <div class="wish-filters">
    <!-- Desktop Filters -->
    <div class="hidden sm:flex items-center gap-3 flex-wrap">
      <!-- Category Filter -->
      <div class="flex items-center gap-2">
        <span class="text-text-secondary text-sm">分类:</span>
        <div class="flex gap-1">
          <button
            v-for="cat in categories"
            :key="cat"
            @click="setCategory(cat)"
            class="filter-btn px-3 py-1 rounded-full text-sm transition-all"
            :class="selectedCategory === cat 
              ? 'bg-primary text-white' 
              : 'bg-card text-text-secondary hover:bg-primary/10'"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Priority Filter -->
      <div class="flex items-center gap-2">
        <span class="text-text-secondary text-sm">优先级:</span>
        <div class="flex gap-1">
          <button
            v-for="pri in priorities"
            :key="pri"
            @click="setPriority(pri)"
            class="filter-btn px-3 py-1 rounded-full text-sm transition-all"
            :class="selectedPriority === pri 
              ? 'bg-primary text-white' 
              : 'bg-card text-text-secondary hover:bg-primary/10'"
          >
            {{ pri }}
          </button>
        </div>
      </div>

      <!-- Reset -->
      <button
        v-if="selectedCategory !== '全部' || selectedPriority !== '全部'"
        @click="resetFilters"
        class="text-text-secondary text-sm hover:text-primary transition-colors"
      >
        重置
      </button>
    </div>

    <!-- Mobile Filters (Collapsible) -->
    <div class="sm:hidden">
      <button
        @click="expanded = !expanded"
        class="flex items-center justify-between w-full py-2 px-3 bg-card rounded-xl text-text-main"
      >
        <span class="text-sm">
          {{ filterSummary }}
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
                {{ cat }}
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
                {{ pri }}
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
import { ref, computed } from 'vue';
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

const filterSummary = computed(() => {
  const parts = [];
  if (props.selectedCategory !== '全部') {
    parts.push(props.selectedCategory);
  }
  if (props.selectedPriority !== '全部') {
    parts.push(`${props.selectedPriority}优先`);
  }
  return parts.length > 0 ? parts.join(' · ') : '筛选';
});

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