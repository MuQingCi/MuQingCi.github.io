# MuQingCi 的个人博客

使用原生 HTML、CSS、JavaScript 搭建的静态个人博客，无构建步骤、无第三方运行依赖，适用于 GitHub Pages。

计划发布地址：<https://muqingci.github.io/>（完成推送和 Pages 配置后生效）

仓库地址：<https://github.com/MuQingCi/MuQingCi.github.io>

## 已实现

- 响应式首页、精选文章与文章卡片。
- 技术笔记、生活随笔、阅读记录分类筛选。
- 文章详情、按年份归档、标签筛选与相关文章。
- 标题、标签、摘要、正文关键词搜索，支持 `Ctrl + K` / `⌘ + K` 和 `Esc`。
- 可记住偏好的浅色 / 深色主题。
- 手机导航、键盘访问、复制文章链接。
- 原创本地 SVG 插画，不依赖外部字体、图片或 API。

## 本地预览

直接用浏览器打开 `index.html` 即可。也可在当前目录运行静态服务器：

```powershell
npx --yes serve .
```

该预览命令需要网络下载 `serve`；网站本身没有安装或编译依赖。

## 发布到 GitHub Pages

当前工作区的 `origin` 已设置为 `https://github.com/MuQingCi/MuQingCi.github.io.git`，默认分支为 `main`。

确认内容后，在项目目录执行：

```powershell
git add .
git commit -m "Create personal blog"
git push -u origin main
```

然后在仓库 **Settings → Pages → Build and deployment** 中：

1. 将 Source 设为 **Deploy from a branch**。
2. 选择 **main** 分支和 **/ (root)** 目录，保存。
3. 等待 GitHub Pages 完成部署后访问 <https://muqingci.github.io/>。

`.nojekyll` 用于让 GitHub Pages 直接发布静态文件。所有站内页面采用 hash 路由，例如 `/#article/css-grid`，刷新文章页无需额外配置服务端路由。

发布方式参考 [GitHub Pages 官方指南](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

## 写自己的文章

`posts.js` 内的 7 篇文章都是明确标注的建站示例，不是从 GitHub 抓取的历史文章。发布前可替换或删除示例。

向 `window.BLOG_POSTS` 数组加入一项：

```javascript
{
  id: "my-first-note", // 唯一 ID；建议使用英文小写字母、数字和连字符
  title: "我的文章标题",
  description: "用于文章卡片和搜索的简短摘要。",
  date: "2026-09-28", // YYYY-MM-DD
  category: "tech", // tech、life、reading 三选一
  tags: ["JavaScript", "前端"],
  minutes: 5, // 预计阅读分钟数
  cover: "code", // code、garden、git、books、grid、journal、mountains
  sample: false,
  content: `<p>正文第一段。</p><h2>小标题</h2><p>后续内容。</p>`
}
```

`content` 是由你维护的可信 HTML，不要直接放入未经处理的外部用户输入。代码示例中的 `<`、`>`、`&` 应分别写为 `&lt;`、`&gt;`、`&amp;`。

文章列表、归档、标签数量和相关文章会自动更新。首页精选卡片的标题、日期、阅读时长及链接目前在 `index.html` 中固定；替换精选文章时同步修改该卡片和对应文章，并为该文章保留 `featured: true`。

## 个性化修改

- **站名、个人介绍、精选卡片与随记：** `index.html`。
- **文章内容和标签：** `posts.js`。
- **配色、布局和响应式断点：** `styles.css`，配色变量位于文件开头。
- **导航、筛选、搜索和主题交互：** `app.js`。
- **头像、山峦和植物插画：** `assets/`。

「沐清辞」是依据 GitHub 用户名设置的展示名称，可在 `index.html` 中调整。这个博客使用静态本地文章数据，不包含后台编辑、账号登录或评论服务。

## 目录

```text
index.html
styles.css
posts.js
app.js
assets/
  favicon.svg
  avatar.svg
  mountains.svg
  about-garden.svg
.nojekyll
.gitignore
README.md
```
