import { ref } from 'vue';

export function useRipple() {
  const ripples = ref([]);
  let rippleId = 0;

  function createRipple(event, container) {
    const rect = container.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = {
      id: rippleId++,
      x,
      y,
      size,
    };

    ripples.value.push(ripple);

    // 600ms 后移除
    setTimeout(() => {
      const index = ripples.value.findIndex(r => r.id === ripple.id);
      if (index > -1) {
        ripples.value.splice(index, 1);
      }
    }, 600);
  }

  return {
    ripples,
    createRipple,
  };
}
