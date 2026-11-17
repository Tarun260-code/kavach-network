import { test, expect } from "@playwright/test";

test.describe("Cross-Bank Fraud & Ring Velocity Alert", () => {
  test("Runs ZK applicant scan on syndicate suspect and triggers Critical Ring Velocity Alert", async ({ page }) => {
    // 1. Visit HDFC loan applicant scanner
    await page.goto("/bank/hdfc/onboard");
    await expect(page.locator("h1")).toContainText("HDFC Bank • Credit Applicant Kavach Verification");

    // 2. Select Syndicate Attack demo profile
    await page.locator("button:has-text('Syndicate Attack (Seed)')").click();
    await expect(page.locator('input[value="BKUPG8492Q"]')).toBeVisible();

    // 3. Trigger ZK Check
    const runBtn = page.locator("button:has-text('Run Kavach Zero-Knowledge Fraud Check')");
    await runBtn.click();

    // 4. Verify terminal pipeline runs
    await expect(page.locator("text=ZK Groth16 Prover Runtime")).toBeVisible();
    await expect(page.locator("text=Normalise National Identity to BN254 Field Element")).toBeVisible();

    // 5. Verify Ring Velocity verdict
    await expect(
      page.locator("text=CRITICAL ALERT: Multi-Bank Syndicate Stacking")
    ).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Syndicate Stacking Alert")).toBeVisible();

    // 6. Open Privacy Inspector and verify client boundary
    const privacyBtn = page.locator("button:has-text('Privacy Inspector')").first();
    await privacyBtn.click();
    await expect(page.locator("text=Zero-Knowledge Privacy Inspector").first()).toBeVisible();
    await expect(page.locator("text=What Local Bank Sees").first()).toBeVisible();
    await expect(page.locator("text=What Blockchain Sees").first()).toBeVisible();
  });

  test("Evaluates clean applicant and verifies zero fraud match", async ({ page }) => {
    await page.goto("/bank/sbi/onboard");
    await page.locator("button:has-text('Clean Applicant (Demo)')").click();

    await page.locator("button:has-text('Run Kavach Zero-Knowledge Fraud Check')").click();

    await expect(
      page.locator("text=CLEAN APPLICANT: Negative Fraud Match")
    ).toBeVisible({ timeout: 10000 });
    await expect(page.locator("button:has-text('Approve Loan Application')")).toBeVisible();
  });

  test("Real-time cross-bank alert: Bank B screens applicant flagged by Bank A", async ({ browser }) => {
    // Window 1: Bank A (State Bank of India) dashboard
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    await pageA.goto("/bank/sbi");
    await expect(pageA.locator("h1")).toContainText("State Bank of India");
    await expect(pageA.locator("text=Active Fraud Portfolio for SBI")).toBeVisible();

    // Window 2: Bank B (ICICI Bank) intake scanner
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await pageB.goto("/bank/icici/onboard");
    await expect(pageB.locator("h1")).toContainText("ICICI Bank • Credit Applicant Kavach Verification");

    // Bank B selects identity flagged by SBI (BKUPG8492Q) and screens applicant
    await pageB.locator("button:has-text('Syndicate Attack (Seed)')").click();
    await pageB.locator("button:has-text('Run Kavach Zero-Knowledge Fraud Check')").click();

    // Verify Bank B sees Match & Critical Alert
    await expect(
      pageB.locator("text=CRITICAL ALERT: Multi-Bank Syndicate Stacking")
    ).toBeVisible({ timeout: 15000 });

    // In Window 1 (Bank A dashboard), verify real-time cross-bank alert appears in Toast and Network Activity
    await expect(
      pageA.locator("text=An identity you flagged was presented at ICICI Bank").first()
    ).toBeVisible({ timeout: 15000 });

    await contextA.close();
    await contextB.close();
  });
});

