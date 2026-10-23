// 将 5 个 Notion 数据库全量导出为 JSON 备份
// 用法: npm run backup   (需要 .env.local 里有 NOTION_TOKEN 或 VITE_NOTION_TOKEN)
// 输出: backups/YYYY-MM-DDTHH-mm-ss/<库名>.json

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });
dotenv.config({ path: join(__dirname, '..', '.env') });

const TOKEN = process.env.NOTION_TOKEN || process.env.VITE_NOTION_TOKEN;

const DATABASES = {
  anniversaries: process.env.VITE_NOTION_DATABASE_ANNIVERSARY,
  photos: process.env.VITE_NOTION_DATABASE_PHOTOS,
  timeline: process.env.VITE_NOTION_DATABASE_TIMELINE,
  messages: process.env.VITE_NOTION_DATABASE_MESSAGES,
  wishes: process.env.VITE_NOTION_DATABASE_WISHES,
};

async function queryAll(notion, databaseId) {
  let cursor;
  const pages = [];
  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    });
    pages.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);
  return pages;
}

async function main() {
  if (!TOKEN) {
    console.error('缺少 NOTION_TOKEN: 请在 .env.local 中配置 NOTION_TOKEN 或 VITE_NOTION_TOKEN');
    process.exit(1);
  }

  const notion = new Client({ auth: TOKEN });
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
  const outDir = join(__dirname, '..', 'backups', stamp);
  await mkdir(outDir, { recursive: true });

  let total = 0;
  for (const [name, databaseId] of Object.entries(DATABASES)) {
    if (!databaseId) {
      console.warn(`跳过 ${name}: 未配置数据库 ID`);
      continue;
    }
    try {
      const pages = await queryAll(notion, databaseId);
      const file = join(outDir, `${name}.json`);
      await writeFile(file, JSON.stringify({ exportedAt: new Date().toISOString(), count: pages.length, pages }, null, 2), 'utf8');
      total += pages.length;
      console.log(`✔ ${name}: ${pages.length} 条 -> ${file}`);
    } catch (err) {
      console.error(`✘ ${name}: ${err.message}`);
    }
  }

  console.log(`\n备份完成, 共 ${total} 条记录, 目录: ${outDir}`);
}

main().catch((err) => {
  console.error('备份失败:', err.message);
  process.exit(1);
});
