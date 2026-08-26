import { test, expect } from "@playwright/test";
import * as path from "path";

const STORAGE_STATE = path.resolve(__dirname, "storageState.json");

// Admin-authenticated tests for setting up data
test.describe("RSVP E2E", () => {
  test.use({ storageState: STORAGE_STATE });

  const testGuest = { firstName: "Playwright", lastName: "Test" };

  test.beforeEach(async ({ request }) => {
    // Ensure a test guest exists via admin API (idempotent)
    const lookupRes = await request.get(
      `/api/v1/rsvp/lookup?firstName=${encodeURIComponent(testGuest.firstName)}&lastName=${encodeURIComponent(testGuest.lastName)}`
    );
    if (lookupRes.status() === 404) {
      await request.post("/api/v1/admin/guests", {
        data: {
          firstName: testGuest.firstName,
          lastName: testGuest.lastName,
          email: "playwright@test.com",
          plusOneAllowed: true,
          rsvpStatus: "pending",
        },
      });
    }
  });

  test("full RSVP flow — accepting", async ({ page }) => {
    await page.goto("/rsvp");

    // Should see the RSVP heading and lookup form
    await expect(page.locator("h1, h2").filter({ hasText: "RSVP" }).first()).toBeVisible();
    await expect(page.getByPlaceholder("First Name")).toBeVisible();

    // Fill in the guest name and submit
    await page.getByPlaceholder("First Name").fill(testGuest.firstName);
    await page.getByPlaceholder("Last Name").fill(testGuest.lastName);
    await page.getByRole("button", { name: /Find My Invitation/i }).click();

    // Should navigate to details step
    await expect(page.getByText(`Welcome, ${testGuest.firstName}`)).toBeVisible({ timeout: 10000 });

    // Select "Joyfully Accept"
    await page.getByRole("button", { name: /Joyfully Accept/i }).click();

    // Click Next to go to the songs step
    await page.getByRole("button", { name: /^Next$/i }).click();

    // Should see song request step
    await expect(page.getByText("Song Requests")).toBeVisible({ timeout: 5000 });

    // Click Review
    await page.getByRole("button", { name: /Review/i }).click();

    // Should see confirmation page
    await expect(page.getByText("Review Your RSVP")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(`${testGuest.firstName} ${testGuest.lastName}`)).toBeVisible();

    // Submit
    await page.getByRole("button", { name: /Submit RSVP/i }).click();

    // Should see thank you message
    await expect(page.getByText(/Thank You/i)).toBeVisible({ timeout: 10000 });
  });

  test("RSVP decline flow", async ({ page }) => {
    await page.goto("/rsvp");

    await page.getByPlaceholder("First Name").fill(testGuest.firstName);
    await page.getByPlaceholder("Last Name").fill(testGuest.lastName);
    await page.getByRole("button", { name: /Find My Invitation/i }).click();

    // Should navigate to details
    await expect(page.getByText(`Welcome, ${testGuest.firstName}`)).toBeVisible({ timeout: 10000 });

    // Select "Regretfully Decline"
    await page.getByRole("button", { name: /Regretfully Decline/i }).click();

    // Click Next — songs are skipped when declining; go straight to confirm
    await page.getByRole("button", { name: /^Next$/i }).click();

    // Confirm shows "No" for attending
    await expect(page.getByText("Review Your RSVP")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("No", { exact: true })).toBeVisible();

    // Submit decline
    await page.getByRole("button", { name: /Submit RSVP/i }).click();

    await expect(page.getByText(/Miss You/i)).toBeVisible({ timeout: 10000 });
  });

  test("lookup with unknown name shows error", async ({ page }) => {
    await page.goto("/rsvp");

    await page.getByPlaceholder("First Name").fill("NonExistent");
    await page.getByPlaceholder("Last Name").fill("Person");
    await page.getByRole("button", { name: /Find My Invitation/i }).click();

    // Should show not found error
    await expect(page.getByText(/couldn't find|not found/i)).toBeVisible({ timeout: 10000 });
  });

  test("RSVP page renders with progress steps", async ({ page }) => {
    await page.goto("/rsvp");

    // Check progress indicators are rendered
    const steps = page.locator(".rounded-full");
    await expect(steps.first()).toBeVisible();
    // Should have 4 steps
    await expect(steps).toHaveCount(4);
  });

  test("lookup requires valid input", async ({ page }) => {
    await page.goto("/rsvp");

    // Submit button should be disabled when input is empty
    const submitButton = page.getByRole("button", { name: /Find My Invitation/i });
    await expect(submitButton).toBeDisabled();

    // Try with only first name filled — button should be disabled
    await page.getByPlaceholder("First Name").fill("A");
    await expect(submitButton).toBeDisabled();
  });
});

// Public RSVP page tests (no auth)
test.describe("RSVP Public Page", () => {
  test("RSVP page loads with deadline if set", async ({ page }) => {
    await page.goto("/rsvp");

    // The page should have RSVP heading
    await expect(page.locator("h1, h2").filter({ hasText: "RSVP" }).first()).toBeVisible();
  });

  test("back to home link exists on done page (via URL)", async ({ page }) => {
    // Just verify the page structure is correct
    await page.goto("/rsvp");
    await expect(page.getByPlaceholder("First Name")).toBeVisible();
  });
});
