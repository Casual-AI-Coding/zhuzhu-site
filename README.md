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
- **动画**: VueUse Motion, GSAP
- **后端**: Notion API
- **部署**: Vercel

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

在项目根目录创建 `.env.local` 文件：

```env
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_IDS={"anniversaries":"xxx","photos":"xxx","timeline":"xxx","messages":"xxx"}
```

## 📄 许可

MIT License
