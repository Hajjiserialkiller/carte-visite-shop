import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    globalSetup: "./src/test/globalSetup.ts",
    environment: "node",
    fileParallelism: false,
  },
});
