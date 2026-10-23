# 🧡 猪猪网站

[![Netlify Status](https://api.netlify.com/api/v1/badges/2516867d-602d-4e33-ba0d-ac6471e12862/deploy-status)](https://app.netlify.com/projects/zhuzhu-site/deploys)

我们的恋爱记录网站，纪念我们在一起的每一天。

## ✨ 功能特性

### 首页
- 🗓️ 在一起天数计数
- 🎯 下一个百天/周年纪念日倒计时（实时更新）
- 📸 精选照片预览

### 纪念日
- 📅 纪念日列表
- ⏱️ 距离每个纪念日的天数

### 相册
- 🖼️ 照片网格展示
- 🔍 灯箱查看大图（支持缩放）
- ⚡ 图片懒加载

### 时光轴
- 📆 按时间线展示照片
- 🖼️ 照片卡片展示

### 愿望清单
- 📝 愿望管理（与 Notion 同步）
- 📅 日历视图展示
- 🔍 状态/分类筛选
- ✅ 完成日期记录

### 留言板
- 💬 留言功能
- ⌨️ 快捷键支持 (Ctrl + Enter 发送)
- 📝 字符计数
- 📋 长按/右键复制留言
- ✨ 入场动画

### UI/UX
- 🌙 深色主题
- 📱 响应式设计（桌面端 + 移动端）
- 🎨 玻璃拟态风格
- 🦴 骨架屏加载
- ⬆️ 返回顶部按钮
- 📳 触摸反馈（移动端）
- 🔄 下拉刷新（移动端）
- 🌐 PWA 支持

## 🛠️ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **路由**: Vue Router
- **样式**: Tailwind CSS
- **动画**: CSS keyframes + Canvas（无动画库依赖）
- **后端**: Notion API（经服务端函数代理，token 不进前端）
- **部署**: Netlify（主）/ Vercel（兼容，两套代理函数同逻辑）

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3001

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 📝 环境变量

在项目根目录创建 `.env.local` 文件（参考 `.env.example`）：

```env
# 服务端(开发时由 Vite 代理使用; 生产配置在 Netlify/Vercel 后台)
NOTION_TOKEN=your_notion_integration_token

# 前端(仅数据库 ID, 属公开信息)
VITE_NOTION_DATABASE_ANNIVERSARY=xxx
VITE_NOTION_DATABASE_PHOTOS=xxx
VITE_NOTION_DATABASE_TIMELINE=xxx
VITE_NOTION_DATABASE_MESSAGES=xxx
VITE_NOTION_DATABASE_WISHES=xxx
```

## 🔒 安全说明

浏览器端不携带任何 Notion token：生产环境由 `netlify/functions/notion-proxy.cjs`（Netlify）或 `api/proxy.cjs`（Vercel）在服务端注入鉴权，并同时做 endpoint 白名单、Origin 白名单和限流。

**如果 token 曾以 `VITE_NOTION_TOKEN` 形式部署过**（v1.9.0 及之前），它已泄露在前端产物中，必须轮换：

1. Notion → Settings → Connections → 删除旧 integration 并新建，或在其官网重新生成 token；
2. 将新 token 配置到 Netlify（Site settings → Environment variables → `NOTION_TOKEN`）；
3. 新 integration 需重新获得各数据库的访问授权（数据库 → Connections 里添加）；
4. 重新部署。

## 📄 许可

MIT License
