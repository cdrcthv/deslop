import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { checkTag, releaseNotes } from "../scripts/release.mjs";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const current = JSON.parse(readFileSync(join(repo, "package.json"), "utf8")).version;

function withFiles(files, run) {
  const dir = mkdtempSync(join(tmpdir(), "deslop-release-"));
  try {
    cpSync(join(repo, "package.json"), join(dir, "package.json"));
    for (const [path, text] of Object.entries(files)) writeFileSync(join(dir, path), text);
    run(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("the current version can be released", () => {
  assert.deepEqual(checkTag(repo, `v${current}`), []);
});

test("notes are the section of one version only", () => {
  const notes = releaseNotes(repo, "1.0.1");
  assert.match(notes, /--uninstall/);
  assert.doesNotMatch(notes, /1\.0\.0|First release/);
  assert.doesNotMatch(notes, /^## /m);
});

test("notes of an unknown version are empty", () => {
  assert.equal(releaseNotes(repo, "9.9.9"), "");
});

test("the last section is read to the end of the file", () => {
  assert.match(releaseNotes(repo, "1.0.0"), /First release/);
});

test("rejects a tag that differs from the versions", () => {
  assert.match(checkTag(repo, "v9.9.9").join("\n"), /package\.json is .*, tag is v9\.9\.9/);
});

test("rejects a plugin.json that differs from the tag", () => {
  withFiles({ "CHANGELOG.md": readFileSync(join(repo, "CHANGELOG.md"), "utf8") }, (dir) => {
    mkdirSync(join(dir, ".claude-plugin"));
    writeFileSync(join(dir, ".claude-plugin/plugin.json"), '{"version": "0.0.1"}');
    assert.match(checkTag(dir, `v${current}`).join("\n"), /plugin\.json is 0\.0\.1/);
  });
});

test("rejects a tag that is not v1.2.3", () => {
  assert.match(checkTag(repo, "1.0.1").join("\n"), /is not like v1\.2\.3/);
  assert.match(checkTag(repo, "v1.0.1-rc1").join("\n"), /is not like v1\.2\.3/);
});

test("rejects a tag without changelog notes", () => {
  withFiles({ "CHANGELOG.md": `# Changelog\n\n## [${current}] - 2026-01-01\n\n` }, (dir) => {
    cpSync(join(repo, ".claude-plugin"), join(dir, ".claude-plugin"), { recursive: true });
    assert.match(checkTag(dir, `v${current}`).join("\n"), /no notes/);
  });
});

test("the CLI exits 1 on a bad tag and prints notes otherwise", () => {
  const run = (...args) => spawnSync(process.execPath, [join(repo, "scripts/release.mjs"), ...args], { encoding: "utf8" });
  assert.equal(run("check", "v9.9.9").status, 1);
  assert.equal(run("check", `v${current}`).status, 0);
  assert.equal(run("notes", "9.9.9").status, 1);
  assert.match(run("notes", "1.0.1").stdout, /--uninstall/);
  assert.equal(run("nope").status, 1);
});
