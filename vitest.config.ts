import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./__tests__/setup.ts"],
    include: ["__tests__/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "istanbul",
      include: [
        "lib/**/*.ts",
        "components/**/*.{ts,tsx}",
        "app/api/**/*.ts",
        "middleware.ts",
      ],
      exclude: [
        "lib/db.ts",
        "lib/auth.ts",
        "lib/providers/storage/cloudinary.storage.ts",
        "lib/providers/storage/local.storage.ts",
        "**/*.d.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
