// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IVerifier
 * @notice Standard interface for Groth16 SnarkJS-compatible zero-knowledge verifiers.
 * @dev public signals array format: [root, nullifier]
 */
interface IVerifier {
    /**
     * @notice Verifies a Groth16 proof with public inputs.
     * @param a The `a` elliptic curve point [a0, a1] in G1.
     * @param b The `b` elliptic curve point [[b00, b01], [b10, b11]] in G2.
     * @param c The `c` elliptic curve point [c0, c1] in G1.
     * @param input Public inputs array [root, nullifier].
     * @return isValid True if the proof is cryptographically valid, false otherwise.
     */
    function verifyProof(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[2] calldata input
    ) external view returns (bool isValid);
}

