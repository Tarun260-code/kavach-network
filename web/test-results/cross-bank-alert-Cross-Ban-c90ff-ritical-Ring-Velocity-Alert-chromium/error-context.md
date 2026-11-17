# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cross-bank-alert.spec.ts >> Cross-Bank Fraud & Ring Velocity Alert >> Runs ZK applicant scan on syndicate suspect and triggers Critical Ring Velocity Alert
- Location: tests\cross-bank-alert.spec.ts:4:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "HDFC Bank • Credit Applicant Kavach Verification"
Received string:    "Screen an applicant"
Timeout: 5000ms

Call log:
  - Expect "toContainText" locator('h1') with timeout 5000ms
  - waiting for locator('h1')
    8 × locator resolved to <h1 class="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight">Screen an applicant</h1>
      - unexpected value "Screen an applicant"

```

```yaml
- heading "Screen an applicant" [level=1]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Cross-Bank Fraud & Ring Velocity Alert", () => {
  4  |   test("Runs ZK applicant scan on syndicate suspect and triggers Critical Ring Velocity Alert", async ({ page }) => {
  5  |     // 1. Visit HDFC loan applicant scanner
  6  |     await page.goto("/bank/hdfc/onboard");
> 7  |     await expect(page.locator("h1")).toContainText("HDFC Bank • Credit Applicant Kavach Verification");
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  8  | 
  9  |     // 2. Select Syndicate Attack demo profile
  10 |     await page.locator("button:has-text('Syndicate Attack (Seed)')").click();
  11 |     await expect(page.locator('input[value="BKUPG8492Q"]')).toBeVisible();
  12 | 
  13 |     // 3. Trigger ZK Check
  14 |     const runBtn = page.locator("button:has-text('Run Kavach Zero-Knowledge Fraud Check')");
  15 |     await runBtn.click();
  16 | 
  17 |     // 4. Verify terminal pipeline runs
  18 |     await expect(page.locator("text=ZK Groth16 Prover Runtime")).toBeVisible();
  19 |     await expect(page.locator("text=Normalise National Identity to BN254 Field Element")).toBeVisible();
  20 | 
  21 |     // 5. Verify Ring Velocity verdict
  22 |     await expect(
  23 |       page.locator("text=CRITICAL ALERT: Multi-Bank Syndicate Stacking")
  24 |     ).toBeVisible({ timeout: 10000 });
  25 |     await expect(page.locator("text=Syndicate Stacking Alert")).toBeVisible();
  26 | 
  27 |     // 6. Open Privacy Inspector and verify client boundary
  28 |     const privacyBtn = page.locator("button:has-text('Privacy Inspector')").first();
  29 |     await privacyBtn.click();
  30 |     await expect(page.locator("text=Zero-Knowledge Privacy Inspector").first()).toBeVisible();
  31 |     await expect(page.locator("text=What Local Bank Sees").first()).toBeVisible();
  32 |     await expect(page.locator("text=What Blockchain Sees").first()).toBeVisible();
  33 |   });
  34 | 
  35 |   test("Evaluates clean applicant and verifies zero fraud match", async ({ page }) => {
  36 |     await page.goto("/bank/sbi/onboard");
  37 |     await page.locator("button:has-text('Clean Applicant (Demo)')").click();
  38 | 
  39 |     await page.locator("button:has-text('Run Kavach Zero-Knowledge Fraud Check')").click();
  40 | 
  41 |     await expect(
  42 |       page.locator("text=CLEAN APPLICANT: Negative Fraud Match")
  43 |     ).toBeVisible({ timeout: 10000 });
  44 |     await expect(page.locator("button:has-text('Approve Loan Application')")).toBeVisible();
  45 |   });
  46 | 
  47 |   test("Real-time cross-bank alert: Bank B screens applicant flagged by Bank A", async ({ browser }) => {
  48 |     // Window 1: Bank A (State Bank of India) dashboard
  49 |     const contextA = await browser.newContext();
  50 |     const pageA = await contextA.newPage();
  51 |     await pageA.goto("/bank/sbi");
  52 |     await expect(pageA.locator("h1")).toContainText("State Bank of India");
  53 |     await expect(pageA.locator("text=Active Fraud Portfolio for SBI")).toBeVisible();
  54 | 
  55 |     // Window 2: Bank B (ICICI Bank) intake scanner
  56 |     const contextB = await browser.newContext();
  57 |     const pageB = await contextB.newPage();
  58 |     await pageB.goto("/bank/icici/onboard");
  59 |     await expect(pageB.locator("h1")).toContainText("ICICI Bank • Credit Applicant Kavach Verification");
  60 | 
  61 |     // Bank B selects identity flagged by SBI (BKUPG8492Q) and screens applicant
  62 |     await pageB.locator("button:has-text('Syndicate Attack (Seed)')").click();
  63 |     await pageB.locator("button:has-text('Run Kavach Zero-Knowledge Fraud Check')").click();
  64 | 
  65 |     // Verify Bank B sees Match & Critical Alert
  66 |     await expect(
  67 |       pageB.locator("text=CRITICAL ALERT: Multi-Bank Syndicate Stacking")
  68 |     ).toBeVisible({ timeout: 15000 });
  69 | 
  70 |     // In Window 1 (Bank A dashboard), verify real-time cross-bank alert appears in Toast and Network Activity
  71 |     await expect(
  72 |       pageA.locator("text=An identity you flagged was presented at ICICI Bank").first()
  73 |     ).toBeVisible({ timeout: 15000 });
  74 | 
  75 |     await contextA.close();
  76 |     await contextB.close();
  77 |   });
  78 | });
  79 | 
  80 | 
```