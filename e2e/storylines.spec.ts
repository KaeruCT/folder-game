import { expect, type Page, test } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function clickItem(page: Page, name: string) {
    await page.locator(`.directory-item[title="${name}"]`).click();
}

async function openFile(page: Page, name: string) {
    await clickItem(page, name);
    await expect(page.locator(".file-viewer")).toBeVisible();
}

async function closeFile(page: Page) {
    await page.locator(".file-viewer .close-button").click();
    await expect(page.locator(".file-viewer")).not.toBeVisible();
}

async function enterDir(page: Page, name: string) {
    await clickItem(page, name);
    await expect(page.locator(".header-bar")).toContainText(name);
}

async function goUp(page: Page) {
    await page.locator(".directory-item").first().click();
}

/** Unlock a locked node. After confirming, the file auto-opens (for files)
 *  or auto-navigates (for directories). */
async function unlockItem(page: Page, name: string) {
    await clickItem(page, name);
    const modal = page.locator(".modal");
    await expect(modal).toBeVisible();
    await modal.locator(".styled-button", { hasText: "OK" }).click();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("Storyline: The Lockdown", () => {
    test.beforeEach(async ({ page }) => {
        // Disable typewriter animation for test speed
        await page.addInitScript(() => {
            window.__TYPEWRITER_SPEED__ = 1;
        });

        await page.goto("/");
        await page.locator(".storyline-card", { hasText: "The Lockdown" }).click();
        await expect(page.locator(".view-container")).toBeVisible();
    });

    test("directory navigation and file viewing", async ({ page }) => {
        await enterDir(page, "programs");

        await openFile(page, "trace.exe");
        await expect(page.locator(".file-viewer .file-text")).toBeVisible();
        await closeFile(page);

        // Go back to root via up button
        await goUp(page);
    });

    test("locked file unlock flow", async ({ page }) => {
        // Navigate to evan's diary
        await enterDir(page, "users");
        await enterDir(page, "evan");
        await enterDir(page, "diary");

        // Unlock may1.txt — file auto-opens after unlock
        await unlockItem(page, "may1.txt");
        await expect(page.locator(".file-viewer")).toBeVisible();
        await expect(page.locator(".file-text")).toContainText("I am writing this");
        await closeFile(page);

        // Open it again explicitly
        await openFile(page, "may1.txt");
        await closeFile(page);
    });

    test("executable runs and creates files", async ({ page }) => {
        await enterDir(page, "sys");
        await enterDir(page, "safe");

        await openFile(page, "lucky7.exe");
        await expect(page.locator(".file-viewer .file-text")).toBeVisible();
        await closeFile(page);

        await openFile(page, "user_info.exe");
        await expect(page.locator(".file-viewer .file-text")).toContainText("user report");
        await closeFile(page);
    });

    test("full narrative path to ending", async ({ page }) => {
        // ── Diary ──
        await enterDir(page, "users");
        await enterDir(page, "evan");
        await enterDir(page, "diary");

        await unlockItem(page, "may1.txt");
        await expect(page.locator(".file-viewer")).toBeVisible();
        await closeFile(page);

        await unlockItem(page, "may8.txt");
        await expect(page.locator(".file-viewer")).toBeVisible();
        await closeFile(page);

        // may12 and jun3 should now be visible
        await openFile(page, "may12.txt");
        await closeFile(page);

        await openFile(page, "jun3.txt");
        await closeFile(page);

        // ── Notes ──
        await goUp(page); // back to evan/
        await enterDir(page, "notes");
        await openFile(page, "contacts.txt");
        await expect(page.locator(".file-text")).toContainText("Sarah Chen");
        await closeFile(page);

        // ── Lockdown ──
        await goUp(page); // evan/
        await goUp(page); // users/
        await goUp(page); // root
        await enterDir(page, "sys");
        await enterDir(page, "safe");
        await openFile(page, "lucky7.exe");
        await closeFile(page);

        // ── Truth ──
        await goUp(page); // sys/
        await goUp(page); // root
        await openFile(page, "lockout.txt");
        await closeFile(page);

        await enterDir(page, "truth");
        await openFile(page, "the_discovery.txt");
        await closeFile(page);

        // ── Resolve & ending ──
        await goUp(page); // root
        await openFile(page, "resolve.txt");

        // Choice buttons
        const choices = page.locator(".file-viewer .styled-button");
        await expect(choices).toHaveCount(3);

        // Expose everything
        await choices.first().click();

        await openFile(page, "ending_expose.txt");
        await expect(page.locator(".file-text")).toContainText("You uploaded everything");
        await closeFile(page);
    });
});
