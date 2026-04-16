import { test, expect } from "@playwright/test";
import * as path from "path";

const STORAGE_STATE = path.resolve(__dirname, "storageState.json");

test.use({ storageState: STORAGE_STATE });

// All 19 feature flags mapped to their UI label (order matches the page)
const FLAGS: { key: string; label: string }[] = [
  // Pages
  { key: "ourStoryPageEnabled", label: "Our Story" },
  { key: "eventDetailsPageEnabled", label: "Event Details" },
  { key: "travelPageEnabled", label: "Travel & Stay" },
  { key: "weddingPartyPageEnabled", label: "Wedding Party" },
  { key: "entertainmentPageEnabled", label: "Entertainment" },
  { key: "musicPageEnabled", label: "Song Requests" },
  { key: "galleryPageEnabled", label: "Gallery" },
  { key: "photosOfUsPageEnabled", label: "Photos of Us" },
  { key: "registryPageEnabled", label: "Registry" },
  { key: "faqPageEnabled", label: "FAQ" },
  { key: "contactPageEnabled", label: "Contact" },
  // Features
  { key: "rsvpEnabled", label: "RSVP" },
  { key: "guestBookEnabled", label: "Guest Book" },
  { key: "songRequestsEnabled", label: "Song Requests" },
  { key: "photoUploadEnabled", label: "Photo Uploads" },
  { key: "guestPhotoSharingEnabled", label: "Photo Sharing" },
  { key: "liveGuestCountEnabled", label: "Live Guest Count" },
  // Integrations
  { key: "registrySyncEnabled", label: "Registry Sync" },
  { key: "massEmailEnabled", label: "Mass Email" },
];

/** Get the nth toggle with a given aria-label (handles duplicate labels like "Song Requests"). */
function getToggle(page: import("@playwright/test").Page, label: string, nthForLabel: number) {
  return page.locator(`button[role="switch"][aria-label="Toggle ${label}"]`).nth(nthForLabel);
}

test.describe("Admin Features", () => {
  test.describe.configure({ mode: "serial" });

  let originalStates: Record<string, boolean> = {};

  test("should load the features page", async ({ page }) => {
    await page.goto("/admin/features");
    await expect(
      page.locator("h1, h2").filter({ hasText: "Feature Management" }).first()
    ).toBeVisible();

    for (const title of ["Pages", "Features", "Integrations"]) {
      await expect(page.locator("h2").filter({ hasText: title }).first()).toBeVisible();
    }
  });

  test("should snapshot all original toggle states", async ({ page }) => {
    await page.goto("/admin/features");
    await expect(page.locator('button[role="switch"]').first()).toBeVisible();

    const labelCounts: Record<string, number> = {};
    for (const flag of FLAGS) {
      const idx = labelCounts[flag.label] ?? 0;
      labelCounts[flag.label] = idx + 1;

      const toggle = getToggle(page, flag.label, idx);
      const ariaChecked = await toggle.getAttribute("aria-checked");
      originalStates[flag.key] = ariaChecked === "true";
    }

    expect(Object.keys(originalStates).length).toBe(FLAGS.length);
  });

  test("should toggle each flag and verify API response", async ({ page }) => {
    await page.goto("/admin/features");
    await expect(page.locator('button[role="switch"]').first()).toBeVisible();

    const labelCounts: Record<string, number> = {};
    for (const flag of FLAGS) {
      const idx = labelCounts[flag.label] ?? 0;
      labelCounts[flag.label] = idx + 1;

      const toggle = getToggle(page, flag.label, idx);

      const responsePromise = page.waitForResponse(
        (resp) =>
          resp.url().includes("/api/v1/admin/features") &&
          resp.request().method() === "PUT"
      );

      await toggle.click();

      const response = await responsePromise;
      expect(response.status(), `PUT for ${flag.key} should succeed`).toBe(200);
    }
  });

  test("should verify toggled states persist after reload", async ({ page }) => {
    await page.goto("/admin/features");
    await expect(page.locator('button[role="switch"]').first()).toBeVisible();

    const labelCounts: Record<string, number> = {};
    for (const flag of FLAGS) {
      const idx = labelCounts[flag.label] ?? 0;
      labelCounts[flag.label] = idx + 1;

      const toggle = getToggle(page, flag.label, idx);
      const ariaChecked = await toggle.getAttribute("aria-checked");
      const actualState = ariaChecked === "true";
      const expected = !originalStates[flag.key];

      expect(actualState, `${flag.key} should be toggled to ${expected}`).toBe(expected);
    }
  });

  test("should restore all original toggle states", async ({ page }) => {
    await page.goto("/admin/features");
    await expect(page.locator('button[role="switch"]').first()).toBeVisible();

    const labelCounts: Record<string, number> = {};
    for (const flag of FLAGS) {
      const idx = labelCounts[flag.label] ?? 0;
      labelCounts[flag.label] = idx + 1;

      const toggle = getToggle(page, flag.label, idx);

      const responsePromise = page.waitForResponse(
        (resp) =>
          resp.url().includes("/api/v1/admin/features") &&
          resp.request().method() === "PUT"
      );

      await toggle.click();
      await responsePromise;
    }
  });

  test("should verify all flags restored to original state", async ({ page }) => {
    await page.goto("/admin/features");
    await expect(page.locator('button[role="switch"]').first()).toBeVisible();

    const labelCounts: Record<string, number> = {};
    for (const flag of FLAGS) {
      const idx = labelCounts[flag.label] ?? 0;
      labelCounts[flag.label] = idx + 1;

      const toggle = getToggle(page, flag.label, idx);
      const ariaChecked = await toggle.getAttribute("aria-checked");
      const actualState = ariaChecked === "true";

      expect(actualState, `${flag.key} should be restored to ${originalStates[flag.key]}`).toBe(
        originalStates[flag.key]
      );
    }
  });
});
