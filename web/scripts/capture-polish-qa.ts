import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = "C:/Users/P Sai Tarun/.gemini/antigravity/brain/f9d09997-741a-4718-9a74-d8088b20aea8/screenshots";

async function main() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { width: 1440, height: 900, name: "1440" },
    { width: 1024, height: 768, name: "1024" },
    { width: 390, height: 844, name: "390" },
  ];

  console.log("=== CAPTURING POLISH SPRINT QA SCREENSHOTS & RUNNING AXE ===");

  for (const vp of viewports) {
    for (const theme of ["light", "dark"] as const) {
      console.log(`\n--- Viewport: ${vp.name}px | Theme: ${theme} ---`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: theme,
      });
      const page = await context.newPage();

      // Dismiss any tour
      await page.addInitScript((th) => {
        localStorage.setItem("kavach_tour_v1", "true");
        localStorage.setItem("kavach_theme", th);
        document.documentElement.setAttribute("data-theme", th);
      }, theme);

      await page.goto("http://localhost:3000/bank/meridian/flag", {
        waitUntil: "networkidle",
        timeout: 30000,
      });

      // Force theme on html root to be certain
      await page.evaluate((th) => {
        document.documentElement.setAttribute("data-theme", th);
      }, theme);
      await page.waitForTimeout(600);

      const filename = path.join(SCREENSHOT_DIR, `polish-flag-${vp.name}-${theme}.png`);
      await page.screenshot({ path: filename, fullPage: true });
      console.log(`Saved screenshot: ${filename}`);

      // Run Axe on 1440 light & dark
      if (vp.name === "1440") {
        console.log(`Running axe-core accessibility check on ${theme} mode...`);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();

        const serious = results.violations.filter(
          (v) => v.impact === "serious" || v.impact === "critical"
        );
        console.log(`Axe violations (${theme}): ${results.violations.length} total (${serious.length} serious/critical)`);
        if (serious.length > 0) {
          serious.forEach((v) => {
            console.error(`  [${v.impact}] ${v.id}: ${v.description}`);
          });
        }
      }

      // On 1440 light, also capture with input filled and with modal open
      if (vp.name === "1440" && theme === "light") {
        console.log("Capturing input-filled state...");
        const input = page.locator("#applicant-id");
        await input.fill("BKUPG8492Q");
        await page.waitForTimeout(500);

        const filledFilename = path.join(SCREENSHOT_DIR, "polish-flag-1440-filled.png");
        await page.screenshot({ path: filledFilename, fullPage: true });
        console.log(`Saved filled screenshot: ${filledFilename}`);

        console.log("Opening Review Commitment modal...");
        const reviewBtn = page.getByRole("button", { name: "Review commitment" });
        if (await reviewBtn.isEnabled()) {
          await reviewBtn.click();
          await page.waitForTimeout(600);
          const modalFilename = path.join(SCREENSHOT_DIR, "polish-flag-1440-modal.png");
          await page.screenshot({ path: modalFilename, fullPage: true });
          console.log(`Saved modal screenshot: ${modalFilename}`);
        }
      }

      await context.close();
    }
  }

  await browser.close();
  console.log("\n=== QA CAPTURE COMPLETE ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

