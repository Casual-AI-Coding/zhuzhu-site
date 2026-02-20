import { ref, readonly } from 'vue';

const toasts = ref([]);
let id = 0;

export function useToast() {
  function show(message, type = 'info', duration = 3000) {
    const toast = {
      id: ++id,
      message,
      type,
    };
    
    toasts.value.push(toast);
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        remove(toast.id);
      }, duration);
    }
    
    return toast.id;
  }
  
  function success(message, duration = 3000) {
    return show(message, 'success', duration);
  }
  
  function error(message, duration = 4000) {
    return show(message, 'error', duration);
  }
  
  function info(message, duration = 3000) {
    return show(message, 'info', duration);
  }
  
  function warning(message, duration = 3500) {
    return show(message, 'warning', duration);
  }
  
  function remove(id) {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  }
  
  return {
    toasts: readonly(toasts),
    show,
    success,
    error,
    info,
    warning,
    remove,
  };
}
