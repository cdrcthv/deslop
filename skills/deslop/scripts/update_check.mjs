#!/usr/bin/env node
// Prints one line if a newer deslop release exists. Never fails, never runs code.
// Usage: node update_check.mjs [--now]   (--now: ignore cache and opt-out, always answer)
// Opt out: DESLOP_NO_UPDATE_CHECK=1. Only reads a version number from GitHub.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { get } from "node:https";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = "cdrcthv/deslop";
const URL_LATEST = process.env.DESLOP_RELEASE_URL ?? `https://api.github.com/repos/${REPO}/releases/latest`;
const DAY = 24 * 60 * 60 * 1000;
const RETRY = 60 * 60 * 1000;
const TAG = /^v(\d+)\.(\d+)\.(\d+)$/;

// Only a strict vX.Y.Z is ever accepted: nothing else from the network reaches the output.
export const parseTag = (text) => (typeof text === "string" && TAG.test(text) ? text.slice(1) : null);

export function isNewer(latest, current) {
  const [a, b] = [latest, current].map((v) => v.split(".").map(Number));
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i];
  return false;
}

export function notice(latest, current, scriptPath) {
  const head = `deslop ${latest} is available (you have ${current}).`;
  if (/[\\/]plugins[\\/]/.test(scriptPath)) return `${head} Update it from the plugin manager: /plugin`;
  return `${head} Update: npx -y github:${REPO}#v${latest} update`;
}

// Cache first; ask GitHub at most once a day (retry after an hour on failure).
export async function latestVersion({ cacheFile, now, fetchLatest, force }) {
  const cache = readJson(cacheFile);
  if (!force && cache && now - cache.checkedAt < DAY) return parseTag(`v${cache.latest}`);
  const latest = await fetchLatest().catch(() => null);
  const keep = parseTag(`v${cache?.latest}`);
  const fresh = latest ?? keep;
  const checkedAt = latest ? now : now - DAY + RETRY;
  try {
    mkdirSync(dirname(cacheFile), { recursive: true });
    writeFileSync(cacheFile, JSON.stringify({ checkedAt, latest: fresh }));
  } catch {}
  return fresh;
}

export function fetchLatestTag(url = URL_LATEST, timeout = 1500) {
  return new Promise((resolve) => {
    const headers = { "User-Agent": "deslop-update-check", Accept: "application/vnd.github+json" };
    const req = get(url, { headers, timeout }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
        if (body.length > 200_000) req.destroy();
      });
      res.on("end", () => resolve(res.statusCode === 200 ? parseTag(safeJson(body)?.tag_name) : null));
      res.on("close", () => resolve(null));
    });
    req.on("timeout", () => req.destroy());
    req.on("error", () => resolve(null));
  });
}

const safeJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};
const readJson = (file) => {
  try {
    return safeJson(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
};

async function main() {
  const force = process.argv.includes("--now");
  if (!force && (process.env.DESLOP_NO_UPDATE_CHECK || process.env.CI)) return;
  const here = dirname(fileURLToPath(import.meta.url));
  const current = parseTag(`v${readFileSync(join(here, "..", "VERSION"), "utf8").trim()}`);
  if (!current) return;
  const latest = await latestVersion({
    cacheFile: join(homedir(), ".cache", "deslop", "latest.json"),
    now: Date.now(),
    fetchLatest: () => fetchLatestTag(),
    force,
  });
  if (latest && isNewer(latest, current)) console.log(notice(latest, current, here));
  else if (force) console.log(latest ? `deslop ${current} is up to date.` : "Could not check for updates (offline?).");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(() => {});
}
