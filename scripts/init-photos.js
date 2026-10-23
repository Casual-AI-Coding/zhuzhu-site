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

const DATABASE_ID = process.env.VITE_NOTION_DATABASE_PHOTOS;

// 初始化照片数据（使用示例图片URL）
const photos = [
  {
    title: '第一次约会',
    url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&h=800&fit=crop',
    date: '2024-09-20',
    place: 'Hangzhou, China',
    tags: ['约会', '餐厅'],
    description: '去了最喜欢的餐厅，聊了很多很多，感觉时间过得好快。',
  },
  {
    title: '一起看电影',
    url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&h=600&fit=crop',
    date: '2024-10-05',
    place: 'Hangzhou, China',
    tags: ['电影', '约会'],
    description: '看了一部浪漫的爱情电影，牵手的感觉真好。',
  },
  {
    title: '海边散步',
    url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&h=1000&fit=crop',
    date: '2024-10-15',
    place: 'Hangzhou, China',
    tags: ['旅行', '海边'],
    description: '一起看日落，听海浪的声音，牵着手走了很远很远。',
  },
  {
    title: '公园野餐',
    url: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=800&h=600&fit=crop',
    date: '2024-11-02',
    place: 'Hangzhou, China',
    tags: ['户外', '美食'],
    description: '准备了好多好吃的，在阳光下度过了美好的下午。',
  },
  {
    title: '庆祝100天',
    url: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800&h=1000&fit=crop',
    date: '2024-12-28',
    place: 'Hangzhou, China',
    tags: ['纪念日', '庆祝'],
    description: '100天快乐！准备了蛋糕和礼物，许下了美好的愿望。',
  },
  {
    title: '逛街购物',
    url: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=800&h=600&fit=crop',
    date: '2025-01-10',
    place: 'Hangzhou, China',
    tags: ['购物', '日常'],
    description: '一起逛街，买了好多东西，你帮我挑的衣服很好看。',
  },
];

async function initPhotos() {
  console.log('📸 开始初始化照片数据...\n');
  
  for (let i = 0; i < photos.length; i++) {
    const item = photos[i];
    const id = (i + 1).toString();
    
    try {
      const response = await notion.pages.create({
        parent: { database_id: DATABASE_ID },
        properties: {
          'Id': {
            title: [{ text: { content: id } }],
          },
          '标题': {
            rich_text: [{ text: { content: item.title } }],
          },
          '图片': {
            files: [
              {
                type: 'external',
                name: item.title,
                external: {
                  url: item.url,
                },
              },
            ],
          },
          '日期': {
            date: { start: item.date },
          },
          '地点': {
            place: {
              lat: 30.27241,
              lon: 120.20593,
              name: item.place || 'Hangzhou, China',
              address: 'Hangzhou, China',
            },
          },
          '标签': {
            multi_select: item.tags.map(tag => ({ name: tag })),
          },
          '描述': {
            rich_text: [{ text: { content: item.description } }],
          },
        },
      });
      
      console.log(`✅ 已创建 [ID:${id}]: ${item.title} (${item.date})`);
    } catch (error) {
      console.error(`❌ 创建失败 [ID:${id}]: ${item.title}`, error.message);
    }
  }
  
  console.log('\n🎉 照片初始化完成！');
}

async function checkDatabase() {
  try {
    const response = await notion.databases.retrieve({
      database_id: DATABASE_ID,
    });
    console.log(`✅ 成功连接到数据库: ${response.title[0]?.plain_text || 'Photos'}`);
    
    // 打印所有字段名
    console.log('\n📋 数据库字段列表:');
    Object.keys(response.properties).forEach(propName => {
      const prop = response.properties[propName];
      console.log(`  - "${propName}" (${prop.type})`);
    });
    console.log('');
    
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

async function main() {
  console.log('💕 zhuzhu Site - 照片数据初始化\n');
  
  if (!process.env.VITE_NOTION_TOKEN || !DATABASE_ID) {
    console.error('❌ 错误: 缺少必要的环境变量');
    return;
  }
  
  const connected = await checkDatabase();
  if (!connected) return;
  
  await initPhotos();
}

main();
