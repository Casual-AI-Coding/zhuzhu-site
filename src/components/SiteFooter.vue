<template>
  <footer class="site-footer">
    <div class="footer-content">
      <p class="footer-brand">
        <span class="heart">💕</span>
        zhuzhu © {{ startYear }}-{{ currentYear }}
      </p>
      <p class="footer-made">
        Made with <span class="heart">❤️</span> by 大萝卜 & 小葡萄
      </p>
      <p class="footer-icp" v-if="icp">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
          {{ icp }}
        </a>
      </p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';

const startYear = 2024;
const currentYear = new Date().getFullYear();
const icp = ''; // 填写实际备案号
</script>

<style scoped>
.site-footer {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--color-text-secondary, #888);
  font-size: 0.875rem;
  border-top: 1px solid var(--color-border, rgba(0, 0, 0, 0.1));
  margin-top: auto;
  background: transparent;
}

.footer-content {
  max-width: 600px;
  margin: 0 auto;
}

.footer-brand {
  font-family: var(--font-display, serif);
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: var(--color-text-main, #333);
}

.footer-made {
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.footer-icp {
  font-size: 0.75rem;
  opacity: 0.7;
}

.footer-icp a {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-icp a:hover {
  color: var(--color-primary, #D4A574);
}

.heart {
  display: inline-block;
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { 
    transform: scale(1); 
  }
  50% { 
    transform: scale(1.15); 
  }
}

/* Dark mode support */
:global(.dark) .site-footer {
  border-top-color: rgba(255, 255, 255, 0.1);
}
</style>
