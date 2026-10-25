#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { appendFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { targets } from "./targets.js";

const SKILL = "deslop";
const skillSrc = join(dirname(fileURLToPath(import.meta.url)), "..", "skills", SKILL);

const HELP = `
Usage: npx github:cdrcthv/deslop [tools] [--project]
       npx github:cdrcthv/deslop report [path]   List oversized files and crowded folders

Tools (default: --claude):
  --claude      Claude Code
  --cursor      Cursor
  --copilot     GitHub Copilot
  --agents-md   Append the rules to ./AGENTS.md (Codex, Gemini, Zed, ...)

Scope:
  (default)     Your user folder, all projects
  --project     Current folder only, commit it to share with your team
`;

const args = process.argv.slice(2);
if (args[0] === "report") {
  const script = join(skillSrc, "scripts", "size_report.mjs");
  process.exit(spawnSync(process.execPath, [script, ...args.slice(1)], { stdio: "inherit" }).status ?? 1);
}
if (args.includes("-h") || args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const scope = args.includes("--project") ? "project" : "global";
const tools = Object.keys(targets).filter((tool) => args.includes(`--${tool}`));
const wantsAgentsMd = args.includes("--agents-md");
if (tools.length === 0 && !wantsAgentsMd) tools.push("claude");

for (const tool of tools) installTool(tool);
if (wantsAgentsMd) appendAgentsMd();
console.log("\nDone. Start a new session to load it.");

function installTool(tool) {
  const target = targets[tool];
  const skillDir = join(target.skills[scope], SKILL);
  cpSync(skillSrc, skillDir, { recursive: true });
  console.log(`✓ ${tool}: skill → ${skillDir}`);

  const commandDir = target.commands[scope];
  if (!commandDir) {
    console.log(`  ${tool}: commands need --project, skipped`);
    return;
  }
  mkdirSync(commandDir, { recursive: true });
  const files = readdirSync(join(skillSrc, "commands")).filter((f) => f.startsWith("deslop-"));
  for (const file of files) {
    const name = file.replace(/\.md$/, target.commandExt ?? ".md");
    cpSync(join(skillSrc, "commands", file), join(commandDir, name));
  }
  console.log(`✓ ${tool}: ${files.length} commands → ${commandDir}`);
}

function appendAgentsMd() {
  const rules = readFileSync(join(skillSrc, "portable", "AGENTS.md"), "utf8");
  const firstLine = rules.split("\n")[0];
  if (existsSync("AGENTS.md") && readFileSync("AGENTS.md", "utf8").includes(firstLine)) {
    console.log("✓ AGENTS.md already has the rules, skipped");
    return;
  }
  appendFileSync("AGENTS.md", (existsSync("AGENTS.md") ? "\n\n" : "") + rules);
  console.log("✓ rules → ./AGENTS.md");
}
