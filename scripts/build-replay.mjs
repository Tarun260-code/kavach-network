import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("🚀 Building Next.js application with NEXT_PUBLIC_NETWORK=replay...");

const pnpmBin = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

const buildResult = spawnSync(
  pnpmBin,
  ["--filter", "web", "build"],
  {
    cwd: rootDir,
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      NEXT_PUBLIC_NETWORK: "replay",
    },
  }
);

if (buildResult.status !== 0) {
  console.error("❌ Next.js build failed");
  process.exit(buildResult.status || 1);
}

console.log("\n🔍 Running client bundle security scan...");
await import("./scan-bundle.mjs");
