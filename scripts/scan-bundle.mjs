import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standard Hardhat mnemonic default test private keys
const HARDHAT_TEST_PRIVATE_KEYS = [
  "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // #0
  "59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // #1
  "5de4111afa1a4b94908f83103eb2f954108223c324a97d916fb248085dd47b27", // #2
  "7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6", // #3
  "47e179ec3427449b3b9c1b4ee3cdd2e54d7e9d8b75209d10b99017a23c0d29a2", // #4
  "8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba", // #5
  "92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d7b8d88b23665785ee", // #6
  "4bbbf856008146ac04ad2db293025b7e0019c0f305040ceeed2cc514a6612063", // #7
  "dbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97", // #8
  "2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6", // #9
];

const staticDir = path.resolve(__dirname, "../web/.next/static");

if (!fs.existsSync(staticDir)) {
  console.error(`Directory not found: ${staticDir}. Run build first.`);
  process.exit(1);
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith(".js") || file.endsWith(".json")) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = getAllFiles(staticDir);
console.log(`Scanning ${files.length} static client bundle files for dev private keys...`);

let leakFound = false;

for (const f of files) {
  const content = fs.readFileSync(f, "utf-8").toLowerCase();
  for (const rawKey of HARDHAT_TEST_PRIVATE_KEYS) {
    if (content.includes(rawKey) || content.includes(`0x${rawKey}`)) {
      console.error(`🚨 SECURITY LEAK DETECTED in ${path.relative(process.cwd(), f)}:`);
      console.error(`   Found Hardhat dev private key: 0x${rawKey.slice(0, 8)}...`);
      leakFound = true;
    }
  }
}

if (leakFound) {
  console.error("❌ Bundle security scan FAILED: Dev private keys detected in production client bundle.");
  process.exit(1);
} else {
  console.log("✅ Bundle security scan PASSED: Zero dev private keys detected in .next/static/ bundles.");
  process.exit(0);
}
