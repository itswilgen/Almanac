import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  workers: 1,
  timeout: 90000,
  expect: { timeout: 10000 },
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://127.0.0.1:5173",
    channel: "chrome",
    headless: true,
    actionTimeout: 12000,
    trace: "retain-on-failure",
  },
  reporter: "list",
});
