#!/usr/bin/env node

/**
 * Migration Drift Check
 *
 * Compares the Prisma schema against the migration history to detect drift.
 * If someone uses `prisma db push` to modify the local database without
 * creating a corresponding migration, this script will catch it.
 *
 * Exit 0 = schema and migrations are in sync
 * Exit 1 = drift detected (schema has changes not captured in migrations)
 *
 * Used by:
 *   - GitHub Actions CI (npm run db:check)
 *   - Git pre-push hook
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const BOLD = "\x1b[1m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

const SHADOW_DB = path.join(process.cwd(), "prisma", "shadow.db");

function cleanShadowDb() {
  try {
    for (const suffix of ["", "-journal", "-wal", "-shm"]) {
      const f = SHADOW_DB + suffix;
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
  } catch {
    // Ignore cleanup errors
  }
}

function run(cmd: string): string {
  return execSync(cmd, {
    encoding: "utf-8",
  }).trim();
}

console.log(`\n${BOLD}🔍 Checking for Prisma migration drift...${RESET}\n`);

// Always start with a clean shadow database
cleanShadowDb();

try {
  // Compare the current schema against what the migrations would produce.
  // --from-migrations uses the migration SQL files (not the local DB).
  // --to-schema-datamodel uses the schema.prisma file.
  // If they match, the output is empty. If there's drift, it prints SQL.
  const diff = run(
    `npx prisma migrate diff \
      --from-migrations prisma/migrations \
      --to-schema-datamodel prisma/schema.prisma \
      --shadow-database-url "file:prisma/shadow.db" \
      --exit-code`
  );

  // If we get here with exit code 0, migrations are in sync
  console.log(`${GREEN}✅ Migrations are in sync with schema.prisma${RESET}\n`);
  process.exit(0);
} catch (error: unknown) {
  const execError = error as { status?: number; stdout?: string; stderr?: string };

  if (execError.status === 2) {
    // Exit code 2 from --exit-code means drift was detected
    console.error(`${RED}${BOLD}❌ Migration drift detected!${RESET}\n`);
    console.error(
      `${YELLOW}Your schema.prisma has changes that are not captured in a migration.${RESET}`
    );
    console.error(
      `${YELLOW}This usually happens when you use 'prisma db push' instead of 'prisma migrate dev'.${RESET}\n`
    );
    console.error(`${BOLD}To fix this, run:${RESET}`);
    console.error(
      `  DATABASE_URL="file:./prisma/dev.db" npx prisma migrate dev --name describe_your_change\n`
    );
    console.error(
      `This will create a proper migration file that can be deployed to production.\n`
    );

    // Show the actual diff so the developer can see what's missing
    if (execError.stdout) {
      console.error(`${BOLD}Pending changes (SQL that needs a migration):${RESET}`);
      console.error(execError.stdout);
    }

    process.exit(1);
  }

  // Some other error (prisma not installed, config issue, etc.)
  console.error(`${RED}Error running migration diff:${RESET}`);
  if (execError.stderr) console.error(execError.stderr);
  if (execError.stdout) console.error(execError.stdout);
  process.exit(1);
} finally {
  cleanShadowDb();
}
