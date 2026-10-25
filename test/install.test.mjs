import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const installer = join(repo, "bin", "install.js");
const commandCount = readdirSync(join(repo, "skills/deslop/commands")).length;

function sandbox(run) {
  const dir = mkdtempSync(join(tmpdir(), "deslop-install-"));
  const home = join(dir, "home");
  const project = join(dir, "project");
  mkdirSync(home);
  mkdirSync(project);
  const deslop = (...args) =>
    spawnSync(process.execPath, [installer, ...args], {
      cwd: project,
      encoding: "utf8",
      env: { ...process.env, HOME: home, USERPROFILE: home },
    });
  try {
    run({ home, project, deslop });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const deslopFiles = (dir) => readdirSync(dir).filter((f) => f.startsWith("deslop-"));

test("installs the skill and commands for Claude", () => {
  sandbox(({ home, deslop }) => {
    const result = deslop("--claude");
    assert.equal(result.status, 0, result.stderr);
    assert.ok(existsSync(join(home, ".claude/skills/deslop/SKILL.md")));
    assert.equal(deslopFiles(join(home, ".claude/commands")).length, commandCount);
  });
});

test("--project installs into the current folder", () => {
  sandbox(({ home, project, deslop }) => {
    assert.equal(deslop("--claude", "--project").status, 0);
    assert.ok(existsSync(join(project, ".claude/skills/deslop/SKILL.md")));
    assert.equal(existsSync(join(home, ".claude")), false);
  });
});

test("reinstall removes stale deslop files and keeps the user's own", () => {
  sandbox(({ home, deslop }) => {
    deslop("--claude");
    const commands = join(home, ".claude/commands");
    writeFileSync(join(commands, "deslop-old.md"), "");
    writeFileSync(join(commands, "mine.md"), "");
    writeFileSync(join(home, ".claude/skills/deslop/stale.txt"), "");
    deslop("--claude");
    assert.equal(existsSync(join(commands, "deslop-old.md")), false);
    assert.equal(existsSync(join(home, ".claude/skills/deslop/stale.txt")), false);
    assert.ok(existsSync(join(commands, "mine.md")));
  });
});

test("--uninstall removes only deslop files", () => {
  sandbox(({ home, deslop }) => {
    deslop("--claude");
    writeFileSync(join(home, ".claude/commands/mine.md"), "");
    assert.equal(deslop("--uninstall", "--claude").status, 0);
    assert.equal(existsSync(join(home, ".claude/skills/deslop")), false);
    assert.deepEqual(deslopFiles(join(home, ".claude/commands")), []);
    assert.ok(existsSync(join(home, ".claude/commands/mine.md")));
  });
});

test("uninstalling twice is harmless", () => {
  sandbox(({ deslop }) => {
    assert.equal(deslop("--uninstall", "--claude").status, 0);
  });
});

test("Copilot prompts use input variables instead of $ARGUMENTS", () => {
  sandbox(({ project, deslop }) => {
    assert.equal(deslop("--copilot", "--project").status, 0);
    const dir = join(project, ".github/prompts");
    const files = readdirSync(dir);
    assert.equal(files.length, commandCount);
    for (const file of files) {
      assert.ok(file.endsWith(".prompt.md"), file);
      assert.ok(!readFileSync(join(dir, file), "utf8").includes("$ARGUMENTS"), file);
    }
    assert.match(readFileSync(join(dir, "deslop-review.prompt.md"), "utf8"), /\$\{input:args:[^}]+\}/);
  });
});

test("Claude and Cursor commands keep $ARGUMENTS", () => {
  sandbox(({ project, deslop }) => {
    deslop("--claude", "--cursor", "--project");
    for (const dir of [".claude/commands", ".cursor/commands"]) {
      assert.match(readFileSync(join(project, dir, "deslop-review.md"), "utf8"), /\$ARGUMENTS/);
    }
  });
});

test("warns when the plugin is also installed", () => {
  sandbox(({ home, deslop }) => {
    assert.ok(!deslop("--claude").stdout.includes("loads twice"));
    mkdirSync(join(home, ".claude/plugins"), { recursive: true });
    writeFileSync(join(home, ".claude/plugins/installed_plugins.json"), '{"plugins":{"deslop@cdrcthv":[{}]}}');
    const result = deslop("--claude");
    assert.equal(result.status, 0);
    assert.match(result.stdout, /loads twice/);
  });
});

test("report lists a long file and exits 0", () => {
  sandbox(({ project, deslop }) => {
    mkdirSync(join(project, "src"));
    writeFileSync(join(project, "src/big.js"), "x\n".repeat(400));
    const result = deslop("report", join(project, "src"));
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Files over 300 lines\n\s+400\s+big\.js/);
  });
});
