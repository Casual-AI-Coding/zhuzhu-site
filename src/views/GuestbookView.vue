<template>
  <div class="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8 sm:mb-12">
        <h1 class="font-display text-3xl sm:text-4xl lg:text-5xl text-text-main mb-3 sm:mb-4">
          留言板
        </h1>
        <p class="text-text-secondary text-sm sm:text-lg">
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
        
        <!-- 心情选择 -->
        <div class="flex items-center gap-2 mt-4">
          <span class="text-text-secondary text-sm">心情:</span>
          <div class="flex gap-1.5">
            <button
              v-for="moodItem in moodOptions"
              :key="moodItem.value"
              @click="mood = moodItem.value"
              class="w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all"
              :class="mood === moodItem.value 
                ? 'bg-primary/20 ring-2 ring-primary' 
                : 'hover:bg-primary/10'"
              :title="moodItem.value"
            >
              {{ moodItem.emoji }}
            </button>
          </div>
        </div>
        
        <!-- 发送者 + 发送按钮 -->
        <div class="flex items-center justify-between gap-2 mt-4">
          <!-- 发送者选择器 -->
          <div class="flex sm:inline-flex justify-start bg-card rounded-xl p-1 border border-border">
            <button
              v-for="senderItem in senderOptions"
              :key="senderItem.value"
              @click="sender = senderItem.value"
              class="flex-none flex items-center justify-center gap-0.5 sm:gap-1.5 px-1 py-2 sm:px-3 rounded-lg text-[9px] sm:text-sm transition-all whitespace-nowrap"
              :class="sender === senderItem.value 
                ? 'bg-primary text-white' 
                : 'text-text-secondary hover:text-text-main hover:bg-primary/5'"
            >
              <span class="text-[10px] sm:text-sm">{{ senderItem.emoji }}</span>
              <span>{{ senderItem.label }}</span>
            </button>
          </div>
          <button
            @click="addMessage"
            class="px-4 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r from-primary to-pink-400 text-white rounded-xl font-medium hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 whitespace-nowrap"
            :disabled="!newMessage.trim() || sending"
          >
            <span v-if="sending">发送中...</span>
            <span v-else class="flex items-center gap-1 sm:gap-2">
              {{ moodEmoji[mood] }} 发送
            </span>
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
const mood = ref('开心');
const messages = ref([]);
const loading = ref(true);
const sending = ref(false);

const toast = ref({
  show: false,
  message: '',
  type: 'success',
});

const moodOptions = [
  { value: '开心', emoji: '😊' },
  { value: '感动', emoji: '🥰' },
  { value: '想念', emoji: '😢' },
  { value: '甜蜜', emoji: '🍯' },
  { value: '害羞', emoji: '🫣' },
  { value: '调皮', emoji: '😜' },
];

const senderOptions = [
  { value: '大萝卜', label: '大萝卜', emoji: '🥕' },
  { value: '猪猪', label: '猪猪', emoji: '🐷' },
  { value: '小葡萄', label: '小葡萄', emoji: '🍇' },
];

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
    const result = await addMessageToNotion(newMessage.value, sender.value, mood.value);
    messages.value.unshift(result);
    showToast('留言成功！', 'success');
  } catch (error) {
    console.error('发送失败:', error);
    // 即使失败也显示在本地
    messages.value.unshift({
      id: Date.now(),
      content: newMessage.value,
      sender: sender.value,
      mood: mood.value,
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
