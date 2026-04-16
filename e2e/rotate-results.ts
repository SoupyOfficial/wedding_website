/**
 * Rotates Playwright test results and reports, keeping the last N runs.
 *
 * Usage:
 *   npx tsx e2e/rotate-results.ts          # archive current results (pre-test)
 *   npx tsx e2e/rotate-results.ts --post   # copy latest results into history (post-test)
 *
 * History is stored in e2e/test-history/<timestamp>/ with:
 *   - test-results/   (videos, screenshots, traces)
 *   - playwright-report/ (HTML report)
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const HISTORY_DIR = path.join(ROOT, "e2e", "test-history");
const RESULTS_DIR = path.join(ROOT, "test-results");
const REPORT_DIR = path.join(ROOT, "playwright-report");
const MAX_RUNS = 5;

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyDirSync(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function rmDirSync(dir: string) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

/** Prune oldest runs, keeping only the last MAX_RUNS. */
function pruneHistory() {
  if (!fs.existsSync(HISTORY_DIR)) return;

  const runs = fs
    .readdirSync(HISTORY_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort(); // timestamp names sort chronologically

  while (runs.length > MAX_RUNS) {
    const oldest = runs.shift()!;
    const oldPath = path.join(HISTORY_DIR, oldest);
    console.log(`🗑  Removing old run: ${oldest}`);
    rmDirSync(oldPath);
  }
}

/** Archive current results into a timestamped folder. */
function archiveResults() {
  const hasResults = fs.existsSync(RESULTS_DIR);
  const hasReport = fs.existsSync(REPORT_DIR);

  if (!hasResults && !hasReport) {
    console.log("ℹ  No results to archive.");
    return;
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19);

  const runDir = path.join(HISTORY_DIR, timestamp);
  ensureDir(runDir);

  if (hasResults) {
    console.log(`📦 Archiving test-results → ${path.relative(ROOT, runDir)}/test-results`);
    copyDirSync(RESULTS_DIR, path.join(runDir, "test-results"));
  }

  if (hasReport) {
    console.log(`📦 Archiving playwright-report → ${path.relative(ROOT, runDir)}/playwright-report`);
    copyDirSync(REPORT_DIR, path.join(runDir, "playwright-report"));
  }

  pruneHistory();

  const remaining = fs.existsSync(HISTORY_DIR)
    ? fs.readdirSync(HISTORY_DIR, { withFileTypes: true }).filter((d) => d.isDirectory()).length
    : 0;
  console.log(`✅ Archived. ${remaining} run(s) in history (max ${MAX_RUNS}).`);
}

archiveResults();
