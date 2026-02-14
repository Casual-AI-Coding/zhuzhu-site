<template>
  <div class="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="font-display text-4xl sm:text-5xl text-text-main mb-4">
          留言板
        </h1>
        <p class="text-text-secondary text-lg">
          写下想对对方说的话
        </p>
      </div>
      
      <!-- Message Input -->
      <div class="glass-nav rounded-2xl p-6 mb-8">
        <!-- Toast 提示 -->
        <Transition name="fade">
          <div v-if="toast.show" 
            class="fixed top-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg z-50"
            :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'"
          >
            <p class="text-white font-medium">{{ toast.message }}</p>
          </div>
        </Transition>
        
        <textarea
          v-model="newMessage"
          placeholder="写下你的留言..."
          class="w-full bg-transparent border border-border rounded-xl p-4 text-text-main placeholder-text-secondary resize-none focus:outline-none focus:border-primary transition-colors"
          rows="3"
        ></textarea>
        <div class="flex items-center justify-between mt-4">
          <select
            v-model="sender"
            class="bg-card border border-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-primary"
          >
            <option value="大萝卜">大萝卜</option>
            <option value="猪猪">猪猪</option>
            <option value="小葡萄">小葡萄</option>
          </select>
          <button
            @click="addMessage"
            class="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 active:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!newMessage.trim() || sending"
          >
            {{ sending ? '发送中...' : '发送' }}
          </button>
        </div>
      </div>
      
      <!-- Loading -->
      <div v-if="loading" class="text-center text-text-secondary">
        加载中...
      </div>
      
      <!-- Empty State -->
      <div v-else-if="messages.length === 0" class="text-center text-text-secondary">
        暂无留言
      </div>
      
      <!-- Messages Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="message in messages"
          :key="message.id"
          class="glass-nav rounded-2xl p-6 card-hover"
        >
          <div class="flex items-start gap-3 mb-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              :class="senderColors[message.sender]"
            >
              {{ senderEmojis[message.sender] || '👤' }}
            </div>
            <div>
              <p class="font-medium text-text-main">{{ message.sender }}</p>
              <p class="text-text-secondary text-sm">{{ formatDate(message.time) }}</p>
            </div>
          </div>
          <p class="text-text-main">{{ message.content }}</p>
          <div class="mt-3 flex items-center gap-2">
            <span class="text-2xl">{{ moodEmoji[message.mood] || '😊' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchMessages, addMessage as addMessageToNotion } from '@/lib/notion.js';
import { useDaysCount } from '@/composables/useDaysCount.js';

const { formatDate } = useDaysCount();

const newMessage = ref('');
const sender = ref('猪猪');
const messages = ref([]);
const loading = ref(true);
const sending = ref(false);

const toast = ref({
  show: false,
  message: '',
  type: 'success',
});

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
}

const senderEmojis = {
  '大萝卜': '🥕',
  '猪猪': '🐷',
  '小葡萄': '🍇',
};

const senderColors = {
  '大萝卜': 'bg-orange-100',
  '猪猪': 'bg-pink-100',
  '小葡萄': 'bg-purple-100',
};

const moodEmoji = {
  '开心': '😊',
  '感动': '🥰',
  '想念': '😢',
  '甜蜜': '🍯',
};

onMounted(async () => {
  messages.value = await fetchMessages();
  loading.value = false;
});

async function addMessage() {
  if (!newMessage.value.trim() || sending.value) return;
  
  sending.value = true;
  
  try {
    const result = await addMessageToNotion(newMessage.value, sender.value, '开心');
    messages.value.unshift(result);
    showToast('留言成功！', 'success');
  } catch (error) {
    console.error('发送失败:', error);
    // 即使失败也显示在本地
    messages.value.unshift({
      id: Date.now(),
      content: newMessage.value,
      sender: sender.value,
      mood: '开心',
      time: new Date().toISOString(),
    });
    showToast('发送失败，已保存到本地', 'error');
  }
  
  newMessage.value = '';
  sending.value = false;
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
