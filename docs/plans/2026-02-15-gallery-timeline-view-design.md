# 相册时间线视图功能设计

## 概述

为相册页面新增时间线视图，支持按日/月/年聚合展示照片，与现有瀑布流视图可切换。

## 需求

1. 新增时间线视图模式，按日期分组展示照片
2. 支持按日/月/年三种聚合级别切换
3. 与瀑布流视图可自由切换
4. 用户偏好持久化存储

## UI 设计

### 工具栏布局

```
┌─────────────────────────────────────────────────────────┐
│                        相册墙                           │
│               记录我们的每一个美好瞬间                  │
│                                                         │
│  [瀑布流] [时间线]               [日] [月] [年]        │
│   ↑ 视图切换                    ↑ 聚合级别（仅时间线）  │
├─────────────────────────────────────────────────────────┤
```

### 时间线视图样式

**按日聚合：**
- 每个日期一行，左侧显示日期标签，右侧横向排列该日照片缩略图
- 日期格式：`2024年1月15日`

**按月聚合：**
- 每个月份一行，左侧显示月份标签，右侧横向排列该月照片缩略图
- 日期格式：`2024年1月`

**按年聚合：**
- 每个年份一行，左侧显示年份标签，右侧横向排列该年照片缩略图
- 日期格式：`2024年`

## 技术方案

### 新增文件

| 文件 | 说明 |
|------|------|
| `src/components/GalleryToolbar.vue` | 工具栏组件（视图切换 + 聚合级别切换） |
| `src/components/TimelineGallery.vue` | 时间线视图组件 |
| `src/composables/useGalleryView.js` | 管理视图状态和偏好的 composable |

### 修改文件

| 文件 | 修改内容 |
|------|----------|
| `src/views/GalleryView.vue` | 整合工具栏和两种视图切换逻辑 |

### 状态管理

```javascript
// useGalleryView.js
const viewMode = ref('masonry') // 'masonry' | 'timeline'
const groupBy = ref('day')      // 'day' | 'month' | 'year'

// 持久化到 localStorage
localStorage.setItem('gallery-view', JSON.stringify({ viewMode, groupBy }))
```

### 数据聚合逻辑

```javascript
// 按日期分组
function groupPhotosByDate(photos, groupBy) {
  const groups = {}
  
  photos.forEach(photo => {
    let key
    const date = new Date(photo.date)
    
    switch (groupBy) {
      case 'day':
        key = formatDate(date, 'yyyy年M月d日')
        break
      case 'month':
        key = formatDate(date, 'yyyy年M月')
        break
      case 'year':
        key = formatDate(date, 'yyyy年')
        break
    }
    
    if (!groups[key]) groups[key] = []
    groups[key].push(photo)
  })
  
  // 按日期倒序排列
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
}
```

## 实现步骤

### 第一阶段：基础架构
1. 创建 `useGalleryView.js` composable
2. 创建 `GalleryToolbar.vue` 组件
3. 修改 `GalleryView.vue` 集成工具栏

### 第二阶段：时间线视图
4. 创建 `TimelineGallery.vue` 组件
5. 实现照片聚合逻辑
6. 实现时间线布局样式

### 第三阶段：完善功能
7. 添加视图切换动画
8. 持久化用户偏好
9. 测试和优化

## 验收标准

- [ ] 瀑布流和时间线视图可正常切换
- [ ] 时间线视图支持日/月/年三种聚合级别
- [ ] 切换聚合级别时照片正确分组
- [ ] 用户偏好刷新页面后保持
- [ ] 移动端适配良好
- [ ] 点击照片可打开 Lightbox

## 风险点

1. **照片数量过多时的性能** - 时间线视图可能一次渲染大量照片，需要考虑虚拟滚动
2. **日期解析兼容性** - Notion 返回的日期格式需要统一处理
