<template>
  <RouterLink
    :to="to"
    class="relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group"
    :class="isActive ? 'text-primary' : 'text-text-secondary hover:text-text-main hover:bg-primary/5'"
  >
    <div class="flex items-center gap-2">
      <component 
        :is="icon" 
        class="w-4 h-4 transition-transform group-hover:scale-110"
        :class="isActive ? 'text-primary' : ''"
      />
      <span>{{ label }}</span>
    </div>
    
    <!-- Active indicator -->
    <div
      v-if="isActive"
      class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
    />
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
  to: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  icon: {
    type: Object,
    required: true,
  },
});

const route = useRoute();
const isActive = computed(() => route.path === props.to);
</script>
