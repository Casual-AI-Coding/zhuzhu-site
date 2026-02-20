<template>
  <Teleport to="body">
    <div class="toast-container fixed top-20 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 px-4">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 min-w-[200px] max-w-[320px]"
          :class="toastClass(toast.type)"
        >
          <span class="toast-icon text-base">{{ toastIcon(toast.type) }}</span>
          <span class="toast-message text-sm font-medium">{{ toast.message }}</span>
          <button 
            @click="remove(toast.id)"
            class="ml-auto opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast';

const { toasts, remove } = useToast();

function toastClass(type) {
  const classes = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-yellow-500 text-white',
  };
  return classes[type] || classes.info;
}

function toastIcon(type) {
  const icons = {
    success: '✓',
    error: '✗',
    info: 'ℹ',
    warning: '⚠',
  };
  return icons[type] || 'ℹ';
}
</script>

<style scoped>
.toast-container {
  pointer-events: none;
}

.toast {
  pointer-events: auto;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
