import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { validate } from "../scripts/validate.mjs";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");

function copyOfRepo() {
  const dir = mkdtempSync(join(tmpdir(), "deslop-validate-"));
  for (const path of ["skills", ".claude-plugin", "package.json", "README.md", "LICENSE"]) {
    cpSync(join(repo, path), join(dir, path), { recursive: true });
  }
  return dir;
}

function edit(dir, path, change) {
  const file = join(dir, path);
  writeFileSync(file, change(readFileSync(file, "utf8").replace(/\r\n/g, "\n")));
}

function brokenBy(path, change) {
  const dir = copyOfRepo();
  try {
    edit(dir, path, change);
    return validate(dir).join("\n");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("the real repo is consistent", () => {
  assert.deepEqual(validate(repo), []);
});

test("an untouched copy is consistent", () => {
  assert.equal(brokenBy("package.json", (t) => t), "");
});

test("catches a version mismatch", () => {
  const out = brokenBy(".claude-plugin/plugin.json", (t) => t.replace(/"version": "[^"]+"/, '"version": "0.0.0"'));
  assert.match(out, /version mismatch/);
});

test("catches invalid JSON", () => {
  assert.match(brokenBy("package.json", (t) => t + "{"), /package\.json/);
});

test("catches a wrong skill name", () => {
  assert.match(brokenBy("skills/deslop/SKILL.md", (t) => t.replace("name: deslop", "name: other")), /name must be/);
});

test("catches a command without description", () => {
  const out = brokenBy("skills/deslop/commands/deslop-audit.md", (t) => t.replace(/^description:.*\n/m, ""));
  assert.match(out, /deslop-audit\.md: missing description/);
});

test("catches a missing referenced file", () => {
  const out = brokenBy("skills/deslop/SKILL.md", (t) => t + "\nSee `references/nope.md`.\n");
  assert.match(out, /references\/nope\.md/);
});

test("catches a broken link", () => {
  assert.match(brokenBy("README.md", (t) => t + "\n[x](docs/missing.md)\n"), /broken link docs\/missing\.md/);
});

test("catches a command missing from the docs", () => {
  const out = brokenBy("skills/deslop/COMMANDS.md", (t) => t.replaceAll("/deslop-split", "/deslop-other"));
  assert.match(out, /COMMANDS\.md: does not mention \/deslop-split/);
});
