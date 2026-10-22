import { defineConfig } from "@playwright/test";

const BACKEND_PORT = 4000;
const FRONTEND_PORT = 5173;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${FRONTEND_PORT}`,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "npm run dev",
      url: `http://localhost:${BACKEND_PORT}/api/health`,
      reuseExistingServer: true,
      timeout: 60_000,
      cwd: "../backend",
    },
    {
      command: "npm run dev",
      url: `http://localhost:${FRONTEND_PORT}`,
      reuseExistingServer: true,
      timeout: 60_000,
      cwd: ".",
    },
  ],
});
