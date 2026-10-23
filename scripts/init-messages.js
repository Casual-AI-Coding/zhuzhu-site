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

const DATABASE_ID = process.env.VITE_NOTION_DATABASE_MESSAGES;

// 初始化留言数据
const messages = [
  {
    content: '今天是我们在一起的第100天，好开心！时间过得真快，每一天都很珍惜。',
    sender: 'zhuzhu',
    mood: '开心',
    time: '2024-12-28',
  },
  {
    content: '每次看到你笑，我的心都融化了～希望你能一直这么开心。',
    sender: '对方',
    mood: '甜蜜',
    time: '2024-12-26',
  },
  {
    content: '圣诞快乐！爱你哟～这是我们一起过的第一个圣诞节，以后还要过很多个。',
    sender: 'zhuzhu',
    mood: '甜蜜',
    time: '2024-12-25',
  },
  {
    content: '想你了，期待下次见面！每次分开都觉得时间过得好慢。',
    sender: '对方',
    mood: '想念',
    time: '2024-12-24',
  },
  {
    content: '今天吃到了很好吃的蛋糕，下次带你一起来吃！',
    sender: 'zhuzhu',
    mood: '开心',
    time: '2024-12-20',
  },
  {
    content: '谢谢你一直以来的包容和陪伴，有你在身边真好。',
    sender: '对方',
    mood: '感动',
    time: '2024-12-15',
  },
  {
    content: '刚刚看到一句话："最好的爱情就是两个人一起变得更好"。我觉得我们就是。',
    sender: 'zhuzhu',
    mood: '甜蜜',
    time: '2024-12-10',
  },
  {
    content: '今天工作好累，但是想到你就觉得一切都值得了。',
    sender: '对方',
    mood: '想念',
    time: '2024-12-05',
  },
];

async function initMessages() {
  console.log('💌 开始初始化留言数据...\n');
  
  for (let i = 0; i < messages.length; i++) {
    const item = messages[i];
    const id = (i + 1).toString();
    
    try {
      const response = await notion.pages.create({
        parent: { database_id: DATABASE_ID },
        properties: {
          'Id': {
            title: [{ text: { content: id } }],
          },
          '内容': {
            rich_text: [{ text: { content: item.content } }],
          },
          '发送者': {
            select: { name: item.sender },
          },
          '心情': {
            select: { name: item.mood },
          },
          '时间': {
            date: { start: item.time },
          },
        },
      });
      
      console.log(`✅ 已创建 [ID:${id}]: [${item.mood}] ${item.content.substring(0, 20)}...`);
    } catch (error) {
      console.error(`❌ 创建失败 [ID:${id}]`, error.message);
    }
  }
  
  console.log('\n🎉 留言初始化完成！');
}

async function checkDatabase() {
  try {
    const response = await notion.databases.retrieve({
      database_id: DATABASE_ID,
    });
    console.log(`✅ 成功连接到数据库: ${response.title[0]?.plain_text || 'Messages'}\n`);
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

async function main() {
  console.log('💕 zhuzhu Site - 留言数据初始化\n');
  
  if (!process.env.VITE_NOTION_TOKEN || !DATABASE_ID) {
    console.error('❌ 错误: 缺少必要的环境变量');
    return;
  }
  
  const connected = await checkDatabase();
  if (!connected) return;
  
  await initMessages();
}

main();
