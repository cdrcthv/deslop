#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { appendFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { targets } from "./targets.js";

const SKILL = "deslop";
const skillSrc = join(dirname(fileURLToPath(import.meta.url)), "..", "skills", SKILL);

const HELP = `
Usage: npx github:cdrcthv/deslop [tools] [--project]
       npx github:cdrcthv/deslop --uninstall [tools] [--project]
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

if (args.includes("--uninstall")) {
  for (const tool of tools) uninstallTool(tool);
  if (wantsAgentsMd) console.log("  AGENTS.md: remove the deslop section by hand");
  process.exit(0);
}

for (const tool of tools) installTool(tool);
if (wantsAgentsMd) appendAgentsMd();
console.log("\nDone. Start a new session to load it.");

function removeOld(tool) {
  const target = targets[tool];
  const skillDir = join(target.skills[scope], SKILL);
  const existed = existsSync(skillDir);
  rmSync(skillDir, { recursive: true, force: true });
  const commandDir = target.commands[scope];
  const old = commandDir && existsSync(commandDir) ? readdirSync(commandDir).filter((f) => f.startsWith("deslop-")) : [];
  for (const file of old) rmSync(join(commandDir, file));
  return { skillDir, existed, commandDir, count: old.length };
}

function uninstallTool(tool) {
  const { skillDir, existed, commandDir, count } = removeOld(tool);
  console.log(existed ? `✓ ${tool}: removed ${skillDir}` : `  ${tool}: no skill at ${skillDir}`);
  if (commandDir) console.log(`✓ ${tool}: removed ${count} commands from ${commandDir}`);
}

function pluginInstalled() {
  try {
    const file = join(homedir(), ".claude/plugins/installed_plugins.json");
    return Object.keys(JSON.parse(readFileSync(file, "utf8")).plugins ?? {}).some((k) => k.startsWith(`${SKILL}@`));
  } catch {
    return false;
  }
}

function installTool(tool) {
  const target = targets[tool];
  const skillDir = join(target.skills[scope], SKILL);
  removeOld(tool);
  cpSync(skillSrc, skillDir, { recursive: true });
  console.log(`✓ ${tool}: skill → ${skillDir}`);
  if (tool === "claude" && pluginInstalled()) {
    console.log("  ! the deslop plugin is also installed, so everything loads twice.");
    console.log("    Remove one: /plugin uninstall deslop@cdrcthv, or --uninstall.");
  }

  const commandDir = target.commands[scope];
  if (!commandDir) {
    console.log(`  ${tool}: commands need --project, skipped`);
    return;
  }
  mkdirSync(commandDir, { recursive: true });
  const files = readdirSync(join(skillSrc, "commands")).filter((f) => f.startsWith("deslop-"));
  for (const file of files) {
    const name = file.replace(/\.md$/, target.commandExt ?? ".md");
    const from = join(skillSrc, "commands", file);
    if (target.inputSyntax) writeFileSync(join(commandDir, name), toInputSyntax(readFileSync(from, "utf8")));
    else cpSync(from, join(commandDir, name));
  }
  console.log(`✓ ${tool}: ${files.length} commands → ${commandDir}`);
}

function toInputSyntax(text) {
  const hint = /^argument-hint:\s*"?\[?(.*?)\]?"?\s*$/m.exec(text)?.[1] ?? "arguments";
  return text.replaceAll("$ARGUMENTS", `\${input:args:${hint.replace(/:/g, " -").replace(/[${}]/g, "")}}`);
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
