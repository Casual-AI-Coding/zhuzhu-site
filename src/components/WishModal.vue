<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="handleClose"
        />

        <!-- Modal Content -->
        <div
          class="modal-content relative w-full sm:max-w-md sm:mx-4 bg-card rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-hidden flex flex-col"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-border">
            <h2 class="text-lg font-medium text-text-main">
              {{ isEditing ? '编辑愿望' : '添加愿望' }}
            </h2>
            <button
              @click="handleClose"
              class="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-primary/10 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <!-- Title -->
            <div>
              <label class="block text-sm text-text-secondary mb-1.5">
                标题 <span class="text-red-400">*</span>
              </label>
              <input
                v-model="form.title"
                type="text"
                placeholder="想完成什么愿望？"
                class="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-main placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm text-text-secondary mb-1.5">
                描述
              </label>
              <textarea
                v-model="form.description"
                placeholder="详细描述一下..."
                rows="3"
                class="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-main placeholder-text-secondary resize-none focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <!-- Category & Priority Row -->
            <div class="grid grid-cols-2 gap-3">
              <!-- Category -->
              <div>
                <label class="block text-sm text-text-secondary mb-1.5">
                  分类
                </label>
                <select
                  v-model="form.category"
                  class="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-main focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                >
                  <option value="旅行">✈️ 旅行</option>
                  <option value="美食">🍽️ 美食</option>
                  <option value="体验">🎯 体验</option>
                  <option value="家居">🏠 家居</option>
                  <option value="其他">✨ 其他</option>
                </select>
              </div>

              <!-- Priority -->
              <div>
                <label class="block text-sm text-text-secondary mb-1.5">
                  优先级
                </label>
                <select
                  v-model="form.priority"
                  class="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-main focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                >
                  <option value="高">🔴 高</option>
                  <option value="中">🟡 中</option>
                  <option value="低">⚪ 低</option>
                </select>
              </div>
            </div>

            <!-- Target Date -->
            <div>
              <label class="block text-sm text-text-secondary mb-1.5">
                目标日期
              </label>
              <input
                v-model="form.targetDate"
                type="date"
                class="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-main focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <!-- Footer -->
          <div class="p-4 border-t border-border flex gap-3">
            <button
              @click="handleClose"
              class="flex-1 py-2.5 bg-background border border-border rounded-xl text-text-secondary font-medium hover:bg-card transition-colors"
            >
              取消
            </button>
            <button
              @click="handleSubmit"
              :disabled="!form.title.trim() || submitting"
              class="flex-1 py-2.5 bg-gradient-to-r from-primary to-pink-400 text-white rounded-xl font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  wish: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'submit']);

const form = ref({
  title: '',
  description: '',
  category: '其他',
  priority: '中',
  targetDate: '',
});

const submitting = ref(false);

const isEditing = computed(() => !!props.wish);

// Reset form when modal opens
watch(() => props.show, (show) => {
  if (show) {
    if (props.wish) {
      form.value = {
        title: props.wish.title || '',
        description: props.wish.description || '',
        category: props.wish.category || '其他',
        priority: props.wish.priority || '中',
        targetDate: props.wish.targetDate || '',
      };
    } else {
      form.value = {
        title: '',
        description: '',
        category: '其他',
        priority: '中',
        targetDate: '',
      };
    }
  }
});

function handleClose() {
  emit('close');
}

async function handleSubmit() {
  if (!form.value.title.trim() || submitting.value) return;

  submitting.value = true;
  emit('submit', { ...form.value });
  submitting.value = false;
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .modal-enter-from .modal-content,
  .modal-leave-to .modal-content {
    transform: scale(0.95);
  }
}

/* Custom select arrow */
select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  padding-right: 2.5rem;
}
</style>