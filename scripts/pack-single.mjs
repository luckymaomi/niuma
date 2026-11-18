import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const indexPath = path.join(dist, "index.html");

if (!fs.existsSync(indexPath)) {
  console.error("[pack-single] missing dist/index.html, run build first");
  process.exit(1);
}

function readAsset(relativeUrl) {
  const cleaned = relativeUrl.replace(/^\.\//, "").replace(/^\//, "");
  const filePath = path.join(dist, cleaned);
  if (!fs.existsSync(filePath)) {
    throw new Error(`missing asset: ${relativeUrl}`);
  }
  return fs.readFileSync(filePath);
}

function mimeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".woff") return "font/woff";
  if (ext === ".woff2") return "font/woff2";
  if (ext === ".css") return "text/css";
  if (ext === ".js") return "text/javascript";
  return "application/octet-stream";
}

function toDataUri(filePath, buffer) {
  return `data:${mimeFor(filePath)};base64,${buffer.toString("base64")}`;
}

function inlineCssUrls(cssText, cssFileRel) {
  const cssDir = path.posix.dirname(cssFileRel.replace(/\\/g, "/"));
  return cssText.replace(/url\((['"]?)([^'")]+)\1\)/g, (full, _quote, rawUrl) => {
    if (rawUrl.startsWith("data:") || rawUrl.startsWith("http:") || rawUrl.startsWith("https:")) {
      return full;
    }
    const resolved = path.posix.normalize(path.posix.join(cssDir, rawUrl.split("?")[0]));
    const buffer = readAsset(resolved);
    return `url("${toDataUri(resolved, buffer)}")`;
  });
}

let html = fs.readFileSync(indexPath, "utf8");

html = html.replace(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi, (tag) => {
  const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
  if (!hrefMatch) return tag;
  const href = hrefMatch[1];
  const rel = href.replace(/^\.\//, "");
  const css = inlineCssUrls(readAsset(href).toString("utf8"), rel);
  return `<style>\n${css}\n</style>`;
});

html = html.replace(/<script\b[^>]*type=["']module["'][^>]*><\/script>/gi, (tag) => {
  const srcMatch = tag.match(/src=["']([^"']+)["']/i);
  if (!srcMatch) return tag;
  const js = readAsset(srcMatch[1]).toString("utf8");
  return `<script type="module">\n${js}\n</script>`;
});

html = html.replace(/(src|href)=["']\.\/assets\/([^"']+)["']/g, (_full, attr, fileName) => {
  const rel = `assets/${fileName}`;
  const buffer = readAsset(rel);
  return `${attr}="${toDataUri(rel, buffer)}"`;
});

const outName = "琨哥鼓励器.html";
const outPath = path.join(dist, outName);
fs.writeFileSync(outPath, html, "utf8");

const publicDir = path.join(root, "public");
fs.mkdirSync(publicDir, { recursive: true });
const publicPath = path.join(publicDir, outName);
fs.writeFileSync(publicPath, html, "utf8");

console.log(`[pack-single] wrote ${outPath} (${html.length} chars)`);
console.log(`[pack-single] copied ${publicPath} (for in-page download)`);
