import { readdir, readFile, mkdir, writeFile, cp, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { marked } from "marked";
import { parseDocument } from "yaml";

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const covers = new Set(["code", "garden", "git", "books", "grid", "journal", "mountains"]);
const fields = new Set(["id", "title", "description", "date", "category", "tags", "minutes", "cover", "featured", "sample"]);

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, "en"))) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await markdownFiles(filename));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(filename);
  }
  return files;
}

function plainText(tokens) {
  const fragments = [];
  marked.walkTokens(tokens, (token) => {
    if (["text", "code", "codespan", "html", "image"].includes(token.type) && !token.tokens) {
      const text = token.type === "html" ? token.text.replace(/<[^>]*>/g, " ") : token.text;
      fragments.push(text.replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, entity) => ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " }[entity])));
    }
  });
  return fragments.join(" ").replace(/\s+/g, " ").trim();
}

function readPost(source, filename, categories) {
  const fail = (message) => { throw new Error(`${filename}: ${message}`); };
  const match = source.replace(/^\uFEFF/, "").match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) fail("文章必须以 --- 包围的 YAML 元数据开始");
  const document = parseDocument(match[1], { uniqueKeys: true });
  if (document.errors.length || document.warnings.length) fail([...document.errors, ...document.warnings].map((error) => error.message).join("; "));
  const data = document.toJS();
  if (!data || typeof data !== "object" || Array.isArray(data)) fail("元数据必须是键值对象");
  for (const key of Object.keys(data)) if (!fields.has(key)) fail(`未知字段 ${key}`);
  for (const key of ["id", "title", "description", "date", "category", "cover"]) {
    if (typeof data[key] !== "string" || !data[key].trim()) fail(`${key} 必须是非空字符串`);
    data[key] = data[key].trim();
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(data.id)) fail("id 只能包含英文字母、数字、连字符和下划线");
  const parsedDate = new Date(`${data.date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || !Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== data.date) fail("date 必须是有效的 YYYY-MM-DD 日期");
  if (!Object.hasOwn(categories, data.category)) fail(`未知分类 ${data.category}，请检查 blog.config.json`);
  if (!covers.has(data.cover)) fail(`未知封面 ${data.cover}`);
  if (!Array.isArray(data.tags) || data.tags.some((tag) => typeof tag !== "string" || !tag.trim())) fail("tags 必须是字符串数组");
  data.tags = data.tags.map((tag) => tag.trim());
  if (new Set(data.tags).size !== data.tags.length) fail("同一篇文章的标签不能重复");
  for (const key of ["featured", "sample"]) {
    if (data[key] !== undefined && typeof data[key] !== "boolean") fail(`${key} 必须是 true 或 false`);
    data[key] ??= false;
  }
  const markdown = source.replace(/^\uFEFF/, "").slice(match[0].length).trim();
  if (!markdown) fail("正文不能为空");
  const tokens = marked.lexer(markdown);
  const text = plainText(tokens);
  data.minutes ??= Math.max(1, Math.ceil(text.length / 400));
  if (!Number.isInteger(data.minutes) || data.minutes < 1) fail("minutes 必须是正整数，或省略以自动估算");
  const html = marked.parser(tokens);
  const hash = createHash("sha256").update(html).digest("hex").slice(0, 12);
  return {
    post: { ...data, contentUrl: `data/articles/${data.id}.${hash}.html` },
    html,
    text: `${data.title} ${data.description} ${data.tags.join(" ")} ${text}`
  };
}

export async function buildSite(root = projectRoot) {
  root = path.resolve(root);
  const output = path.join(root, "dist");
  const config = JSON.parse(await readFile(path.join(root, "blog.config.json"), "utf8"));
  const categories = config.categories;
  if (!categories || typeof categories !== "object" || Array.isArray(categories) || !Object.keys(categories).length) throw new Error("blog.config.json: categories 必须是非空对象");
  const index = await readFile(path.join(root, "index.html"), "utf8");
  for (const [id, category] of Object.entries(categories)) {
    if (id === "all") throw new Error("blog.config.json: all 是筛选保留值，不能作为分类 ID");
    if (!/^[a-z][a-z0-9_-]*$/.test(id) || !category || typeof category.name !== "string" || !category.name.trim() || typeof category.icon !== "string" || !index.includes(`id="icon-${category.icon}"`)) throw new Error(`blog.config.json: 分类 ${id} 的名称或图标无效`);
  }
  const articles = [];
  const ids = new Map();
  for (const filename of await markdownFiles(path.join(root, "content", "posts"))) {
    const sourcePath = path.relative(root, filename);
    const article = readPost(await readFile(filename, "utf8"), sourcePath, categories);
    const key = article.post.id.toLowerCase();
    if (ids.has(key)) throw new Error(`${sourcePath}: 重复文章 id ${article.post.id}（已在 ${ids.get(key)} 中使用，大小写也不能重复）`);
    ids.set(key, sourcePath);
    articles.push(article);
  }
  articles.sort((a, b) => b.post.date.localeCompare(a.post.date) || a.post.id.localeCompare(b.post.id, "en"));
  if (articles.filter((article) => article.post.featured).length > 1) throw new Error("只能有一篇文章设置 featured: true");

  // 所有文章校验通过后，只清理当前项目的生成目录，删除文章不会残留旧正文。
  if (path.dirname(output) !== root || path.basename(output) !== "dist") throw new Error("构建输出必须位于项目的 dist 目录");
  await rm(output, { recursive: true, force: true });
  await mkdir(path.join(output, "data", "articles"), { recursive: true });
  for (const filename of ["index.html", "styles.css", "app.js", ".nojekyll"]) await cp(path.join(root, filename), path.join(output, filename));
  await cp(path.join(root, "assets"), path.join(output, "assets"), { recursive: true });
  for (const article of articles) await writeFile(path.join(output, article.post.contentUrl), article.html);
  await writeFile(path.join(output, "data", "posts.json"), JSON.stringify({ categories, posts: articles.map((article) => article.post) }, null, 2) + "\n");
  await writeFile(path.join(output, "data", "search.json"), JSON.stringify(articles.map((article) => ({ id: article.post.id, text: article.text }))) + "\n");
  return { articles: articles.length, output };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await buildSite();
    console.log(`构建完成：${result.articles} 篇文章 → ${result.output}`);
  } catch (error) {
    console.error(`构建失败：${error.message}`);
    process.exitCode = 1;
  }
}
