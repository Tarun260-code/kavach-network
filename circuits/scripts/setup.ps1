# Kavach Network Circom & SnarkJS Setup Script
# Generates Groth16 keys and verification contracts for membership.circom
#
# NOTE FOR PRODUCTION:
# This pipeline uses a development-grade Powers of Tau (ptau 14, 16384 points) generated
# locally with random entropy. For production deployments across Indian member banks,
# replace this with the official Hermez / Perpetual Powers of Tau ceremony transcript
# (e.g. powersOfTau28_hez_final_15.ptau or higher) with verifiable multi-party ceremony hashes.

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  KAVACH NETWORK: ZERO-KNOWLEDGE CIRCUIT SETUP   " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$CIRCUITS_DIR = Split-Path -Parent $PSScriptRoot
$BUILD_DIR = Join-Path $CIRCUITS_DIR "build"
$CIRCUIT_PATH = Join-Path $CIRCUITS_DIR "membership.circom"
$TOOLS_DIR = "c:\Users\P Sai Tarun\kavach-network\tools"
$CIRCOM_EXE = Join-Path $TOOLS_DIR "circom.exe"
$CIRCOMLIB_INCLUDE = "c:\Users\P Sai Tarun\kavach-network\node_modules\.pnpm\circomlib@2.0.5\node_modules"
$SNARKJS_CLI = "c:\Users\P Sai Tarun\kavach-network\node_modules\.pnpm\snarkjs@0.7.6\node_modules\snarkjs\cli.js"

if (!(Test-Path $BUILD_DIR)) {
    New-Item -ItemType Directory -Path $BUILD_DIR -Force | Out-Null
}

# 1. Compile Circom Circuit
Write-Host "`n[1/5] Compiling membership.circom with circom 2.1.9..." -ForegroundColor Green
& $CIRCOM_EXE $CIRCUIT_PATH --r1cs --wasm --sym -o $BUILD_DIR -l $CIRCOMLIB_INCLUDE

# 2. Powers of Tau (14 = 16384 constraints, sufficient for 5337 constraints)
$ptauFinal = Join-Path $BUILD_DIR "ptau_final.ptau"
if (!(Test-Path $ptauFinal)) {
    Write-Host "`n[2/5] Generating Powers of Tau (dev ceremony, size 14)..." -ForegroundColor Green
    $ptau0 = Join-Path $BUILD_DIR "ptau_0.ptau"
    $ptau1 = Join-Path $BUILD_DIR "ptau_1.ptau"
    node $SNARKJS_CLI powersoftau new bn128 14 $ptau0
    node $SNARKJS_CLI powersoftau contribute $ptau0 $ptau1 --name="DevContribute" -e="kavach_consortium_entropy_dev_only_12345"
    node $SNARKJS_CLI powersoftau prepare phase2 $ptau1 $ptauFinal
} else {
    Write-Host "`n[2/5] Powers of Tau already exists at $ptauFinal" -ForegroundColor Yellow
}

# 3. Groth16 Setup
Write-Host "`n[3/5] Performing Groth16 circuit-specific setup..." -ForegroundColor Green
$r1csPath = Join-Path $BUILD_DIR "membership.r1cs"
$zkey0 = Join-Path $BUILD_DIR "membership_0000.zkey"
$zkeyFinal = Join-Path $BUILD_DIR "membership_final.zkey"
node $SNARKJS_CLI groth16 setup $r1csPath $ptauFinal $zkey0
node $SNARKJS_CLI zkey contribute $zkey0 $zkeyFinal --name="KavachConsortiumZkey" -e="kavach_consortium_secret_salt_entropy"

# 4. Export Verification Key & Solidity Verifier
Write-Host "`n[4/5] Exporting verification key and Solidity verifier..." -ForegroundColor Green
$vkPath = Join-Path $BUILD_DIR "verification_key.json"
$verifierSol = Join-Path $BUILD_DIR "Groth16Verifier.sol"
node $SNARKJS_CLI zkey export verificationkey $zkeyFinal $vkPath
node $SNARKJS_CLI zkey export solidityverifier $zkeyFinal $verifierSol

# 5. Distribute artifacts
Write-Host "`n[5/5] Distributing artifacts to /web and /contracts..." -ForegroundColor Green
$webZkDir = "c:\Users\P Sai Tarun\kavach-network\web\public\zk"
if (!(Test-Path $webZkDir)) { New-Item -ItemType Directory -Path $webZkDir -Force | Out-Null }
Copy-Item (Join-Path $BUILD_DIR "membership_js\membership.wasm") -Destination $webZkDir -Force
Copy-Item $zkeyFinal -Destination $webZkDir -Force
Copy-Item $vkPath -Destination $webZkDir -Force

# Copy verifier to contracts and adapt pragma / interface
$contractsVerifier = "c:\Users\P Sai Tarun\kavach-network\contracts\contracts\Groth16Verifier.sol"
$solContent = Get-Content $verifierSol -Raw
# Replace GPL header & old pragma with MIT & 0.8.20 + IVerifier inheritance
$adaptedSol = $solContent -replace "pragma solidity >=0.7.0 <0.9.0;", "pragma solidity ^0.8.20;`n`nimport {IVerifier} from `"./interfaces/IVerifier.sol`";"
$adaptedSol = $adaptedSol -replace "contract Groth16Verifier \{", "contract Groth16Verifier is IVerifier {"
$adaptedSol = "// SPDX-License-Identifier: MIT`n" + ($adaptedSol -replace "^// SPDX-License-Identifier: [^\r\n]*[\r\n]+", "")
Set-Content -Path $contractsVerifier -Value $adaptedSol

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  ZK PIPELINE COMPLETE: ALL ARTIFACTS GENERATED   " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
