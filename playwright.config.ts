// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests", // Directory where your tests are located
  fullyParallel: true,
  reporter: "html", // Generates a nice HTML report after tests run
  use: {
    baseURL: "http://localhost:5173", // Base URL of your running app
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
