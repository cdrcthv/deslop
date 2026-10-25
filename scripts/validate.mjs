#!/usr/bin/env node
// Checks the repo is consistent. Usage: node scripts/validate.mjs [repoRoot]
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DOCS = ["README.md", "skills/deslop/SKILL.md", "skills/deslop/COMMANDS.md"];
const SKILL_DIRS = ["references/", "scripts/", "portable/", "commands/"];

export function validate(root) {
  const errors = [];
  const read = (path) => readFileSync(join(root, path), "utf8").replace(/\r\n/g, "\n");
  const skillDir = join(root, "skills/deslop");

  const skill = frontmatter(read("skills/deslop/SKILL.md"));
  if (skill.name !== "deslop") errors.push(`SKILL.md: name must be "deslop", got "${skill.name}"`);
  if (!skill.description) errors.push("SKILL.md: missing description");

  const commandFiles = readdirSync(join(skillDir, "commands")).filter((f) => f.endsWith(".md"));
  for (const file of commandFiles) {
    if (!file.startsWith("deslop-")) errors.push(`commands/${file}: name must start with "deslop-"`);
    if (!frontmatter(read(`skills/deslop/commands/${file}`)).description) {
      errors.push(`commands/${file}: missing description`);
    }
    const slash = `/${file.replace(/\.md$/, "")}`;
    for (const doc of DOCS) {
      if (!read(doc).includes(slash)) errors.push(`${doc}: does not mention ${slash}`);
    }
  }

  for (const doc of DOCS) {
    const text = read(doc);
    const docDir = dirname(join(root, doc));
    const links = [...text.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]).filter((l) => !/^(https?:|#|mailto:)/.test(l));
    for (const link of links) {
      if (!existsSync(resolve(docDir, link.split("#")[0]))) errors.push(`${doc}: broken link ${link}`);
    }
    const refs = [...text.matchAll(/`((?:references|scripts|portable|commands)\/[^`\s*]*)`/g)].map((m) => m[1]);
    for (const ref of refs) {
      if (SKILL_DIRS.some((d) => ref.startsWith(d)) && !existsSync(join(skillDir, ref))) {
        errors.push(`${doc}: \`${ref}\` does not exist`);
      }
    }
  }

  const pkg = json(root, "package.json", errors);
  const plugin = json(root, ".claude-plugin/plugin.json", errors);
  json(root, ".claude-plugin/marketplace.json", errors);
  if (pkg && plugin && pkg.version !== plugin.version) {
    errors.push(`version mismatch: package.json ${pkg.version}, plugin.json ${plugin.version}`);
  }
  if (pkg && !read("CHANGELOG.md").includes(`## [${pkg.version}]`)) {
    errors.push(`CHANGELOG.md: no section for version ${pkg.version}`);
  }
  if (plugin?.commands && !existsSync(join(root, plugin.commands))) {
    errors.push(`plugin.json: commands path ${plugin.commands} does not exist`);
  }
  return errors;
}

function frontmatter(text) {
  const block = /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? "";
  return Object.fromEntries(
    block.split("\n").map((line) => /^([\w-]+):\s*(.*)$/.exec(line)).filter(Boolean).map((m) => [m[1], m[2].trim()]),
  );
}

function json(root, path, errors) {
  try {
    return JSON.parse(readFileSync(join(root, path), "utf8"));
  } catch (err) {
    errors.push(`${path}: ${err.message}`);
    return null;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), ".."));
  const errors = validate(root);
  for (const e of errors) console.error(`✗ ${e}`);
  console.log(errors.length ? `\n${errors.length} problem(s)` : "✓ repo is consistent");
  process.exit(errors.length ? 1 : 0);
}
