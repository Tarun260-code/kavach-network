import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = "C:\\Users\\P Sai Tarun\\.gemini\\antigravity\\brain\\f9d09997-741a-4718-9a74-d8088b20aea8\\screenshots";

const VIEWPORTS = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "tablet-1024", width: 1024, height: 768 },
  { name: "mobile-390", width: 390, height: 844 },
];

const THEMES = ["light", "dark"] as const;

async function run() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      console.log(`\n--- Capturing ${vp.name} (${theme}) ---`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: theme,
      });
      const page = await context.newPage();

      // Helper to set theme on document element
      const applyTheme = async () => {
        await page.evaluate((t) => {
          document.documentElement.setAttribute("data-theme", t);
          localStorage.setItem("kavach_theme", t);
        }, theme);
        await page.waitForTimeout(200);
      };

      // 1. Landing Page
      console.log(`[1/7] Landing Page: ${vp.name}-${theme}`);
      await page.goto("http://127.0.0.1:3000/");
      await applyTheme();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `v2-landing-${vp.name}-${theme}.png`),
      });

      // 2. Bank Overview (/bank/sbi)
      console.log(`[2/7] Bank Overview (SBI): ${vp.name}-${theme}`);
      await page.goto("http://127.0.0.1:3000/bank/sbi");
      await applyTheme();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `v2-bank-overview-${vp.name}-${theme}.png`),
      });

      // 3. Screening / Onboarding (/bank/sbi/onboard)
      console.log(`[3/7] Applicant Screening: ${vp.name}-${theme}`);
      await page.goto("http://127.0.0.1:3000/bank/sbi/onboard");
      await applyTheme();
      await page.waitForTimeout(600);
      // Click Demo data profile to populate and run
      const demoBtn = page.locator("button:has-text('Syndicate Attack (Demo data)')");
      if (await demoBtn.count() > 0) {
        await demoBtn.click();
        await page.waitForTimeout(300);
        const screenBtn = page.locator("button:has-text('Run screening')");
        if (await screenBtn.count() > 0) {
          await screenBtn.click();
          // Wait for proof generation to complete
          await page.waitForSelector("text=Flagged identity found", { timeout: 15000 }).catch(() => {});
          await page.waitForTimeout(500);
        }
      }
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `v2-screening-result-${vp.name}-${theme}.png`),
      });

      // 4. Network Telemetry (/network)
      console.log(`[4/7] Network Ledger: ${vp.name}-${theme}`);
      await page.goto("http://127.0.0.1:3000/network");
      await applyTheme();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `v2-network-${vp.name}-${theme}.png`),
      });

      // 5. AppealDAO Governance (/dao)
      console.log(`[5/7] AppealDAO: ${vp.name}-${theme}`);
      await page.goto("http://127.0.0.1:3000/dao");
      await applyTheme();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `v2-dao-${vp.name}-${theme}.png`),
      });

      // 6. Federated Intelligence Simulation (/network/intelligence)
      console.log(`[6/7] Federated Intelligence: ${vp.name}-${theme}`);
      await page.goto("http://127.0.0.1:3000/network/intelligence");
      await applyTheme();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `v2-intelligence-${vp.name}-${theme}.png`),
      });

      // 7. Presenter Mode (/demo)
      console.log(`[7/7] Presenter Pitch Mode: ${vp.name}-${theme}`);
      await page.goto("http://127.0.0.1:3000/demo");
      await applyTheme();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `v2-demo-pitch-${vp.name}-${theme}.png`),
      });

      await context.close();
    }
  }

  await browser.close();
  console.log("\nAll V2 screenshots captured successfully!");
}

run().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});

