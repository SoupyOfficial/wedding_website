import { test, expect, type Page } from "@playwright/test";
import * as path from "path";

const STORAGE_STATE = path.resolve(__dirname, "storageState.json");

test.use({ storageState: STORAGE_STATE });

// ─── Helpers ──────────────────────────────────────────────

/** Get the input/textarea/select closest to a label containing the given text. */
async function fieldByLabel(page: Page, labelText: string) {
  const section = page.locator("form");
  // Try: label wrapping the input (checkbox pattern)
  const wrappingLabel = section.locator(`label`, { hasText: labelText });
  const checkbox = wrappingLabel.locator('input[type="checkbox"]');
  if ((await checkbox.count()) > 0) return checkbox.first();

  // Try: label + next sibling input/textarea/select
  const label = section.locator("label", { hasText: labelText }).first();
  const parent = label.locator("..");
  const input = parent.locator("input, textarea, select").first();
  return input;
}

/** Read the current value of a field by label. */
async function readField(page: Page, labelText: string): Promise<string | boolean> {
  const el = await fieldByLabel(page, labelText);
  const tag = await el.evaluate((e) => e.tagName.toLowerCase());
  const type = await el.getAttribute("type");

  if (type === "checkbox") {
    return el.isChecked();
  }
  if (tag === "select") {
    return el.inputValue();
  }
  return el.inputValue();
}

/** Set the value of a field by label. */
async function setField(page: Page, labelText: string, value: string | boolean) {
  const el = await fieldByLabel(page, labelText);
  const type = await el.getAttribute("type");

  if (type === "checkbox") {
    const checked = await el.isChecked();
    if (checked !== value) await el.click();
    return;
  }

  await el.fill(String(value));
}

// ─── Field definitions ──────────────────────────────────────

interface FieldDef {
  label: string;
  testValue: string | boolean;
}

const TEXT_FIELDS: FieldDef[] = [
  { label: "Couple Name", testValue: "E2E Test Couple" },
  { label: "Hashtag", testValue: "#E2ETest" },
  { label: "Joint Email", testValue: "e2e-joint@test.dev" },
  { label: "Bride Email", testValue: "e2e-bride@test.dev" },
  { label: "Groom Email", testValue: "e2e-groom@test.dev" },
  { label: "Hero Tagline", testValue: "E2E Test Tagline" },
  { label: "Hero Tagline (Post-Wedding)", testValue: "E2E Post-Wedding" },
  { label: "Wedding Time", testValue: "5:00 PM" },
  { label: "Venue Name", testValue: "E2E Test Venue" },
  { label: "Ceremony Type", testValue: "E2E Indoor Ceremony" },
  { label: "Venue Address", testValue: "123 E2E Test St" },
  { label: "Dress Code", testValue: "E2E Casual" },
  { label: "Parking Info", testValue: "E2E Parking Info" },
  { label: "Weather Info", testValue: "E2E Weather Info" },
  { label: "Children Policy", testValue: "E2E Children Welcome" },
  { label: "Notification Email", testValue: "e2e-notify@test.dev" },
  { label: "Banner Color", testValue: "blue" },
  { label: "Banner Text", testValue: "E2E Banner Text" },
  { label: "Banner URL", testValue: "https://e2e-test.dev" },
  { label: "OG Image URL", testValue: "https://e2e-test.dev/og.png" },
  { label: "Photo Share Link", testValue: "https://e2e-test.dev/photos" },
  { label: "OG Description", testValue: "E2E OG Description" },
  { label: "Instagram", testValue: "@e2etest" },
  { label: "Facebook", testValue: "https://facebook.com/e2etest" },
  { label: "TikTok", testValue: "@e2etiktok" },
];

const TEXTAREA_FIELDS: FieldDef[] = [
  { label: "Our Story Content", testValue: "E2E Our Story Content" },
  { label: "Travel Content", testValue: "E2E Travel Content" },
  { label: "FAQ Page Intro", testValue: "E2E FAQ Content" },
  { label: "Pre-Wedding Content", testValue: "E2E Pre-Wedding" },
  { label: "Post-Wedding Content", testValue: "E2E Post-Wedding Content" },
  { label: "Registry Note", testValue: "E2E Registry Note" },
  { label: "Entertainment Note", testValue: "E2E Entertainment Note" },
];

const CHECKBOX_FIELDS: FieldDef[] = [
  { label: "Notify on RSVP", testValue: false },
  { label: "Password Protection Enabled", testValue: false },
  { label: "Banner Active", testValue: true },
];

// ─── Tests ──────────────────────────────────────────────────

