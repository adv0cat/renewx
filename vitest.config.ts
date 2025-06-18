import { defineConfig, configDefaults } from "vitest/config";
import { join } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@renewx/core": join(__dirname, "packages/core/index.ts"),
      "@renewx/logger": join(__dirname, "packages/logger/index.ts"),
      "@renewx/vue3": join(__dirname, "packages/vue3/index.ts"),
    },
  },
  test: {
    coverage: {
      provider: "v8",
      exclude: [...configDefaults.exclude],
    },
  },
});
