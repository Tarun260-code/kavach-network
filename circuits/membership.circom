pragma circom 2.1.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/mux1.circom";

/**
 * @title MerkleVerifier
 * @notice Verifies that a leaf belongs to a binary Merkle tree of given depth.
 */
template MerkleVerifier(depth) {
    signal input leaf;
    signal input pathElements[depth];
    signal input pathIndices[depth];
    signal output root;

    signal currentHash[depth + 1];
    currentHash[0] <== leaf;

    component hashers[depth];
    component muxLeft[depth];
    component muxRight[depth];

    for (var i = 0; i < depth; i++) {
        // Enforce pathIndices[i] is binary (0 for left child, 1 for right child)
        pathIndices[i] * (1 - pathIndices[i]) === 0;

        muxLeft[i] = Mux1();
        muxLeft[i].c[0] <== currentHash[i];
        muxLeft[i].c[1] <== pathElements[i];
        muxLeft[i].s <== pathIndices[i];

        muxRight[i] = Mux1();
        muxRight[i].c[0] <== pathElements[i];
        muxRight[i].c[1] <== currentHash[i];
        muxRight[i].s <== pathIndices[i];

        hashers[i] = Poseidon(2);
        hashers[i].inputs[0] <== muxLeft[i].out;
        hashers[i].inputs[1] <== muxRight[i].out;

        currentHash[i + 1] <== hashers[i].out;
    }

    root <== currentHash[depth];
}

/**
 * @title FraudMembership
 * @notice Proves: "I know (idNumber, salt, path) such that Poseidon(idNumber, salt) is a leaf
 *         under public root R", exposing public nullifier = Poseidon(leaf, 1) and root.
 */
template FraudMembership(depth) {
    // Private witness inputs
    signal input idNumber;
    signal input salt;
    signal input pathElements[depth];
    signal input pathIndices[depth];

    // Public signals
    signal input root;
    signal input nullifier;

    // 1. Compute leaf = Poseidon(idNumber, salt)
    component leafHasher = Poseidon(2);
    leafHasher.inputs[0] <== idNumber;
    leafHasher.inputs[1] <== salt;
    signal leaf <== leafHasher.out;

    // 2. Compute nullifier = Poseidon(leaf, 1)
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== leaf;
    nullifierHasher.inputs[1] <== 1;
    
    // Enforce nullifier matches expected domain-separated value
    nullifier === nullifierHasher.out;

    // 3. Verify Merkle tree inclusion
    component treeVerifier = MerkleVerifier(depth);
    treeVerifier.leaf <== leaf;
    for (var i = 0; i < depth; i++) {
        treeVerifier.pathElements[i] <== pathElements[i];
        treeVerifier.pathIndices[i] <== pathIndices[i];
    }

    // Enforce computed Merkle root equals public root
    root === treeVerifier.root;
}

component main {public [root, nullifier]} = FraudMembership(20);

