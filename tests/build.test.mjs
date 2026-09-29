import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, readdir, cp, rm, access } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { stringify } from "yaml";
import { buildSite, projectRoot } from "../scripts/build.mjs";

const metadata = {
  id: "first-note", title: "第一篇笔记", description: "介绍这篇笔记。", date: "2026-09-28",
  category: "tech", tags: ["CSS"], cover: "code", featured: false, sample: false
};

async function fixture(context) {
  const root = await mkdtemp(path.join(os.tmpdir(), "muqingci-build-"));
  context.after(async () => {
    if (path.dirname(root) !== os.tmpdir() || !path.basename(root).startsWith("muqingci-build-")) throw new Error("Unexpected fixture path");
    await rm(root, { recursive: true, force: true });
  });
  await mkdir(path.join(root, "content", "posts", "2026"), { recursive: true });
  for (const file of ["blog.config.json", "index.html", "styles.css", "app.js", ".nojekyll"]) await cp(path.join(projectRoot, file), path.join(root, file));
  await cp(path.join(projectRoot, "assets"), path.join(root, "assets"), { recursive: true });
  return root;
}

async function article(root, filename, data = metadata, body = "## 正文\n\n这里有值得记录的内容。") {
  const destination = path.join(root, "content", "posts", filename);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, `---\n${stringify(data)}---\n\n${body}\n`);
  return destination;
}

async function index(root) {
  return JSON.parse(await readFile(path.join(root, "dist", "data", "posts.json"), "utf8"));
}

test("从嵌套目录生成摘要、独立正文和可搜索的 Markdown 内容", async (context) => {
  const root = await fixture(context);
  const body = "## 记录\n\n**保持好奇**，阅读 `Promise.all`。\n\n- 第一件事\n- 第二件事\n\n```html\n<div>literal & text</div>\n```\n\n| 字段 | 用途 |\n| --- | --- |\n| title | 标题 |";
  await article(root, "2026/nested/first.md", metadata, body);
  await article(root, "2025/second.md", { ...metadata, id: "second", date: "2025-12-31" });
  const result = await buildSite(root);
  assert.equal(result.articles, 2);
  const manifest = await index(root);
  assert.deepEqual(manifest.posts.map((post) => post.id), ["first-note", "second"]);
  assert.deepEqual(manifest.categories.life, { name: "生活随笔", icon: "leaf" });
  const post = manifest.posts[0];
  assert.equal(Object.hasOwn(post, "content"), false);
  assert.equal(Object.hasOwn(post, "text"), false);
  assert.ok(post.minutes >= 1);
  assert.match(post.contentUrl, /^data\/articles\/first-note\.[a-f0-9]{12}\.html$/);
  const html = await readFile(path.join(root, "dist", post.contentUrl), "utf8");
  assert.match(html, /<h2>记录<\/h2>/);
  assert.match(html, /<strong>保持好奇<\/strong>/);
  assert.match(html, /&lt;div&gt;literal &amp; text&lt;\/div&gt;/);
  assert.match(html, /<table>/);
  const search = JSON.parse(await readFile(path.join(root, "dist", "data", "search.json"), "utf8"));
  assert.ok(search[0].text.includes("第一件事"));
  assert.ok(search[0].text.includes("literal & text"));
  assert.ok(search[0].text.includes("标题"));
  assert.ok(!(await readFile(path.join(root, "dist", "index.html"), "utf8")).includes('src="posts.js"'));
  await assert.rejects(access(path.join(root, "dist", "content")));
});

