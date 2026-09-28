// 所有文章均为建站示例。发布个人内容时，修改此数组并将 sample 设为 false。
// content 是作者维护的 HTML，请勿在这里直接拼接不可信的用户输入。
window.BLOG_POSTS = [
  {
    id: "a-quiet-corner",
    title: "写在开始：给思考一个安静的角落",
    description: "从一篇文章开始，让零散的想法在这里生根发芽。关于这个博客，也关于记录的意义。",
    date: "2026-09-28",
    category: "life",
    tags: ["博客", "生活"],
    minutes: 4,
    cover: "mountains",
    featured: true,
    sample: true,
    content: `<p>我们每天都会遇见很多东西：一个终于解决的问题，一段让人停留的文字，一次走在路上突然出现的想法。它们往往很小，小到如果不记下来，过几天就忘了。</p>
      <p>于是，有了这个安静的角落。不需要复杂的开场，也不需要一个完美的计划。先写下一句话，就已经开始了。</p>
      <h2>为什么还要写博客？</h2>
      <p>笔记可以帮助我们记住答案，写作则让我们重新理解问题。把一件事讲清楚的时候，我们也在梳理自己的思考。</p>
      <p>这里像一座数字花园。有些文章是刚刚种下的种子，有些是正在生长的枝叶。随着新的经历和理解，它们也可以不断更新。</p>
      <blockquote><p>记录不是为了证明自己走得多快，而是为了看见自己走过的路。</p></blockquote>
      <h2>这个角落会收藏什么</h2>
      <ul><li><strong>技术笔记：</strong>学习中遇到的问题，实践中的解法，以及值得留下的思路。</li><li><strong>生活随笔：</strong>小小的观察、普通的日常，还有那些想认真对待的瞬间。</li><li><strong>阅读记录：</strong>书页里遇到的启发，以及它们如何改变自己的理解。</li></ul>
      <h2>从小处开始</h2>
      <p>给写作留一点空间。今天写一个段落，明天补充一个例子，过一阵子再回来看看。文章可以慢慢变好，人也一样。</p>
      <p>如果你也在寻找一个记录的地方，愿这里能带来一点启发。欢迎来到这座刚开始生长的花园。</p>`
  },
  {
    id: "javascript-async",
    title: "理解 JavaScript 异步：从 Promise 到 async/await",
    description: "把异步代码写得更清楚，从一个小例子理解 Promise 与 async/await 之间的关系。",
    date: "2026-09-26",
    category: "tech",
    tags: ["JavaScript", "前端"],
    minutes: 6,
    cover: "code",
    sample: true,
    content: `<p>读取数据时，结果通常不会立刻出现。Promise 用来表示一个异步操作的最终结果，而 async/await 让等待结果的过程更容易阅读。</p>
      <h2>先认识 Promise</h2>
      <p>一个 Promise 可以处于等待、成功或失败的状态。我们通过 <code>then</code> 处理成功结果，通过 <code>catch</code> 处理错误。</p>
      <pre><code>const wait = (milliseconds) =&gt; new Promise((resolve) =&gt; {
  setTimeout(resolve, milliseconds);
});

wait(500).then(() =&gt; {
  console.log("Ready to grow.");
});</code></pre>
      <h2>用 async/await 组织流程</h2>
      <p><code>async</code> 函数会返回 Promise。<code>await</code> 等待一个 Promise 的结果，让后续代码按我们阅读的顺序展开。</p>
      <pre><code>async function loadPost(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to load post");
  }
  return response.json();
}

async function showPost() {
  try {
    const post = await loadPost("/post.json");
    console.log(post.title);
  } catch (error) {
    console.error(error.message);
  }
}</code></pre>
      <h2>独立任务可以一起等待</h2>
      <p>如果两个操作互不依赖，可以先同时发起，再通过 <code>Promise.all</code> 等待它们都完成。需要留意：任意一个 Promise 失败，Promise.all 就会拒绝。</p>
      <pre><code>const [posts, profile] = await Promise.all([
  loadPost("/posts.json"),
  loadPost("/profile.json")
]);</code></pre>
      <blockquote><p>好的异步代码，不只是得到结果，也让依赖关系和失败路径一眼可见。</p></blockquote>
      <p>练习时，不妨先写一个简单的 Promise，再用 async/await 改写同一个流程，比较两种写法的阅读体验。</p>`
  },
  {
    id: "ordinary-days",
    title: "把日子过慢一点，发现平凡里的微光",
    description: "一杯热茶，一段散步的路。那些看似平凡的小事，原来也值得被认真收藏。",
    date: "2026-09-24",
    category: "life",
    tags: ["生活", "随笔"],
    minutes: 3,
    cover: "garden",
    sample: true,
    content: `<p>这是一篇生活随笔示例，写给那些忙碌之后，想稍微停一停的时刻。</p>
      <p>有时候，一天结束了，才发现自己记不起发生过什么。消息一条接一条，事情一件接一件，生活像一个不断刷新的列表。</p>
      <h2>给日常留一点空白</h2>
      <p>空白不一定是很长的假期。它可以是喝水的时候不看屏幕，是走路的时候抬头看一眼树，也是做完一件事之后，允许自己休息几分钟。</p>
      <p>慢一点，才容易发现：窗边的光每天都不同，熟悉的路边开了新的花，认真吃完的一顿饭会让人心情很好。</p>
      <h2>记录三个小瞬间</h2>
      <p>试着在一天结束时，记下三件小事。没有标准答案，也不用把它们写成一个漂亮的故事。</p>
      <ul><li>今天注意到了什么？</li><li>哪一刻让自己感觉轻松？</li><li>有什么想留给明天的自己？</li></ul>
      <blockquote><p>日常的意义，常常藏在我们愿意留意的地方。</p></blockquote>
      <p>允许普通的一天只是普通的一天。把自己的节奏找回来，然后，慢慢向前。</p>`
  },
  {
    id: "git-workflow",
    title: "让 Git 成为习惯：一个简单的日常工作流",
    description: "从查看改动到清晰提交，用几个常用命令，让每一次修改都有迹可循。",
    date: "2026-09-22",
    category: "tech",
    tags: ["Git", "工具"],
    minutes: 5,
    cover: "git",
    sample: true,
    content: `<p>Git 的命令很多，日常开发却往往只需要一套清晰的小流程。它的目的很简单：知道自己改了什么，让每次提交表达一个完整的想法。</p>
      <h2>修改前，先了解工作区</h2>
      <p>开始工作时，先看当前分支和已有修改。不要默认工作区里的所有变更都属于这次任务。</p>
      <pre><code>git status --short --branch
git diff</code></pre>
      <h2>按目的组织一次提交</h2>
      <p>把同一个目的的修改放在一起。比如修复搜索问题，就只提交搜索相关的文件。暂存后，再检查一次即将提交的内容。</p>
      <pre><code>git add app.js
git diff --staged
git commit -m "Fix article search"</code></pre>
      <p>提交信息不需要复杂，但应该能回答：这次修改做了什么？</p>
      <h2>在推送前确认目标</h2>
      <p>检查远程地址和当前分支，再把修改推送到正确的位置。第一次推送某个分支时，可以设置它的上游。</p>
      <pre><code>git remote -v
git status --short --branch
git push -u origin main</code></pre>
      <blockquote><p>一次清晰的提交，是留给未来自己的说明书。</p></blockquote>
      <p>先让这些基本动作成为习惯。等到需要更复杂的协作流程时，再逐步增加新的工具和命令。</p>`
  },
  {
    id: "reading-and-focus",
    title: "在信息洪流里，重新找回专注",
    description: "关于阅读的一点思考：少打开几个窗口，多给一段文字留一点完整的时间。",
    date: "2026-09-20",
    category: "reading",
    tags: ["阅读", "专注"],
    minutes: 4,
    cover: "books",
    sample: true,
    content: `<p>这是一个阅读记录示例。这里记录的不是某本书的结论，而是关于阅读习惯的几个问题。</p>
      <p>我们很容易收集很多文章，却很少给其中一篇留足时间。收藏夹越来越长，理解却不一定随之变深。</p>
      <h2>从一段完整的时间开始</h2>
      <p>找一段不会被频繁打断的时间，选一个真正想了解的主题。关掉其他页面，先读完，再判断它是否值得继续。</p>
      <p>阅读不是收集标题。允许自己停在一段难懂的文字上，重新读一遍，或者带着问题去查找另一种解释。</p>
      <h2>用自己的话留下笔记</h2>
      <p>读完后，可以试着回答三个问题：</p>
      <ol><li>这段内容解决了什么问题？</li><li>它和自己已有的经验有什么关系？</li><li>有什么观点还需要进一步确认？</li></ol>
      <p>如果只能复制原文，却不能用自己的话说明，也许还需要多一点时间去理解。</p>
      <h2>把阅读带回生活</h2>
      <p>找到一个可以实践的小动作，再观察它带来的变化。阅读笔记可以保留疑问，也可以记录没有奏效的尝试。</p>
      <blockquote><p>留下来的，不必是很多知识，也可以是一个被认真想过的问题。</p></blockquote>`
  },
  {
    id: "css-grid",
    title: "用 CSS Grid，搭一个恰到好处的布局",
    description: "从两列卡片到响应式页面，记下 Grid 最实用的几个写法，让布局简单一点。",
    date: "2026-09-18",
    category: "tech",
    tags: ["CSS", "前端"],
    minutes: 5,
    cover: "grid",
    sample: true,
    content: `<p>当一个页面需要同时安排多行和多列，CSS Grid 是一个很好用的布局工具。先明确布局关系，再选择最少的规则实现它。</p>
      <h2>从两列卡片开始</h2>
      <p><code>fr</code> 用来分配网格容器的可用空间。下面的两列等宽，间距由 <code>gap</code> 控制。</p>
      <pre><code>.article-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}</code></pre>
      <p><code>minmax(0, 1fr)</code> 允许列缩小到零，配合内容换行，可以避免长内容意外撑宽整个网格。</p>
      <h2>主内容与侧栏</h2>
      <p>把侧栏宽度明确下来，让主内容占据剩余空间。布局关系就能直接体现在 CSS 里。</p>
      <pre><code>.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  gap: 32px;
}</code></pre>
      <h2>让小屏幕回到单列</h2>
      <p>响应式布局应该跟随内容需要。空间不够时，就把卡片和侧栏放到自然的阅读顺序里。</p>
      <pre><code>@media (max-width: 760px) {
  .content-grid,
  .article-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}</code></pre>
      <blockquote><p>好的布局不是塞进更多东西，而是给内容恰当的位置和空间。</p></blockquote>
      <p>完成后，试着在不同宽度下检查长标题、代码块和图片。真实内容往往比空白盒子更能说明布局是否合适。</p>`
  },
  {
    id: "first-post",
    title: "我的第一篇博客：从这里开始",
    description: "不需要很盛大的开始。一点好奇心，加上愿意动手的勇气，就足够写下第一页。",
    date: "2026-09-15",
    category: "life",
    tags: ["博客", "随笔"],
    minutes: 2,
    cover: "journal",
    sample: true,
    content: `<p>这是一篇开场文章示例。你可以把它替换成自己的第一篇博客，写下为什么想拥有这个地方，以及准备在这里分享什么。</p>
      <h2>先介绍一下自己</h2>
      <p>不用写很长的履历。说说你最近在做什么，对什么感兴趣，或者希望通过写作弄明白什么。</p>
      <h2>给接下来的自己留一句话</h2>
      <p>开始往往比坚持容易一点，但不用在第一天就替未来安排一切。先记录眼前的一件事，再给下一篇文章留下一个想法。</p>
      <blockquote><p>从这里开始，按照自己的节奏，慢慢把想法变成文字。</p></blockquote>
      <h2>一个小小的写作清单</h2>
      <ul><li>选一个真实经历过的问题。</li><li>写下发生了什么，自己想到了什么。</li><li>补充一个具体例子。</li><li>读一遍，然后发布。</li></ul>
      <p>愿这个博客成为一个可以不断回来的地方。第一页已经打开，后面的故事，留给你来写。</p>`
  }
];
