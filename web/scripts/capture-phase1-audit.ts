import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = "C:\\Users\\P Sai Tarun\\.gemini\\antigravity\\brain\\f9d09997-741a-4718-9a74-d8088b20aea8\\screenshots";

async function run() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // 1. Role-Aware Home (/bank/sbi)
  console.log("[1/5] Capturing Role-Aware Bank Home...");
  await page.goto("http://127.0.0.1:3000/bank/sbi");
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase1-role-aware-home.png"),
  });

  // 2. Dedicated Screen Applicant with Decision Card (/bank/sbi/screen)
  console.log("[2/5] Capturing Screening with Institutional Decision Card...");
  await page.goto("http://127.0.0.1:3000/bank/sbi/screen");
  await page.waitForTimeout(400);
  // Trigger screening on pre-filled syndicate demo profile
  const runBtn = page.locator("button:has-text('Run screening')");
  if (await runBtn.count() > 0) {
    await runBtn.click();
    await page.waitForSelector("text=Decline Recommended", { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(600);
  }
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase1-decision-card.png"),
  });

  // 3. Dedicated Flag Identity Portal (/bank/sbi/flag)
  console.log("[3/5] Capturing Dedicated Flag Identity Portal...");
  await page.goto("http://127.0.0.1:3000/bank/sbi/flag");
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase1-flag-identity.png"),
  });

  // 4. Command Palette (Cmd+K open)
  console.log("[4/5] Capturing Global Command Palette...");
  await page.goto("http://127.0.0.1:3000/bank/sbi");
  await page.waitForTimeout(400);
  await page.keyboard.press("Control+K");
  await page.waitForSelector("text=Type a command", { timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase1-command-palette.png"),
  });

  // 5. Trust & Privacy Architecture (/privacy)
  console.log("[5/5] Capturing Trust & Privacy Architecture...");
  await page.goto("http://127.0.0.1:3000/privacy");
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase1-trust-and-privacy.png"),
  });

  await browser.close();
  console.log("\nAll Phase 1 audit screenshots captured successfully!");
}

run().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});

