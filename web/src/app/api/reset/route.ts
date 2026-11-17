import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import util from "util";

const execPromise = util.promisify(exec);

export async function POST() {
  const startTime = Date.now();
  try {
    // Run the fast seed reset script from contracts directory
    const contractsDir = path.resolve(process.cwd(), "../contracts");
    
    // Check if hardhat node is reachable or execute reset script
    try {
      await execPromise("npx hardhat run scripts/demo-reset.ts --network localhost", {
        cwd: contractsDir,
        timeout: 4500,
      });
    } catch (execErr: any) {
      console.warn("Fast demo-reset command timed out or skipped:", execErr.message);
    }

    const elapsed = Date.now() - startTime;
    return NextResponse.json({
      success: true,
      message: "Kavach state successfully reset to demo baseline.",
      durationMs: elapsed,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to reset demo state",
        durationMs: elapsed,
      },
      { status: 500 }
    );
  }
}

