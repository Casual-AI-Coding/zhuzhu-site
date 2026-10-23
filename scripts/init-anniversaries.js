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

const DATABASE_ID = process.env.VITE_NOTION_DATABASE_ANNIVERSARY;

// 初始化纪念日数据
const anniversaries = [
  {
    name: '100天纪念日',
    date: '2024-12-28',
    type: '100天',
    description: '我们在一起100天啦！时间过得好快，每一天都很开心。',
  },
  {
    name: '200天纪念日',
    date: '2025-04-07',
    type: '100天',
    description: '200天了，感情越来越深，期待更多个100天。',
  },
  {
    name: '一周年纪念日',
    date: '2025-09-19',
    type: '周年',
    description: '整整一年！感谢这一年有你的陪伴，爱你。',
  },
  {
    name: '情人节',
    date: '2025-02-14',
    type: '节日',
    description: '第一个一起过的情人节，要给你一个惊喜！',
  },
  {
    name: '520纪念日',
    date: '2025-05-20',
    type: '节日',
    description: '520，我爱你。简单的数字，深深的爱意。',
  },
  {
    name: '七夕情人节',
    date: '2025-08-29',
    type: '节日',
    description: '中国的情人节，牛郎织女相会的日子，我们也要甜蜜度过。',
  },
];

async function initAnniversaries() {
  console.log('🚀 开始初始化纪念日数据...\n');
  
  for (let i = 0; i < anniversaries.length; i++) {
    const item = anniversaries[i];
    const id = (i + 1).toString();
    
    try {
      const response = await notion.pages.create({
        parent: { database_id: DATABASE_ID },
        properties: {
          'Id': {
            title: [{ text: { content: id } }],
          },
          '名称': {
            rich_text: [{ text: { content: item.name } }],
          },
          '日期': {
            date: { start: item.date },
          },
          '类型': {
            select: { name: item.type },
          },
          '描述': {
            rich_text: [{ text: { content: item.description } }],
          },
        },
      });
      
      console.log(`✅ 已创建 [ID:${id}]: ${item.name} (${item.date})`);
    } catch (error) {
      console.error(`❌ 创建失败 [ID:${id}]: ${item.name}`, error.message);
    }
  }
  
  console.log('\n🎉 初始化完成！');
}

// 检查数据库连接
async function checkDatabase() {
  try {
    const response = await notion.databases.retrieve({
      database_id: DATABASE_ID,
    });
    console.log(`✅ 成功连接到数据库: ${response.title[0]?.plain_text || 'Anniversary'}\n`);
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.log('\n请检查:');
    console.log('1. Token 是否正确');
    console.log('2. 数据库 ID 是否正确');
    console.log('3. Integration 是否有权限访问该数据库');
    return false;
  }
}

async function main() {
  console.log('💕 zhuzhu Site - 纪念日数据初始化\n');
  
  if (!process.env.VITE_NOTION_TOKEN) {
    console.error('❌ 错误: 未找到 VITE_NOTION_TOKEN');
    console.log('请确保 .env.local 文件中包含 Token');
    return;
  }
  
  if (!DATABASE_ID) {
    console.error('❌ 错误: 未找到 VITE_NOTION_DATABASE_ANNIVERSARY');
    return;
  }
  
  const connected = await checkDatabase();
  if (!connected) return;
  
  await initAnniversaries();
}

main();
