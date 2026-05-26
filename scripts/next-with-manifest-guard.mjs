import { mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";

const args = process.argv.slice(2);

if (!args.length) {
  console.error("Usage: node scripts/next-with-manifest-guard.mjs <next args...>");
  process.exit(1);
}

const distDir = join(process.cwd(), ".next", "server");
const rootAppDir = join(process.cwd(), "app");
let createdAppSymlink = false;

async function ensureManifest(file, content) {
  const path = join(distDir, file);
  if (existsSync(path)) return;
  await mkdir(distDir, { recursive: true });
  await writeFile(path, JSON.stringify(content), "utf8");
}

async function ensureManifests() {
  await Promise.all([
    ensureManifest("pages-manifest.json", {
      "/_app": "pages/_app.js",
      "/_document": "pages/_document.js",
      "/_error": "pages/_error.js",
      "/legacy-health": "pages/legacy-health.js",
    }),
  ]);
}

if (args[0] === "build" && !existsSync(rootAppDir)) {
  await symlink("src/app", rootAppDir, "dir");
  createdAppSymlink = true;
}

await ensureManifests();

const guard = setInterval(() => {
  ensureManifests().catch(() => {});
}, 50);

const child = spawn("next", args, {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

function stop(signal) {
  clearInterval(guard);
  if (!child.killed) child.kill(signal);
}

async function cleanup() {
  clearInterval(guard);
  if (createdAppSymlink) {
    await rm(rootAppDir, { force: true });
  }
}

process.on("SIGINT", () => {
  stop("SIGINT");
});
process.on("SIGTERM", () => {
  stop("SIGTERM");
});

child.on("exit", async (code, signal) => {
  await cleanup();
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
