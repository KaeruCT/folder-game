import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    timeout: 30_000,
    expect: { timeout: 10_000 },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "list",
    use: {
        baseURL: "http://localhost:5173/folder-game/",
        trace: "on-first-retry",
        launchOptions: {
            args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
            chromiumSandbox: false,
        },
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: {
        command: "pnpm dev --port 5173",
        url: "http://localhost:5173/folder-game/",
        reuseExistingServer: !process.env.CI,
        timeout: 15_000,
    },
});
