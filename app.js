(async () => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  let posts;
  let categories;
  try {
    const response = await fetch("data/posts.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("Article index unavailable");
    ({ posts, categories } = await response.json());
  } catch {
    document.querySelectorAll(".page").forEach((page) => { page.hidden = page.id !== "page-error"; });
    $("#page-label").textContent = "加载失败";
    $("#content-error-message").textContent = location.protocol === "file:" ? "请通过本地预览服务打开博客。" : "文章暂时无法加载，请刷新页面再试。";
    $("#reload-site").addEventListener("click", () => location.reload());
    return;
  }
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const icon = (name, small = false) => `<svg class="icon${small ? " small" : ""}" aria-hidden="true"><use href="#icon-${name}"/></svg>`;
  const formatDate = (date) => date.replaceAll("-", ".");
  const countLabel = (count) => String(count).padStart(2, "0");
  const tagCounts = new Map();
  posts.forEach((post) => post.tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)));
  const tags = [...tagCounts.keys()].sort((a, b) => tagCounts.get(b) - tagCounts.get(a) || a.localeCompare(b, "zh-CN"));
  let activeCategory = "all";
  let lastRoute = "";
  let toastTimer;
  let articleController;
  let routeVersion = 0;
  let searchIndexPromise;
  let searchVersion = 0;

  function cover(post, extraClass = "") {
    const illustrations = {
      code: '<div class="mini-terminal"><div class="terminal-bar"><i></i><i></i><i></i></div><pre><b>const</b> curiosity = <em>true</em>;\n\n<b>async function</b> explore() {\n  <b>await</b> keepLearning();\n}</pre></div>',
      garden: '<div class="window-scene"></div><span class="scene-plant"></span><span class="scene-pot"></span>',
      git: '<div class="git-diagram"><span class="git-line"></span><span class="git-branch"></span><i class="git-point"></i><i class="git-point"></i><i class="git-point"></i><i class="git-point"></i><i class="git-point"></i><i class="git-point branch-point"></i><span class="git-label">a little progress</span></div>',
      books: '<div class="book-stack"><span></span><span></span><span></span></div>',
      grid: '<div class="grid-sketch"><span></span><span></span><span></span><span></span><span></span><span></span></div>',
      journal: `<div class="notebook">${icon("leaf")}</div><span class="pencil"></span>`,
      mountains: '<img src="assets/mountains.svg" alt="" width="1200" height="460" loading="lazy"/>'
    };
    return `<div class="article-cover cover-${post.cover} ${extraClass}" aria-hidden="true">${illustrations[post.cover] || ""}</div>`;
  }

  function categoryLabel(category) {
    return `<span class="card-category ${category}">${icon(categories[category].icon, true)} ${categories[category].name}</span>`;
  }

  function articleCard(post) {
    return `<a class="article-card" href="#article/${encodeURIComponent(post.id)}">${cover(post)}<div class="article-card-body">${categoryLabel(post.category)}<h3>${escapeHTML(post.title)}</h3><p>${escapeHTML(post.description)}</p><div class="card-meta"><time datetime="${post.date}">${formatDate(post.date)}${post.sample ? " · 示例" : ""}</time><span>${icon("clock", true)} ${post.minutes} 分钟</span></div></div></a>`;
  }

  function tagLink(tag) {
    return `<a class="tag-chip" href="#tags/${encodeURIComponent(tag)}">${escapeHTML(tag)} <span>${tagCounts.get(tag)}</span></a>`;
  }

  function renderFeatured() {
    const post = posts.find((item) => item.featured);
    const element = $("#featured-article");
    element.hidden = !post;
    if (!post) return;
    element.href = `#article/${encodeURIComponent(post.id)}`;
    element.setAttribute("aria-label", `阅读精选文章：${post.title}`);
    element.querySelector(".featured-content").innerHTML = `<span class="featured-label">${icon("leaf", true)} 编辑精选${post.sample ? " <span>·</span> 示例文章" : ""}</span><h2>${escapeHTML(post.title)}</h2><p>${escapeHTML(post.description)}</p><span class="featured-meta"><time datetime="${post.date}">${formatDate(post.date)}</time><span>·</span>${post.minutes} 分钟阅读<span class="featured-read">开始阅读 ${icon("arrow", true)}</span></span>`;
  }

  function renderHome() {
    const visible = posts.filter((post) => !post.featured && (activeCategory === "all" || post.category === activeCategory));
    $("#article-grid").innerHTML = visible.map(articleCard).join("") || '<p class="empty-state">这个分类还没有文章，新的文字正在路上。</p>';
    $("#visible-count").textContent = countLabel(visible.length);
    document.querySelectorAll(".filter-button").forEach((button) => {
      const selected = button.dataset.category === activeCategory;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function renderArchive() {
    const years = [...new Set(posts.map((post) => post.date.slice(0, 4)))];
    $("#archive-list").innerHTML = years.map((year) => {
      const grouped = posts.filter((post) => post.date.startsWith(year));
      return `<section class="archive-group"><h2 class="archive-year">${year} <span>${grouped.length} 篇文字</span></h2>${grouped.map((post) => `<a class="archive-item" href="#article/${post.id}"><time datetime="${post.date}">${post.date.slice(5).replace("-", ".")}</time><span class="archive-dot"></span><h3>${escapeHTML(post.title)}</h3>${categoryLabel(post.category)}${icon("chevron", true)}</a>`).join("")}</section>`;
    }).join("");
  }

  function renderTags(selectedTag = "") {
    const selectedPosts = selectedTag ? posts.filter((post) => post.tags.includes(selectedTag)) : posts;
    $("#all-tags").innerHTML = [`<button class="tag-filter ${selectedTag ? "" : "active"}" data-tag="" aria-pressed="${!selectedTag}">全部标签 <span>${posts.length}</span></button>`, ...tags.map((tag) => `<button class="tag-filter ${selectedTag === tag ? "active" : ""}" data-tag="${escapeHTML(tag)}" aria-pressed="${selectedTag === tag}">${escapeHTML(tag)} <span>${tagCounts.get(tag)}</span></button>`)].join("");
    $("#tag-result-heading").textContent = selectedTag ? `# ${selectedTag} · ${selectedPosts.length} 篇文字` : `所有文字 · ${posts.length} 篇`;
    $("#tag-articles").innerHTML = selectedPosts.map(articleCard).join("") || '<p class="empty-state">还没有使用这个标签的文章，试试其他标签吧。</p>';
  }

  async function renderArticle(post, version) {
    const related = posts.filter((item) => item.id !== post.id).sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category)).slice(0, 2);
    $("#article-content").innerHTML = `<a href="#archive" class="back-link">${icon("arrow", true)} 返回文章归档</a><article><header class="article-header">${categoryLabel(post.category)}<h1>${escapeHTML(post.title)}</h1><div class="article-info"><img src="assets/avatar.svg" class="avatar" alt="" width="25" height="25"/><span>MuQingCi</span><span>·</span><time datetime="${post.date}">${formatDate(post.date)}</time><span>·</span><span>${post.minutes} 分钟阅读</span></div>${post.sample ? '<p class="sample-note">这是一篇示例文章，用于展示阅读效果。</p>' : ""}</header>${cover(post, "article-hero")}<div class="article-body" aria-busy="true"><p class="loading-note" role="status">正在打开这篇文字...</p></div><footer class="article-bottom"><div class="tag-cloud">${post.tags.map(tagLink).join("")}</div><button class="copy-link" id="copy-link">${icon("copy", true)} 复制文章链接</button></footer></article><h2 class="related-title">继续逛逛</h2><div class="article-grid related-grid">${related.map(articleCard).join("")}</div>`;
    const controller = new AbortController();
    articleController = controller;
    try {
      const response = await fetch(post.contentUrl, { signal: controller.signal });
      if (!response.ok) throw new Error("Article unavailable");
      const html = await response.text();
      if (version !== routeVersion) return;
      $(".article-body").innerHTML = html;
      $(".article-body").setAttribute("aria-busy", "false");
    } catch (error) {
      if (error.name === "AbortError" || version !== routeVersion) return;
      $(".article-body").innerHTML = '<p role="alert">这篇文章暂时无法打开，请重试；如果文章已经更新，请刷新页面。</p><button class="secondary-button" id="retry-article">重新加载</button>';
      $(".article-body").setAttribute("aria-busy", "false");
    }
  }

  function setMenu(open) {
    $("#sidebar").classList.toggle("open", open);
    $("#sidebar").inert = window.innerWidth <= 760 && !open;
    $("#mobile-backdrop").hidden = !open;
    $("#mobile-menu").setAttribute("aria-expanded", String(open));
    $("#mobile-menu").setAttribute("aria-label", open ? "关闭导航" : "打开导航");
    document.body.classList.toggle("nav-open", open);
    if (open) ($("#sidebar .active") || $("#sidebar .brand")).focus();
  }

  function route() {
    const version = ++routeVersion;
    articleController?.abort();
    let path;
    try { path = decodeURIComponent(location.hash.slice(1) || "home"); }
    catch { path = "not-found"; }
    const slash = path.indexOf("/");
    const section = slash === -1 ? path : path.slice(0, slash);
    const detail = slash === -1 ? "" : path.slice(slash + 1);
    let page = section;
    let title = "MuQingCi · 记录思考，收藏日常";
    let label = { home: "首页", archive: "文章归档", tags: "标签", about: "关于我" }[section];

    if (section === "home" && !detail) renderHome();
    else if (section === "archive" && !detail) renderArchive();
    else if (section === "tags") renderTags(detail);
    else if (section === "about" && !detail) { /* 内容由静态 HTML 提供。 */ }
    else if (section === "article") {
      const post = posts.find((item) => item.id === detail);
      if (post) {
        renderArticle(post, version);
        title = `${post.title} · MuQingCi`;
        label = "阅读文章";
      } else page = "not-found";
    } else page = "not-found";

    if (page === "not-found") label = "未找到页面";
    document.querySelectorAll(".page").forEach((element) => { element.hidden = element.id !== `page-${page}`; });
    document.querySelectorAll(".nav-link").forEach((link) => {
      const selected = link.dataset.route === (page === "article" ? "archive" : page);
      link.classList.toggle("active", selected);
      if (selected) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    $("#page-label").textContent = label;
    document.title = section === "home" ? title : title === "MuQingCi · 记录思考，收藏日常" ? `${label} · MuQingCi` : title;
    if ($("#search-dialog").open) $("#search-dialog").close();
    setMenu(false);
    if (lastRoute && lastRoute !== path) {
      window.scrollTo({ top: 0, behavior: "instant" });
      $("#main-content").focus({ preventScroll: true });
    }
    lastRoute = path;
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const isDark = theme === "dark";
    $(".theme-toggle").setAttribute("aria-label", isDark ? "切换到浅色模式" : "切换到深色模式");
    $(".theme-toggle").innerHTML = icon(isDark ? "sun" : "moon");
    $('meta[name="theme-color"]').content = isDark ? "#181f1b" : "#f8f9f6";
  }

  async function search() {
    const version = ++searchVersion;
    const query = $("#search-input").value.trim().toLocaleLowerCase();
    let matches = posts.slice(0, 4);
    if (query) {
      $("#search-results").innerHTML = '<p class="search-empty" role="status">正在寻找相关文字...</p>';
      try {
        searchIndexPromise ||= fetch("data/search.json").then(async (response) => {
          if (!response.ok) throw new Error("Search unavailable");
          const entries = await response.json();
          return new Map(entries.map((entry) => [entry.id, entry.text.toLocaleLowerCase()]));
        }).catch((error) => { searchIndexPromise = undefined; throw error; });
        const index = await searchIndexPromise;
        if (version !== searchVersion || !$("#search-dialog").open) return;
        matches = posts.filter((post) => index.get(post.id)?.includes(query));
      } catch {
        if (version === searchVersion && $("#search-dialog").open) $("#search-results").innerHTML = '<p class="search-empty" role="alert">搜索暂时不可用，请重新输入关键词再试。</p>';
        return;
      }
    }
    $("#search-results").innerHTML = matches.length ? `<p class="search-summary">${query ? `找到 ${matches.length} 篇文字` : "最近的文字"}</p>${matches.map((post) => `<a class="search-result" href="#article/${post.id}"><h3>${escapeHTML(post.title)}</h3><p>${categories[post.category].name} · ${formatDate(post.date)} · ${post.minutes} 分钟阅读</p></a>`).join("")}` : `<p class="search-empty">没有找到相关文字。试试「JavaScript」「生活」或其他关键词。</p>`;
  }

  function openSearch() {
    setMenu(false);
    if (!$("#search-dialog").open) $("#search-dialog").showModal();
    document.body.classList.add("modal-open");
    search();
    $("#search-input").focus();
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    $("#toast").textContent = message;
    $("#toast").classList.add("visible");
    toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 2400);
  }

  async function copyArticleLink() {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(location.href);
      showToast("文章链接已复制");
    } catch {
      showToast("暂时无法复制，请从浏览器地址栏复制链接");
    }
  }

  const now = new Date();
  $("#today").textContent = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
  $("#today").dateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  $("#copyright-year").textContent = now.getFullYear();
  $("#nav-post-count").textContent = countLabel(posts.length);
  $("#stat-articles").textContent = countLabel(posts.length);
  $("#stat-tags").textContent = countLabel(tags.length);
  $("#stat-categories").textContent = countLabel(Object.keys(categories).length);
  $("#home-tags").innerHTML = tags.slice(0, 8).map(tagLink).join("");
  $(".filter-bar").innerHTML = '<button class="filter-button active" data-category="all" aria-pressed="true">全部</button>' + Object.entries(categories).map(([id, category]) => `<button class="filter-button" data-category="${escapeHTML(id)}" aria-pressed="false">${escapeHTML(category.name)}</button>`).join("");
  renderFeatured();
  try { applyTheme(localStorage.getItem("muqingci-theme") === "dark" ? "dark" : "light"); }
  catch { applyTheme("light"); }

  $(".filter-bar").addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    renderHome();
  });
  $("#all-tags").addEventListener("click", (event) => {
    const button = event.target.closest("[data-tag]");
    if (button) location.hash = button.dataset.tag ? `tags/${encodeURIComponent(button.dataset.tag)}` : "tags";
  });
  $(".theme-toggle").addEventListener("click", () => {
    const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(theme);
    try { localStorage.setItem("muqingci-theme", theme); } catch { /* 无持久存储时，本次会话仍可切换主题。 */ }
  });
  $("#mobile-menu").addEventListener("click", () => setMenu(!$("#sidebar").classList.contains("open")));
  $("#mobile-backdrop").addEventListener("click", () => { setMenu(false); $("#mobile-menu").focus(); });
  $("#sidebar").addEventListener("click", (event) => { if (event.target.closest('a[href^="#"]')) setMenu(false); });
  $("#search-trigger").addEventListener("click", openSearch);
  $("#search-close").addEventListener("click", () => $("#search-dialog").close());
  $("#search-input").addEventListener("input", search);
  $("#search-dialog").addEventListener("close", () => { ++searchVersion; document.body.classList.remove("modal-open"); });
  $("#search-dialog").addEventListener("click", (event) => {
    if (event.target.closest(".search-result")) $("#search-dialog").close();
    if (event.target === $("#search-dialog")) {
      const bounds = event.target.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) event.target.close();
    }
  });
  $("#article-content").addEventListener("click", (event) => {
    if (event.target.closest("#copy-link")) copyArticleLink();
    if (event.target.closest("#retry-article")) route();
  });
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openSearch(); }
    if (event.key === "Escape" && $("#sidebar").classList.contains("open")) { setMenu(false); $("#mobile-menu").focus(); }
    if (event.key === "Enter" && event.target === $("#search-input")) $(".search-result")?.click();
    if (event.key === "Tab" && $("#sidebar").classList.contains("open")) {
      const links = [...$("#sidebar").querySelectorAll("a, button")];
      const first = links[0];
      const last = links[links.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener("hashchange", route);
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) setMenu(false);
    else $("#sidebar").inert = !$("#sidebar").classList.contains("open");
  });
  route();
})();
