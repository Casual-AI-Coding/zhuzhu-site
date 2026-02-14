import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const NOTION_DATABASE_ANNIVERSARY = process.env.NOTION_DATABASE_ANNIVERSARY;
  const NOTION_DATABASE_PHOTOS = process.env.NOTION_DATABASE_PHOTOS;
  const NOTION_DATABASE_TIMELINE = process.env.NOTION_DATABASE_TIMELINE;
  const NOTION_DATABASE_MESSAGES = process.env.NOTION_DATABASE_MESSAGES;

  if (!NOTION_API_KEY) {
    return res.status(500).json({ error: 'Missing NOTION_API_KEY' });
  }

  const notion = new Client({ auth: NOTION_API_KEY });

  // 解析路径: /databases/{id}/query
  const pathParts = req.url.split('/').filter(Boolean);
  
  try {
    if (pathParts[0] === 'databases' && pathParts[2] === 'query') {
      const dbId = pathParts[1];
      
      // 验证数据库 ID
      const validIds = [NOTION_DATABASE_ANNIVERSARY, NOTION_DATABASE_PHOTOS, NOTION_DATABASE_TIMELINE, NOTION_DATABASE_MESSAGES];
      if (!validIds.includes(dbId)) {
        return res.status(403).json({ error: 'Invalid database ID' });
      }

      const response = await notion.databases.query({
        database_id: dbId,
        ...req.body,
      });
      
      return res.status(200).json(response);
    }
    
    if (pathParts[0] === 'pages' && req.method === 'POST') {
      const response = await notion.pages.create(req.body);
      return res.status(200).json(response);
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('Notion API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
