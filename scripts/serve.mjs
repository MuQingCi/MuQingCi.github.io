import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { watch } from "node:fs";
import path from "node:path";
import { buildSite, projectRoot } from "./build.mjs";

await buildSite();
const output = path.join(projectRoot, "dist");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif" };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const filename = path.resolve(output, "." + (pathname === "/" ? "/index.html" : pathname));
    if (!filename.startsWith(output + path.sep)) { response.writeHead(403).end(); return; }
    const data = await readFile(filename);
    response.writeHead(200, { "Content-Type": types[path.extname(filename)] || "application/octet-stream", "Cache-Control": "no-store" });
    response.end(data);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("文件不存在");
  }
});
server.on("error", (error) => { console.error(`预览服务启动失败：${error.message}`); process.exit(1); });
server.listen(4173, "127.0.0.1", () => console.log("本地预览：http://127.0.0.1:4173（修改源文件后自动构建，刷新浏览器查看）"));

let timer;
let builds = Promise.resolve();
const watcher = watch(projectRoot, { recursive: true }, (_, filename) => {
  const changed = String(filename || "").replaceAll("\\", "/");
  if (!["index.html", "styles.css", "app.js", "blog.config.json", ".nojekyll"].includes(changed) && !changed.startsWith("content/posts/") && !changed.startsWith("assets/")) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    builds = builds.then(async () => {
      const result = await buildSite();
      console.log(`已更新 ${result.articles} 篇文章，请刷新浏览器。`);
    }).catch((error) => console.error(`构建失败，修正源文件后保存重试：${error.message}`));
  }, 150);
});
process.on("SIGINT", () => { clearTimeout(timer); watcher.close(); server.close(); });
