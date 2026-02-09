import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./test/setup.ts"],
    env: {
      NODE_ENV: "test",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "test/",
        "dist/",
        "**/*.config.ts",
        "**/*.d.ts",
      ],
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    // Run test files sequentially to avoid database race conditions
    fileParallelism: false,
    // Run tests within each file sequentially
    sequence: {
      concurrent: false,
    },
  },
});
