<template>
  <RouterLink
    :to="to"
    class="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:text-text-main hover:bg-primary/5 transition-all duration-300"
    :class="isActive ? 'text-primary bg-primary/5' : ''"
    @click="$emit('click')"
  >
    <component 
      :is="icon" 
      class="w-5 h-5"
      :class="isActive ? 'text-primary' : ''"
    />
    <span class="font-medium">{{ label }}</span>
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

defineEmits(['click']);

const route = useRoute();
const isActive = computed(() => route.path === props.to);
</script>
