---
id: css-grid
title: 用 CSS Grid，搭一个恰到好处的布局
description: 从两列卡片到响应式页面，记下 Grid 最实用的几个写法，让布局简单一点。
date: 2026-09-18
category: tech
tags:
  - CSS
  - 前端
minutes: 5
cover: grid
sample: true
---

当一个页面需要同时安排多行和多列，CSS Grid 是一个很好用的布局工具。先明确布局关系，再选择最少的规则实现它。

## 从两列卡片开始

`fr` 用来分配网格容器的可用空间。下面的两列等宽，间距由 `gap` 控制。

```
.article-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}
```

`minmax(0, 1fr)` 允许列缩小到零，配合内容换行，可以避免长内容意外撑宽整个网格。

## 主内容与侧栏

把侧栏宽度明确下来，让主内容占据剩余空间。布局关系就能直接体现在 CSS 里。

```
.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  gap: 32px;
}
```

## 让小屏幕回到单列

响应式布局应该跟随内容需要。空间不够时，就把卡片和侧栏放到自然的阅读顺序里。

```
@media (max-width: 760px) {
  .content-grid,
  .article-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

> 好的布局不是塞进更多东西，而是给内容恰当的位置和空间。

完成后，试着在不同宽度下检查长标题、代码块和图片。真实内容往往比空白盒子更能说明布局是否合适。