test("新增、修改和删除文章会更新索引并清理旧正文", async (context) => {
  const root = await fixture(context);
  const first = await article(root, "2026/first.md");
  await buildSite(root);
  const previous = (await index(root)).posts[0].contentUrl;
  await article(root, "2026/first.md", metadata, "修改后的正文。");
  await article(root, "2026/new.md", { ...metadata, id: "new-note", title: "新增文章" });
  await buildSite(root);
  const updated = await index(root);
  assert.equal(updated.posts.length, 2);
  assert.notEqual(updated.posts.find((post) => post.id === metadata.id).contentUrl, previous);
  await assert.rejects(access(path.join(root, "dist", previous)));
  await rm(first);
  await buildSite(root);
  assert.deepEqual((await index(root)).posts.map((post) => post.id), ["new-note"]);
  assert.equal((await readdir(path.join(root, "dist", "data", "articles"))).length, 1);
});

test("空内容目录可以构建，删除最后一篇文章后清空输出", async (context) => {
  const root = await fixture(context);
  await buildSite(root);
  assert.deepEqual((await index(root)).posts, []);
  assert.deepEqual(JSON.parse(await readFile(path.join(root, "dist", "data", "search.json"), "utf8")), []);
});

test("保留已有大写 ID，不强制更改文章链接", async (context) => {
  const root = await fixture(context);
  await article(root, "2026/Love-Story.md", { ...metadata, id: "Love-Story", category: "life", minutes: 2 });
  await buildSite(root);
  assert.equal((await index(root)).posts[0].id, "Love-Story");
});

test("拒绝与全部筛选冲突的分类 ID", async (context) => {
  const root = await fixture(context);
  await writeFile(path.join(root, "blog.config.json"), JSON.stringify({ categories: { all: { name: "全部文章", icon: "code" } } }));
  await assert.rejects(buildSite(root), /all 是筛选保留值/);
});

for (const [name, patch, expected] of [
  ["无效日期", { date: "2026-02-30" }, /有效的 YYYY-MM-DD/],
  ["未知分类", { category: "missing" }, /未知分类/],
  ["未知封面", { cover: "missing" }, /未知封面/],
  ["重复标签", { tags: ["CSS", "CSS"] }, /标签不能重复/],
  ["错误的标签类型", { tags: "CSS" }, /tags 必须/],
  ["非法 ID", { id: "../escape" }, /id 只能/],
  ["布尔字符串", { featured: "false" }, /featured 必须/],
  ["无效时长", { minutes: 0 }, /minutes 必须/],
  ["字段拼写错误", { titlle: "typo" }, /未知字段/],
  ["空标题", { title: " " }, /title 必须/]
]) {
  test(`拒绝${name}，保留上一次有效构建并报告源文件`, async (context) => {
    const root = await fixture(context);
    await article(root, "2026/first.md");
    await buildSite(root);
    const before = await readFile(path.join(root, "dist", "data", "posts.json"), "utf8");
    await article(root, "2026/first.md", { ...metadata, ...patch });
    await assert.rejects(buildSite(root), (error) => expected.test(error.message) && error.message.includes("first.md"));
    assert.equal(await readFile(path.join(root, "dist", "data", "posts.json"), "utf8"), before);
  });
}

test("重复 ID 与大小写碰撞都会阻止构建", async (context) => {
  const root = await fixture(context);
  await article(root, "2026/first.md");
  await article(root, "2026/other.md", { ...metadata, id: "FIRST-NOTE" });
  await assert.rejects(buildSite(root), /重复文章 id/);
});

test("多篇精选文章会阻止构建", async (context) => {
  const root = await fixture(context);
  await article(root, "2026/first.md", { ...metadata, featured: true });
  await article(root, "2026/other.md", { ...metadata, id: "other", featured: true });
  await assert.rejects(buildSite(root), /只能有一篇/);
});

test("缺少元数据、重复 YAML 字段和空正文会报告源文件", async (context) => {
  const root = await fixture(context);
  const source = path.join(root, "content", "posts", "2026", "broken.md");
  for (const text of ["只有正文", "---\ntitle: first\ntitle: duplicate\n---\n正文", `---\n${stringify(metadata)}---\n`]) {
    await writeFile(source, text);
    await assert.rejects(buildSite(root), /broken\.md/);
  }
});
