import { test, expect } from "@playwright/test";

test.describe("Kavach Network Replay Mode Verification", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate with ?mode=replay query parameter to force ReplayProvider
    await page.goto("/?mode=replay");
  });

  test("a & b: Landing page and bank console load cleanly with no offline banner and calm replay pill", async ({
    page,
  }) => {
    await page.goto("/?mode=replay");

    // Check landing page loads
    await expect(page.locator("h1")).toBeVisible();

    // Verify RPC OFFLINE banner is NOT shown
    const offlineBanner = page.locator("text=RPC Offline");
    await expect(offlineBanner).not.toBeVisible();
    const nodeUnreachable = page.locator("text=Consortium Node Disconnected");
    await expect(nodeUnreachable).not.toBeVisible();

    // Navigate to bank console
    await page.goto("/bank/meridian?mode=replay");

    // Verify replay pill is visible in top bar with expected tooltip
    const replayPill = page.locator('[data-testid="replay-pill"]');
    await expect(replayPill).toBeVisible();
    await expect(replayPill).toContainText("Demo snapshot (read-only)");
    await expect(replayPill).toHaveAttribute(
      "title",
      "This hosted demo replays recorded data. Run locally for live transactions."
    );

    // Verify no offline banner on bank dashboard
    await expect(offlineBanner).not.toBeVisible();
  });

  test("c: Screening known-flagged demo ID (BKUPG8492Q) generates proof and displays FLAGGED + Verified locally (no chain)", async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.goto("/bank/meridian/screen?mode=replay");

    // Enter known-flagged applicant ID into input#applicant-id
    const input = page.locator("#applicant-id");
    await expect(input).toBeVisible();
    await input.fill("BKUPG8492Q");

    // Click Screen applicant
    const screenButton = page.locator('button[type="submit"]:has-text("Screen applicant")');
    await expect(screenButton).toBeEnabled();
    await screenButton.click();

    // Wait for screening and proof verification to complete
    await expect(page.getByText(/FLAGGED/i).first()).toBeVisible({ timeout: 60000 });
    await expect(page.locator("text=Verified locally (no chain)")).toBeVisible();
  });

  test("d: Screening clean demo ID (ABCDE9999Z) completes and displays CLEAR + Verified locally (no chain)", async ({
    page,
  }) => {
    test.setTimeout(45000);
    await page.goto("/bank/meridian/screen?mode=replay");

    // Enter clean applicant ID into input#applicant-id
    const input = page.locator("#applicant-id");
    await expect(input).toBeVisible();
    await input.fill("ABCDE9999Z");

    const screenButton = page.locator('button[type="submit"]:has-text("Screen applicant")');
    await expect(screenButton).toBeEnabled();
    await screenButton.click();

    // Wait for screening result
    await expect(page.getByText("CLEAR • Local Screening Clear")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("text=Verified locally (no chain)")).toBeVisible();
  });

  test("e: Flag page has Run locally to submit and working simulation preview", async ({
    page,
  }) => {
    await page.goto("/bank/meridian/flag?mode=replay");

    // Check preview button is visible
    const previewBtn = page.locator('[data-testid="preview-simulation-button"]');
    await expect(previewBtn).toBeVisible();

    // Fill an identifier
    const idInput = page.locator("#applicant-id");
    await expect(idInput).toBeVisible();
    await idInput.fill("ABCDE1234F");

    // Click preview simulation
    await previewBtn.click();

    // Verify simulation preview card appears with "Simulation, not saved" label
    await expect(page.getByText("Simulation, not saved", { exact: true }).first()).toBeVisible();
    await expect(page.locator("text=Simulated Commitment Preview")).toBeVisible();

    // Click Review commitment to open dialog
    const reviewBtn = page.locator('button:has-text("Review commitment")');
    await reviewBtn.click();

    // Verify "Run locally to submit" is present inside the dialog
    const runLocallyBtn = page.locator('[data-testid="run-locally-submit"]');
    await expect(runLocallyBtn).toBeVisible();
    await expect(runLocallyBtn).toContainText("Run locally to submit");
  });

  test("f: Ledger & Network activity show recent relative timestamps", async ({
    page,
  }) => {
    await page.goto("/network?mode=replay");

    // Verify relative times like "m ago" or "h ago" are present
    const relativeTime = page.locator('text=/\\d+[mh] ago/');
    await expect(relativeTime.first()).toBeVisible({ timeout: 15000 });
  });
});
