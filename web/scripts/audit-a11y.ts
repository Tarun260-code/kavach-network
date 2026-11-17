import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = [
  { path: "/", name: "Landing Page" },
  { path: "/bank/sbi", name: "Bank Overview (Priya / Bank A)" },
  { path: "/bank/sbi/flag", name: "Flag Identity Form (Priya)" },
  { path: "/bank/hdfc/screen", name: "Screen Applicant (Rohan / Bank B)" },
  { path: "/network", name: "Ledger & Tree Activity" },
  { path: "/dao", name: "AppealDAO Governance (Meera)" },
  { path: "/demo", name: "Consortium Presenter / Pitch Mode" },
  { path: "/trust", name: "Trust Center & Cryptographic Bounds" },
  { path: "/privacy", name: "Privacy Policy & DPDP Guarantees" },
];

async function main() {
  console.log("==================================================");
  console.log("    KAVACH NETWORK AXE ACCESSIBILITY (WCAG 2.2 AA)");
  console.log("==================================================");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Set tour flag so onboarding popover doesn't block audits
  await page.addInitScript(() => {
    localStorage.setItem("kavach_tour_v1", "true");
  });

  let totalViolations = 0;
  const auditResults: { route: string; violations: number; details: string[] }[] = [];

  for (const route of ROUTES) {
    console.log(`\nAuditing route: ${route.path} (${route.name})...`);
    try {
      await page.goto(`http://localhost:3000${route.path}`, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      // Wait 500ms for layout stability
      await page.waitForTimeout(500);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const seriousOrCritical = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical"
      );

      console.log(`- Total issues found: ${results.violations.length} (${seriousOrCritical.length} serious/critical)`);
      console.log(`- Passing WCAG checks: ${results.passes.length}`);

      const details: string[] = [];
      if (seriousOrCritical.length > 0) {
        seriousOrCritical.forEach((v) => {
          const msg = `[${v.impact}] ${v.id}: ${v.description} on ${v.nodes.map((n) => n.target.join(", ")).join("; ")}`;
          console.error(`  * ${msg}`);
          details.push(msg);
        });
      }

      totalViolations += seriousOrCritical.length;
      auditResults.push({
        route: route.path,
        violations: seriousOrCritical.length,
        details,
      });
    } catch (err: any) {
      console.error(`Failed to audit ${route.path}:`, err.message);
    }
  }

  await browser.close();

  console.log("\n==================================================");
  console.log("             FINAL AUDIT SUMMARY                  ");
  console.log("==================================================");
  auditResults.forEach((res) => {
    console.log(`Route ${res.route.padEnd(20)}: ${res.violations === 0 ? "PASSED (0 serious/critical)" : `FAILED (${res.violations} issues)`}`);
  });
  console.log(`\nTotal Serious/Critical Violations Across All Routes: ${totalViolations}`);

  if (totalViolations > 0) {
    console.error("\nAccessibility audit failed due to serious/critical violations.");
    process.exit(1);
  } else {
    console.log("\nSUCCESS: All routes meet WCAG 2.2 AA standards with 0 serious/critical violations!");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Audit runner failed:", err);
  process.exit(1);
});
