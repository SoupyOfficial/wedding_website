import { defineConfig, devices } from "@playwright/test";
import * as path from "path";
import * as dotenv from "dotenv";
import * as fs from "fs";

// Load .env so ADMIN_EMAIL, ADMIN_PASSWORD, NEXTAUTH_SECRET, etc. are available
dotenv.config();

const testDbPath = path.resolve(__dirname, "e2e", "test.db");

// Strip surrounding quotes from env values (PowerShell .env compat)
function strip(val: string | undefined): string {
  return (val ?? "").replace(/^["']|["']$/g, "");
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // Serial — tests share DB state
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 60_000,

  // Artifacts output directory
  outputDir: "./test-results",

  use: {
    baseURL: "http://localhost:3099",

    // Record a video for every test
    video: "on",

    // Capture a screenshot at the end of every test
    screenshot: "on",

    // Collect full trace (DOM snapshots, network, console, actions timeline)
    trace: "on",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  globalSetup: "./e2e/global-setup.ts",

  webServer: {
    command: `npx next dev -p 3099`,
    port: 3099,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // Override DB to use local test.db
      TURSO_DATABASE_URL: `file:${testDbPath}`,
      TURSO_AUTH_TOKEN: "",
      // Pass through required env vars (strip quotes for safety)
      NEXTAUTH_SECRET: strip(process.env.NEXTAUTH_SECRET),
      NEXTAUTH_URL: "http://localhost:3099",
      ADMIN_EMAIL: strip(process.env.ADMIN_EMAIL),
      ADMIN_PASSWORD: strip(process.env.ADMIN_PASSWORD),
    },
  },
});
