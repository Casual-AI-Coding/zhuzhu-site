import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const notion = new Client({
  auth: process.env.VITE_NOTION_TOKEN,
});

const DATABASE_ID = process.env.VITE_NOTION_DATABASE_TIMELINE;

// 初始化时光轴数据
const timelineEvents = [
  {
    title: '我们在一起了',
    date: '2024-09-19',
    description: '在这一天，我们正式确定了关系，开始了甜蜜的恋爱之旅。从此刻起，我们成为了彼此最重要的人。',
    importance: '高',
    icon: '💕',
  },
  {
    title: '第一次约会',
    date: '2024-09-20',
    description: '去了最喜欢的餐厅，聊了很多很多，感觉时间过得好快。第一次见面时的紧张都变成了开心。',
    importance: '高',
    icon: '🍽️',
  },
  {
    title: '第一次牵手',
    date: '2024-09-25',
    description: '在公园里散步，不知不觉中就牵起了手，那种心动的感觉至今难忘。',
    importance: '中',
    icon: '🤝',
  },
  {
    title: '海边看日落',
    date: '2024-10-15',
    description: '一起看日落，听海浪的声音，牵着手走了很远很远。那一刻觉得时间静止了。',
    importance: '高',
    icon: '🌅',
  },
  {
    title: '第一次看电影',
    date: '2024-10-20',
    description: '看了一部浪漫的爱情电影，在黑暗的电影院里偷偷牵手，心跳加速。',
    importance: '中',
    icon: '🎬',
  },
  {
    title: '100天纪念日',
    date: '2024-12-28',
    description: '庆祝我们在一起的第100天，准备了蛋糕和礼物，许下了很多美好的愿望。',
    importance: '高',
    icon: '🎉',
  },
  {
    title: '跨年倒数',
    date: '2024-12-31',
    description: '一起倒数迎接2025年，在零点的时候互相说新年快乐，希望每年都能一起跨年。',
    importance: '中',
    icon: '🎆',
  },
  {
    title: '第一次旅行',
    date: '2025-01-15',
    description: '计划了很久的旅行终于实现了，一起看风景、吃美食、留下美好回忆。',
    importance: '高',
    icon: '✈️',
  },
];

async function initTimeline() {
  console.log('⏳ 开始初始化时光轴数据...\n');
  
  for (let i = 0; i < timelineEvents.length; i++) {
    const item = timelineEvents[i];
    const id = (i + 1).toString();
    
    try {
      const response = await notion.pages.create({
        parent: { database_id: DATABASE_ID },
        properties: {
          'Id': {
            title: [{ text: { content: id } }],
          },
          '事件': {
            rich_text: [{ text: { content: item.title } }],
          },
          '日期': {
            date: { start: item.date },
          },
          '描述': {
            rich_text: [{ text: { content: item.description } }],
          },
          '重要度': {
            select: { name: item.importance },
          },
          '图标': {
            rich_text: [{ text: { content: item.icon } }],
          },
        },
      });
      
      console.log(`✅ 已创建 [ID:${id}]: ${item.icon} ${item.title} (${item.date})`);
    } catch (error) {
      console.error(`❌ 创建失败 [ID:${id}]: ${item.title}`, error.message);
    }
  }
  
  console.log('\n🎉 时光轴初始化完成！');
}

async function checkDatabase() {
  try {
    const response = await notion.databases.retrieve({
      database_id: DATABASE_ID,
    });
    console.log(`✅ 成功连接到数据库: ${response.title[0]?.plain_text || 'Timeline'}`);
    
    // 打印所有字段名
    console.log('\n📋 数据库字段列表:');
    Object.keys(response.properties).forEach(propName => {
      const prop = response.properties[propName];
      console.log(`  - ${propName} (${prop.type})`);
    });
    console.log('');
    
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

async function main() {
  console.log('💕 zhuzhu Site - 时光轴数据初始化\n');
  
  if (!process.env.VITE_NOTION_TOKEN || !DATABASE_ID) {
    console.error('❌ 错误: 缺少必要的环境变量');
    return;
  }
  
  const connected = await checkDatabase();
  if (!connected) return;
  
  await initTimeline();
}

main();
