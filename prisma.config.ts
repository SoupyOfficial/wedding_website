
// Prisma CLI configuration
//
// IMPORTANT: This config is used by Prisma CLI tools (migrate, generate, etc.)
// which need a direct SQLite connection. The production Turso connection is
// handled at runtime by the libSQL adapter in lib/db.ts — NOT by this URL.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // Always use a local SQLite file for CLI tools.
    // Prisma's migration engine cannot connect to Turso (libsql://) directly.
    url: "file:./prisma/dev.db",
  },
});
