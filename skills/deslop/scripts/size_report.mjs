#!/usr/bin/env node
// Lists oversized files and crowded folders.
// Usage: node size_report.mjs [path] [maxFileLines] [maxFolderFiles]
import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

const [root = ".", maxLines = 300, maxFiles = 15] = process.argv.slice(2);

const CODE = new Set([".go", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".vue", ".svelte", ".cs", ".py",
  ".rs", ".java", ".kt", ".swift", ".dart", ".rb", ".php", ".c", ".cpp", ".h"]);
const SKIP = new Set(["node_modules", "vendor", "dist", "build", ".git", ".next", ".nuxt",
  "bin", "obj", "target", "__pycache__", "generated", "coverage"]);

const files = [];
walk(root);

const longFiles = files
  .map((f) => ({ f, lines: countLines(readFileSync(f, "utf8")) }))
  .filter(({ lines }) => lines > maxLines)
  .sort((a, b) => b.lines - a.lines);

const perFolder = {};
for (const f of files) {
  const dir = relative(root, join(f, "..")) || ".";
  perFolder[dir] = (perFolder[dir] ?? 0) + 1;
}
const crowded = Object.entries(perFolder)
  .filter(([, n]) => n > maxFiles)
  .sort((a, b) => b[1] - a[1]);

console.log(`## Files over ${maxLines} lines`);
longFiles.forEach(({ f, lines }) => console.log(`${String(lines).padStart(6)}  ${relative(root, f)}`));
console.log(`\n## Folders over ${maxFiles} code files`);
crowded.forEach(([dir, n]) => console.log(`${String(n).padStart(6)}  ${dir}`));
console.log(`\n## Totals\ncode files: ${files.length}`);

function countLines(text) {
  return text.endsWith("\n") ? text.split("\n").length - 1 : text.split("\n").length;
}

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory() && !SKIP.has(entry.name)) walk(path);
    else if (entry.isFile() && CODE.has(extname(entry.name)) && !entry.name.includes(".min.")) files.push(path);
  }
}
