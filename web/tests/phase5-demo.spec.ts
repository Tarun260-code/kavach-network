import { test, expect } from "@playwright/test";

test.describe("Phase 5: Presenter Pitch Mode, Privacy Inspector & Federated Intelligence", () => {
  test("Navigates Presenter Mode (/demo) through all 5 pitch steps", async ({ page }) => {
    await page.goto("/demo");
    await expect(page.locator("h1")).toContainText("Consortium Presenter Mode");
    await expect(page.locator("text=Step 1 of 5")).toBeVisible();

    // Step 1: Bank A Flags
    await expect(page.locator("text=1. Bank A Flags a Fraudster")).toBeVisible();
    await expect(page.locator("text=BKUPG8492Q (PAN • In-Memory)")).toBeVisible();

    // Click Next Step -> Step 2: Public Ledger
    await page.locator("button:has-text('Next Step')").click();
    await expect(page.locator("text=Step 2 of 5")).toBeVisible();
    await expect(page.locator("text=2. Public Ledger Shows Only a Cryptographic Hash")).toBeVisible();
    await expect(page.locator("text=0 BYTES (Guaranteed Zero Leakage)")).toBeVisible();

    // Click Next Step -> Step 3: Bank B Screens
    await page.locator("button:has-text('Next Step')").click();
    await expect(page.locator("text=Step 3 of 5")).toBeVisible();
    await expect(page.locator("text=3. Bank B Screens Loan Applicant & Generates ZK Proof")).toBeVisible();

    // Click Next Step -> Step 4: Bank A Alerted
    await page.locator("button:has-text('Next Step')").click();
    await expect(page.locator("text=Step 4 of 5")).toBeVisible();
    await expect(page.locator("text=4. Bank A is Alerted via Real-Time RingHit")).toBeVisible();

    // Click Next Step -> Step 5: AppealDAO Slashing
    await page.locator("button:has-text('Next Step')").click();
    await expect(page.locator("text=Step 5 of 5")).toBeVisible();
    await expect(page.locator("text=5. Wrongful Flag Appealed & Revoked in AppealDAO")).toBeVisible();
    await expect(page.locator("text=DISP99999P (Axis Bank Flagged)")).toBeVisible();
  });

  test("Opens 3-way Privacy Inspector via header and keyboard shortcut", async ({ page }) => {
    await page.goto("/network");
    await expect(page.locator("h1")).toContainText("Consortium Cryptographic Ledger");

    // Click Privacy Inspector button in header
    const privacyBtn = page.locator("button:has-text('Privacy Inspector')").first();
    await privacyBtn.click();

    // Verify 3-way comparison columns are displayed
    await expect(page.locator("text=What Local Bank Sees").first()).toBeVisible();
    await expect(page.locator("text=What Blockchain Sees").first()).toBeVisible();
    await expect(page.getByText("What Other Banks See", { exact: true })).toBeVisible();
    await expect(page.locator("text=Section 4 & 8 • Digital Personal Data Protection Act Compliance")).toBeVisible();

    // Close modal via Escape
    await page.keyboard.press("Escape");
    await expect(page.locator("text=What Blockchain Sees")).not.toBeVisible();

    // Toggle via keyboard shortcut 'P'
    await page.keyboard.press("p");
    await expect(page.locator("text=What Local Bank Sees")).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("Runs Federated Intelligence simulation and computes FedAvg round", async ({ page }) => {
    await page.goto("/network/intelligence");
    await expect(page.locator("text=[SIMULATION ENVIRONMENT • PROTOTYPE ONLY]")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Federated Credit Syndicate Risk Scoring (FedAvg)");

    // Verify local bank models are shown
    await expect(page.locator("text=State Bank of India (SBI)")).toBeVisible();
    await expect(page.locator("text=HDFC Bank (HDFC)")).toBeVisible();
    await expect(page.locator("text=ICICI Bank (ICICI)")).toBeVisible();

    // Click Run FedAvg Round #2
    const trainBtn = page.locator("button:has-text('Run FedAvg Round')");
    await trainBtn.click();
    await expect(page.locator("text=Round #2")).toBeVisible({ timeout: 5000 });

    // Test synthetic borrower slider risk prediction
    await page.locator("button:has-text('Syndicate Suspect')").click();
    await expect(page.locator("text=CRITICAL SYNDICATE STACKING SUSPECT")).toBeVisible();
  });

  test("Displays institutional 404 page for unknown routes", async ({ page }) => {
    await page.goto("/non-existent-consortium-route");
    await expect(page.locator("text=Error 404 • Resource Not Found on Ledger")).toBeVisible();
    await expect(page.locator("text=Non-Existent Consortium Path")).toBeVisible();
    await expect(page.locator("text=Return to Kavach Overview")).toBeVisible();
  });
});
