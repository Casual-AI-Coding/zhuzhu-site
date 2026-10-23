/**
 * 添加测试愿望数据到 Notion
 * 运行方式: node scripts/seed-wishes.js
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// 加载 .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const NOTION_TOKEN = process.env.VITE_NOTION_TOKEN;
const DATABASE_ID = process.env.VITE_NOTION_DATABASE_WISHES;

if (!NOTION_TOKEN || !DATABASE_ID) {
  console.error('❌ 请确保 .env.local 中配置了 VITE_NOTION_TOKEN 和 VITE_NOTION_DATABASE_WISHES');
  process.exit(1);
}

const API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

async function notionRequest(endpoint, body) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}

// 测试数据
const testWishes = [
  // 进行中的愿望
  {
    title: '一起去日本旅行',
    description: '樱花季去京都看樱花，打卡伏见稻荷大社',
    category: '旅行',
    targetDate: '2025-04-15',
    priority: '高',
    status: 'In progress',
  },
  {
    title: '学做一道新菜',
    description: '一起学做红烧肉或者糖醋排骨',
    category: '美食',
    targetDate: '2025-06-20',
    priority: '中',
    status: 'In progress',
  },
  {
    title: '看一次日出',
    description: '去海边或者山顶，带上早餐和咖啡',
    category: '体验',
    targetDate: null,
    priority: '低',
    status: 'In progress',
  },
  {
    title: '换一套新床品',
    description: '选一套舒服的四件套，换个心情',
    category: '家居',
    targetDate: '2025-03-10',
    priority: '中',
    status: 'In progress',
  },
  {
    title: '一起学一支舞',
    description: '在家里跟着视频学，录下来留念',
    category: '体验',
    targetDate: null,
    priority: '中',
    status: 'In progress',
  },
  // 已完成的愿望
  {
    title: '第一次旅行',
    description: '我们的第一次旅行，去了杭州西湖',
    category: '旅行',
    targetDate: null,
    priority: '高',
    status: 'Done',
    completedDate: '2024-08-15',
  },
  {
    title: '一起看电影',
    description: '周末窝在沙发上看了一整天电影',
    category: '体验',
    targetDate: null,
    priority: '低',
    status: 'Done',
    completedDate: '2024-12-20',
  },
  {
    title: '尝试新餐厅',
    description: '发现了一家超好吃的火锅店',
    category: '美食',
    targetDate: null,
    priority: '中',
    status: 'Done',
    completedDate: '2025-01-10',
  },
];

async function addWish(wish, index) {
  const properties = {
    'Id': {
      title: [{ text: { content: (index + 1).toString() } }],
    },
    '标题': {
      rich_text: [{ text: { content: wish.title } }],
    },
    '描述': {
      rich_text: [{ text: { content: wish.description } }],
    },
    '分类': {
      select: { name: wish.category },
    },
    '优先级': {
      select: { name: wish.priority },
    },
    '状态': {
      status: { name: wish.status },
    },
  };

  if (wish.targetDate) {
    properties['目标日期'] = {
      date: { start: wish.targetDate },
    };
  }

  if (wish.completedDate) {
    properties['完成日期'] = {
      date: { start: wish.completedDate },
    };
  }

  return notionRequest('/pages', {
    parent: { database_id: DATABASE_ID },
    properties,
  });
}

async function main() {
  console.log('🚀 开始添加测试数据...\n');

  for (let i = 0; i < testWishes.length; i++) {
    const wish = testWishes[i];
    try {
      await addWish(wish, i);
      console.log(`✅ 已添加: ${wish.title}`);
    } catch (error) {
      console.error(`❌ 添加失败 "${wish.title}": ${error.message}`);
    }
  }

  console.log('\n✨ 完成！请刷新页面查看数据');
}

main();