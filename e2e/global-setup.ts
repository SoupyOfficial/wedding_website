import { chromium, type FullConfig } from "@playwright/test";
import { execSync } from "child_process";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const STORAGE_STATE_PATH = path.resolve(__dirname, "storageState.json");

async function globalSetup(_config: FullConfig) {
  // 1. Sync remote DB → local test.db
  console.log("\n🔄 Syncing test database from remote...");
  execSync("npx tsx e2e/sync-test-db.ts", {
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env },
  });

  // 2. Login and save auth state
  console.log("🔐 Logging in to admin...");
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const baseURL = "http://localhost:3099";
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }

  await page.goto(`${baseURL}/admin/login`);
  await page.fill('input[type="email"]', adminEmail);
  await page.fill('input[type="password"]', adminPassword);
  await page.click('button[type="submit"]');

  // Wait for redirect to admin dashboard
  await page.waitForURL("**/admin", { timeout: 15_000 });

  await context.storageState({ path: STORAGE_STATE_PATH });
  await browser.close();

  console.log("✅ Auth state saved.\n");
}

export default globalSetup;