test.describe("Admin Settings", () => {
  test.describe.configure({ mode: "serial" });

  let originalValues: Record<string, string | boolean> = {};

  test("should load the settings page", async ({ page }) => {
    await page.goto("/admin/settings");
    await expect(page.locator("h1, h2").filter({ hasText: "Settings" }).first()).toBeVisible();
    // Wait for the form to be populated (couple name should not be empty)
    const coupleNameField = await fieldByLabel(page, "Couple Name");
    await expect(coupleNameField).not.toHaveValue("");
  });

  test("should snapshot all original values", async ({ page }) => {
    await page.goto("/admin/settings");
    // Wait for form to load
    const coupleNameField = await fieldByLabel(page, "Couple Name");
    await expect(coupleNameField).not.toHaveValue("");

    for (const field of [...TEXT_FIELDS, ...TEXTAREA_FIELDS, ...CHECKBOX_FIELDS]) {
      originalValues[field.label] = await readField(page, field.label);
    }
    // Also snapshot the raffle dropdown
    originalValues["Universal Ticket Raffle Count"] = await readField(
      page,
      "Universal Ticket Raffle Count"
    );
  });

  test("should modify all text fields and save", async ({ page }) => {
    await page.goto("/admin/settings");
    const coupleNameField = await fieldByLabel(page, "Couple Name");
    await expect(coupleNameField).not.toHaveValue("");

    // Set all text fields
    for (const field of TEXT_FIELDS) {
      await setField(page, field.label, field.testValue);
    }

    // Set all textarea fields
    for (const field of TEXTAREA_FIELDS) {
      await setField(page, field.label, field.testValue);
    }

    // Click save
    await page.click('button[type="submit"]');

    // Assert success
    await expect(page.locator("text=Settings saved successfully")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("should verify text fields persisted after reload", async ({ page }) => {
    await page.goto("/admin/settings");
    const coupleNameField = await fieldByLabel(page, "Couple Name");
    await expect(coupleNameField).not.toHaveValue("");

    for (const field of TEXT_FIELDS) {
      const current = await readField(page, field.label);
      expect(current, `${field.label} should be test value`).toBe(field.testValue);
    }

    for (const field of TEXTAREA_FIELDS) {
      const current = await readField(page, field.label);
      expect(current, `${field.label} should be test value`).toBe(field.testValue);
    }
  });

  test("should modify all checkbox fields and save", async ({ page }) => {
    await page.goto("/admin/settings");
    const coupleNameField = await fieldByLabel(page, "Couple Name");
    await expect(coupleNameField).not.toHaveValue("");

    for (const field of CHECKBOX_FIELDS) {
      await setField(page, field.label, field.testValue);
    }

    await page.click('button[type="submit"]');
    await expect(page.locator("text=Settings saved successfully")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("should verify checkbox fields persisted after reload", async ({ page }) => {
    await page.goto("/admin/settings");
    const coupleNameField = await fieldByLabel(page, "Couple Name");
    await expect(coupleNameField).not.toHaveValue("");

    for (const field of CHECKBOX_FIELDS) {
      const current = await readField(page, field.label);
      expect(current, `${field.label} should be test value`).toBe(field.testValue);
    }
  });

  test("should modify the raffle dropdown and save", async ({ page }) => {
    await page.goto("/admin/settings");
    const coupleNameField = await fieldByLabel(page, "Couple Name");
    await expect(coupleNameField).not.toHaveValue("");

    const raffleSelect = await fieldByLabel(page, "Universal Ticket Raffle Count");
    await raffleSelect.selectOption("3");

    await page.click('button[type="submit"]');
    await expect(page.locator("text=Settings saved successfully")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("should verify raffle dropdown persisted after reload", async ({ page }) => {
    await page.goto("/admin/settings");
    const coupleNameField = await fieldByLabel(page, "Couple Name");
    await expect(coupleNameField).not.toHaveValue("");

    const raffleValue = await readField(page, "Universal Ticket Raffle Count");
    expect(raffleValue).toBe("3");
  });

  test("should restore all original values", async ({ page }) => {
    await page.goto("/admin/settings");
    const coupleNameField = await fieldByLabel(page, "Couple Name");
    await expect(coupleNameField).not.toHaveValue("");

    for (const field of [...TEXT_FIELDS, ...TEXTAREA_FIELDS, ...CHECKBOX_FIELDS]) {
      if (originalValues[field.label] !== undefined) {
        await setField(page, field.label, originalValues[field.label]);
      }
    }

    // Restore raffle
    const raffleOriginal = originalValues["Universal Ticket Raffle Count"];
    if (raffleOriginal !== undefined) {
      const raffleSelect = await fieldByLabel(page, "Universal Ticket Raffle Count");
      await raffleSelect.selectOption(String(raffleOriginal));
    }

    await page.click('button[type="submit"]');
    await expect(page.locator("text=Settings saved successfully")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("should verify all original values restored", async ({ page }) => {
    await page.goto("/admin/settings");
    const coupleNameField = await fieldByLabel(page, "Couple Name");
    await expect(coupleNameField).not.toHaveValue("");

    for (const field of [...TEXT_FIELDS, ...TEXTAREA_FIELDS]) {
      const current = await readField(page, field.label);
      expect(current, `${field.label} should be restored`).toBe(originalValues[field.label]);
    }

    for (const field of CHECKBOX_FIELDS) {
      const current = await readField(page, field.label);
      expect(current, `${field.label} should be restored`).toBe(originalValues[field.label]);
    }

    const raffleValue = await readField(page, "Universal Ticket Raffle Count");
    expect(raffleValue, "Raffle should be restored").toBe(
      originalValues["Universal Ticket Raffle Count"]
    );
  });
});
