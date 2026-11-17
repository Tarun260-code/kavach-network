# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cross-bank-alert.spec.ts >> Cross-Bank Fraud & Ring Velocity Alert >> Evaluates clean applicant and verifies zero fraud match
- Location: tests\cross-bank-alert.spec.ts:35:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text(\'Clean Applicant (Demo)\')')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - complementary "Sidebar navigation" [ref=e3]:
      - generic [ref=e4]:
        - link "Kavach Shield Logo Kavach Network" [ref=e5] [cursor=pointer]:
          - /url: /
          - generic [ref=e6]:
            - img "Kavach Shield Logo" [ref=e7]
            - generic [ref=e16]:
              - generic [ref=e17]: Kavach
              - generic [ref=e18]: Network
        - button "Collapse sidebar" [ref=e19] [cursor=pointer]
      - button "Aurum Bank Bengaluru Central Financial Hub" [ref=e24] [cursor=pointer]:
        - generic [ref=e25]: AU
        - generic [ref=e28]:
          - generic [ref=e29]: Aurum Bank
          - generic [ref=e33]: Bengaluru Central Financial Hub
      - navigation [ref=e34]:
        - generic [ref=e35]:
          - generic [ref=e36]: Consortium protocols
          - list [ref=e37]:
            - listitem [ref=e38]:
              - link "Home" [ref=e39] [cursor=pointer]:
                - /url: /bank/sbi
            - listitem [ref=e45]:
              - link "Screen applicant" [ref=e46] [cursor=pointer]:
                - /url: /bank/sbi/screen
            - listitem [ref=e52]:
              - link "Flag identity" [ref=e53] [cursor=pointer]:
                - /url: /bank/sbi/flag
            - listitem [ref=e57]:
              - link "Network activity" [ref=e58] [cursor=pointer]:
                - /url: /network
            - listitem [ref=e64]:
              - link "Appeals" [ref=e65] [cursor=pointer]:
                - /url: /appeals
            - listitem [ref=e71]:
              - link "Trust & privacy" [ref=e72] [cursor=pointer]:
                - /url: /trust
      - generic [ref=e78]:
        - generic [ref=e79]: Network healthy
        - link "Trust & privacy" [ref=e84] [cursor=pointer]:
          - /url: /trust
    - generic [ref=e85]:
      - banner [ref=e86]:
        - generic [ref=e88]:
          - generic [ref=e89]: Consortium
          - generic [ref=e90]: /
          - generic [ref=e91]: Aurum Bank
          - generic [ref=e92]: /
          - generic [ref=e93]: Screen Applicant
        - generic [ref=e94]:
          - button "Search ⌘K" [ref=e95] [cursor=pointer]:
            - generic [ref=e99]: ⌘K
          - status "Network healthy" [ref=e100]
          - button "Notifications (2 unread)" [ref=e105] [cursor=pointer]
          - button "AU - Aurum Bank preferences" [ref=e110] [cursor=pointer]:
            - generic [ref=e111]: AU
      - region "Cross-Bank Alert" [ref=e114]:
        - generic [ref=e115]:
          - generic [ref=e116]:
            - heading "Cross-Bank Alert" [level=4] [ref=e119]
            - button "Dismiss alert" [ref=e120] [cursor=pointer]
          - paragraph [ref=e124]: An identity you flagged was presented at Northgate Bank
          - generic [ref=e125]:
            - generic [ref=e126]: "Nullifier: 0x19a99ebe..."
            - link "View hit" [ref=e127] [cursor=pointer]:
              - /url: /bank/sbi
      - main [ref=e131]:
        - generic [ref=e132]:
          - generic [ref=e133]:
            - link "Back to Underwriting Home" [ref=e134] [cursor=pointer]:
              - /url: /bank/sbi
            - button "How this stays private" [ref=e138] [cursor=pointer]
          - generic [ref=e144]:
            - generic [ref=e145]:
              - heading "Screen an applicant" [level=1] [ref=e146]
              - paragraph [ref=e147]: Evaluate applicant national credentials against the consortium registry without revealing raw PII.
            - generic [ref=e149]:
              - generic [ref=e150]:
                - generic [ref=e151]:
                  - generic [ref=e152]: National Identifier (PAN or Aadhaar)
                  - status "PAN detected" [ref=e154]
                - generic [ref=e161]:
                  - textbox "National Identifier (PAN or Aadhaar)" [active] [ref=e162]:
                    - /placeholder: e.g. BKUPG8492Q
                    - text: BKUPG8492Q
                  - button "Mask identifier" [ref=e163] [cursor=pointer]
                - paragraph [ref=e169]: Auto-formats and cleans whitespace. Indian PAN (10 chars) or Aadhaar (12 digits) accepted.
              - generic [ref=e170]:
                - generic [ref=e171]:
                  - generic [ref=e172]: Use demo identity
                  - generic [ref=e173]: Demo data
                - combobox "Use demo identity" [ref=e174] [cursor=pointer]:
                  - option "Select pre-seeded scenario..." [disabled]
                  - option "BKUPG8492Q — Syndicate Loan Stacking (Decline)" [selected]
                  - option "987654321012 — Mule Account Activity (Review)"
                  - option "XYZPQ9876M — Clean Applicant Record (Clear)"
              - button "+ Add application details (optional)" [ref=e176] [cursor=pointer]
              - generic [ref=e180]:
                - button "Screen applicant" [ref=e181] [cursor=pointer]
                - paragraph [ref=e188]: Processed in this browser. The ID is never sent or stored.
    - dialog "Guided First-Run Tour" [ref=e190]:
      - generic [ref=e191]:
        - generic [ref=e192]: Consortium Guided Walkthrough
        - button "Skip tour" [ref=e196] [cursor=pointer]
      - generic [ref=e200]:
        - heading "1. Screen Applicant (Zero-Knowledge)" [level=4] [ref=e201]
        - paragraph [ref=e202]: Evaluate borrower identities using client-side Groth16 zk-SNARKs. The raw PAN/Aadhaar never leaves your browser.
      - generic [ref=e203]:
        - generic [ref=e204]: 1 of 4
        - button "Next" [ref=e211] [cursor=pointer]
  - alert [ref=e220]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Cross-Bank Fraud & Ring Velocity Alert", () => {
  4  |   test("Runs ZK applicant scan on syndicate suspect and triggers Critical Ring Velocity Alert", async ({ page }) => {
  5  |     // 1. Visit HDFC loan applicant scanner
  6  |     await page.goto("/bank/hdfc/onboard");
  7  |     await expect(page.locator("h1")).toContainText("HDFC Bank • Credit Applicant Kavach Verification");
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
> 37 |     await page.locator("button:has-text('Clean Applicant (Demo)')").click();
     |                                                                     ^ Error: locator.click: Test timeout of 30000ms exceeded.
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