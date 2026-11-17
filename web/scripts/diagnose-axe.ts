import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.addInitScript(() => {
    localStorage.setItem("kavach_tour_v1", "true");
  });

  await page.goto("http://localhost:3000/bank/meridian/flag", {
    waitUntil: "networkidle",
  });

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical"
  );

  console.log(`Found ${serious.length} serious/critical violations:`);
  for (const v of serious) {
    console.log(`\n=== [${v.impact.toUpperCase()}] ${v.id} ===`);
    console.log(`Help: ${v.help}`);
    for (const node of v.nodes) {
      console.log(`  Selector: ${node.target.join(" > ")}`);
      console.log(`  HTML: ${node.html}`);
      console.log(`  Summary: ${node.failureSummary}`);
    }
  }

  await browser.close();
}

main().catch(console.error);

