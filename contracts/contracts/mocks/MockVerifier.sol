// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IVerifier} from "../interfaces/IVerifier.sol";

/**
 * @title MockVerifier
 * @notice Mock implementation of IVerifier for rapid local test suites and offline simulated flows.
 */
contract MockVerifier is IVerifier {
    bool private _forceFail;

    event ForceFailSet(bool forceFail);

    /**
     * @notice Toggle forced failure of proofs to test error conditions.
     * @param forceFail If true, all verifyProof calls return false.
     */
    function setForceFail(bool forceFail) external {
        _forceFail = forceFail;
        emit ForceFailSet(forceFail);
    }

    /**
     * @inheritdoc IVerifier
     */
    function verifyProof(
        uint256[2] calldata,
        uint256[2][2] calldata,
        uint256[2] calldata,
        uint256[2] calldata input
    ) external view override returns (bool isValid) {
        if (_forceFail) {
            return false;
        }
        // Valid if both root and nullifier are non-zero field elements
        if (input[0] == 0 || input[1] == 0) {
            return false;
        }
        return true;
    }
}

