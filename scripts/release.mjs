#!/usr/bin/env node
// Release helpers. Usage: node scripts/release.mjs check <tag> | notes [version]
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const read = (root, path) => readFileSync(join(root, path), "utf8").replace(/\r\n/g, "\n");
const version = (root, path) => JSON.parse(read(root, path)).version;

export function releaseNotes(root, ver) {
  const lines = read(root, "CHANGELOG.md").split("\n");
  const start = lines.findIndex((l) => l.startsWith(`## [${ver}]`));
  if (start === -1) return "";
  const end = lines.findIndex((l, i) => i > start && l.startsWith("## "));
  return lines.slice(start + 1, end === -1 ? undefined : end).join("\n").trim();
}

export function checkTag(root, tag) {
  const errors = [];
  if (!/^v\d+\.\d+\.\d+$/.test(tag)) errors.push(`tag "${tag}" is not like v1.2.3`);
  for (const file of ["package.json", ".claude-plugin/plugin.json"]) {
    if (`v${version(root, file)}` !== tag) errors.push(`${file} is ${version(root, file)}, tag is ${tag}`);
  }
  if (!releaseNotes(root, tag.replace(/^v/, ""))) errors.push(`CHANGELOG.md has no notes for ${tag}`);
  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const [cmd, arg] = process.argv.slice(2);
  if (cmd === "check") {
    const errors = checkTag(root, arg ?? "");
    for (const e of errors) console.error(`✗ ${e}`);
    process.exit(errors.length ? 1 : 0);
  } else if (cmd === "notes") {
    const notes = releaseNotes(root, arg ?? version(root, "package.json"));
    if (!notes) {
      console.error("✗ no notes found in CHANGELOG.md");
      process.exit(1);
    }
    console.log(notes);
  } else {
    console.error("Usage: node scripts/release.mjs check <tag> | notes [version]");
    process.exit(1);
  }
}
