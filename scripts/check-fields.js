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

const databases = {
  anniversary: process.env.VITE_NOTION_DATABASE_ANNIVERSARY,
  photos: process.env.VITE_NOTION_DATABASE_PHOTOS,
  timeline: process.env.VITE_NOTION_DATABASE_TIMELINE,
  messages: process.env.VITE_NOTION_DATABASE_MESSAGES,
};

async function checkDatabase(name, id) {
  console.log(`\n📊 ${name} 数据库字段检查:\n`);
  
  try {
    const response = await notion.databases.retrieve({
      database_id: id,
    });
    
    console.log(`数据库名称: ${response.title[0]?.plain_text || name}`);
    console.log('\n字段列表:');
    
    Object.keys(response.properties).forEach(propName => {
      const prop = response.properties[propName];
      console.log(`  - "${propName}" (${prop.type})`);
    });
    
    // 尝试获取一条数据查看实际结构
    console.log('\n尝试获取一条数据...');
    const query = await notion.databases.query({
      database_id: id,
      page_size: 1,
    });
    
    if (query.results.length > 0) {
      const page = query.results[0];
      console.log('\n第一条数据的字段值:');
      Object.keys(page.properties).forEach(propName => {
        const prop = page.properties[propName];
        let value = '';
        
        if (prop.type === 'title') {
          value = prop.title[0]?.plain_text || '';
        } else if (prop.type === 'rich_text') {
          value = prop.rich_text[0]?.plain_text || '';
        } else if (prop.type === 'date') {
          value = prop.date?.start || '';
        } else if (prop.type === 'select') {
          value = prop.select?.name || '';
        } else if (prop.type === 'multi_select') {
          value = prop.multi_select?.map(t => t.name).join(', ') || '';
        } else if (prop.type === 'files') {
          value = prop.files?.length ? `[${prop.files.length} files]` : '[]';
        } else if (prop.type === 'place') {
          value = prop.place?.name || '';
        }
        
        console.log(`  ${propName}: ${value}`);
      });
    } else {
      console.log('  数据库为空，无数据');
    }
    
  } catch (error) {
    console.error(`❌ 错误:`, error.message);
  }
}

async function main() {
  console.log('🔍 检查所有数据库字段...\n');
  
  for (const [name, id] of Object.entries(databases)) {
    if (id) {
      await checkDatabase(name, id);
    } else {
      console.log(`\n⚠️ ${name} 数据库 ID 未配置`);
    }
  }
}

main();
