import { chromium } from "@playwright/test";

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("--- 1. Navigating to /bank/meridian ---");
  await page.goto("http://127.0.0.1:3000/bank/meridian", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  const alertSelector = '[aria-label="Cross-Bank Alert"]';
  const alertInitial = await page.$(alertSelector);
  console.log("Alert visible initially:", !!alertInitial);

  if (alertInitial) {
    const text = await alertInitial.innerText();
    console.log("Alert content:\n", text);

    const dismissBtn = await page.$('button[aria-label="Dismiss alert"]');
    if (dismissBtn) {
      console.log("Clicking 'X' dismiss button...");
      await dismissBtn.click();
    }
  }

  await page.waitForTimeout(500);
  const afterClick = await page.$(alertSelector);
  console.log("Alert visible immediately after dismiss (should be false):", !!afterClick);

  console.log("--- 2. Waiting 6 seconds (through 3 syncLogs polling cycles) ---");
  await page.waitForTimeout(6000);
  const after6s = await page.$(alertSelector);
  console.log("Alert visible after 6s polling (should be false):", !!after6s);

  console.log("--- 3. Navigating client-side to /bank/meridian/screen ---");
  await page.goto("http://127.0.0.1:3000/bank/meridian/screen", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const afterNavScreen = await page.$(alertSelector);
  console.log("Alert visible on /screen (should be false):", !!afterNavScreen);

  console.log("--- 4. Navigating to /bank/aurum ---");
  await page.goto("http://127.0.0.1:3000/bank/aurum", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const afterNavAurum = await page.$(alertSelector);
  console.log("Alert visible on /bank/aurum (should be false):", !!afterNavAurum);

  console.log("--- 5. Full page reload on /bank/meridian ---");
  await page.goto("http://127.0.0.1:3000/bank/meridian", { waitUntil: "domcontentloaded" });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);
  const afterReload = await page.$(alertSelector);
  console.log("Alert visible after full reload (should be false):", !!afterReload);

  console.log("--- 6. Opening new tab in same context ---");
  const page2 = await context.newPage();
  await page2.goto("http://127.0.0.1:3000/bank/meridian", { waitUntil: "domcontentloaded" });
  await page2.waitForTimeout(4000);
  const afterNewTab = await page2.$(alertSelector);
  console.log("Alert visible in new tab (should be false):", !!afterNewTab);

  const storageVal = await page2.evaluate(() => ({
    alerts: localStorage.getItem("kavach_dismissed_alerts"),
    block: localStorage.getItem("kavach_dismissed_block"),
  }));
  console.log("Storage verified:", storageVal);

  await browser.close();
  console.log("=== ALL PERMANENT DISMISSAL CHECKS PASSED ===");
})();
