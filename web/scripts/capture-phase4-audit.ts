import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = "C:\\Users\\P Sai Tarun\\.gemini\\antigravity\\brain\\f9d09997-741a-4718-9a74-d8088b20aea8\\screenshots";

async function run() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await desktopContext.newPage();

  // Mark tour as completed initially so it doesn't auto-popup during other tests
  await page.addInitScript(() => {
    localStorage.setItem("kavach_tour_v1", "true");
  });

  console.log("--- Starting Phase 4 Interaction & Verification Suite ---");

  // 1. Proof Moment & ProofStage (/bank/meridian/screen)
  console.log("[1/6] Navigating to Screen Applicant and triggering Proof Stage...");
  await page.goto("http://127.0.0.1:3000/bank/meridian/screen");
  await page.waitForTimeout(600);

  // Click the syndicate demo preset button
  const presetBtn = page.locator("button:has-text('Syndicate Attack')");
  if (await presetBtn.count() > 0) {
    await presetBtn.click();
    await page.waitForTimeout(300);
  }

  // Click "Run zero-knowledge screening"
  const screenBtn = page.locator("button:has-text('Run zero-knowledge screening')");
  if (await screenBtn.count() > 0) {
    await screenBtn.click();
  }

  // Wait 700ms to capture active proving animation in progress
  await page.waitForTimeout(700);
  console.log("Capturing live ProofStage with dissolving particles & pipeline...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase4-proof-moment.png"),
  });

  // Wait for proof generation to complete and verdict card to render
  console.log("[2/6] Waiting for Groth16 proof resolution & Decision Card...");
  try {
    await page.waitForSelector("text=Local Memory Only", { timeout: 10000 });
    await page.waitForTimeout(1000);
  } catch {
    await page.waitForTimeout(2000);
  }
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase4-verdict-decision-card.png"),
  });

  // 3. Irreversible Action Confirmation Modal (/bank/meridian/flag)
  console.log("[3/6] Testing Irreversible Action Staking Dialog (/bank/meridian/flag)...");
  await page.goto("http://127.0.0.1:3000/bank/meridian/flag");
  await page.waitForTimeout(600);

  // Click pre-fill test case
  const flagPreset = page.locator("button:has-text('BKUPG8492Q')");
  if (await flagPreset.count() > 0) {
    await flagPreset.click();
    await page.waitForTimeout(300);
  }

  // Click submit to open confirmation dialog
  const flagSubmit = page.locator("button[type='submit']");
  if (await flagSubmit.count() > 0) {
    await flagSubmit.click();
    await page.waitForTimeout(500);
  }

  console.log("Capturing Irreversible Staking Confirmation Dialog...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase4-irreversible-confirmation.png"),
  });

  // Close confirmation modal by pressing Escape
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);

  // 4. Notifications Center & Investigation Drawer (/bank/meridian)
  console.log("[4/6] Testing Notifications Center & Investigation Drawer...");
  await page.goto("http://127.0.0.1:3000/bank/meridian");
  await page.waitForTimeout(600);

  // Click notifications bell
  const bellBtn = page.locator("button[aria-label*='Notifications']").first();
  if (await bellBtn.count() > 0) {
    await bellBtn.click();
    await page.waitForTimeout(400);

    // Click "Open investigation file"
    const openInv = page.locator("text=Open investigation file").first();
    if (await openInv.count() > 0) {
      await openInv.click();
      await page.waitForTimeout(600);
    }
  }

  console.log("Capturing Investigation Drawer...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase4-investigation-drawer.png"),
  });

  // Close drawer
  const closeInvBtn = page.locator("button[aria-label='Close investigation']");
  if (await closeInvBtn.count() > 0) {
    await closeInvBtn.click();
    await page.waitForTimeout(400);
  } else {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  }

  // 5. Guided First-Run Tour Popover
  console.log("[5/6] Testing Guided First-Run Tour Popover...");
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent("kavach:start-tour"));
  });
  await page.waitForTimeout(600);
  console.log("Capturing Guided Tour Coach-Mark...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase4-guided-tour.png"),
  });

  // Close tour
  const closeTourBtn = page.locator("button[aria-label='Skip tour']");
  if (await closeTourBtn.count() > 0) {
    await closeTourBtn.click();
    await page.waitForTimeout(300);
  }

  // 5b. Keyboard Shortcuts Sheet
  console.log("[5b] Testing Keyboard Shortcuts Sheet (pressing ?)...");
  await page.keyboard.press("?");
  await page.waitForTimeout(500);
  console.log("Capturing Shortcuts Sheet...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase4-shortcuts-sheet.png"),
  });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  // 6. Mobile 390px Viewport ProofStage
  console.log("[6/6] Testing Mobile Responsiveness at 390px...");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.addInitScript(() => {
    localStorage.setItem("kavach_tour_v1", "true");
  });
  await mobilePage.goto("http://127.0.0.1:3000/bank/meridian/screen");
  await mobilePage.waitForTimeout(600);
  console.log("Capturing Mobile 390px View...");
  await mobilePage.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase4-mobile-proof-stage.png"),
  });

  await browser.close();
  console.log("\nAll Phase 4 audit screenshots captured successfully!");
}

run().catch((err) => {
  console.error("Phase 4 Test Error:", err);
  process.exit(1);
});
