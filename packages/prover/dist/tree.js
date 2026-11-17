"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KavachMerkleTree = void 0;
exports.buildTreeFromEvents = buildTreeFromEvents;
const normaliseId_1 = require("./normaliseId");
/**
 * Off-chain incremental Merkle tree that strictly mirrors the on-chain @zk-kit/imt.sol
 * BinaryIMT contract using Poseidon(2) hash function and depth 20.
 */
class KavachMerkleTree {
    depth;
    leaves = [];
    zeroes = [];
    initialized = false;
    constructor(depth = 20) {
        this.depth = depth;
    }
    async init() {
        if (this.initialized)
            return;
        const poseidon = await (0, normaliseId_1.getPoseidon)();
        this.zeroes = new Array(this.depth + 1);
        this.zeroes[0] = 0n;
        for (let i = 1; i <= this.depth; i++) {
            const prevZero = this.zeroes[i - 1];
            const h = poseidon([prevZero, prevZero]);
            this.zeroes[i] = BigInt(poseidon.F.toString(h));
        }
        this.initialized = true;
    }
    get numberOfLeaves() {
        return this.leaves.length;
    }
    getLeaf(index) {
        if (index < 0 || index >= this.leaves.length) {
            throw new Error(`Leaf index ${index} out of range`);
        }
        return this.leaves[index];
    }
    indexOf(leaf) {
        return this.leaves.findIndex((l) => l === leaf);
    }
    contains(leaf) {
        return this.indexOf(leaf) !== -1;
    }
    async insert(leaf) {
        await this.init();
        if (this.leaves.length >= 2 ** this.depth) {
            throw new Error("Merkle tree is full");
        }
        const leafIndex = this.leaves.length;
        this.leaves.push(leaf);
        const root = await this.getRoot();
        return { root, leafIndex };
    }
    async update(leafIndex, newLeaf) {
        await this.init();
        if (leafIndex < 0 || leafIndex >= this.leaves.length) {
            throw new Error(`Leaf index ${leafIndex} out of range`);
        }
        this.leaves[leafIndex] = newLeaf;
        return this.getRoot();
    }
    async remove(leafIndex) {
        return this.update(leafIndex, 0n);
    }
    async getRoot() {
        await this.init();
        if (this.leaves.length === 0) {
            return this.zeroes[this.depth];
        }
        const proof = await this.generateProof(0);
        return proof.root;
    }
    /**
     * Generates a Merkle inclusion proof for the leaf at `leafIndex`.
     */
    async generateProof(leafIndex) {
        await this.init();
        if (leafIndex < 0 || leafIndex >= this.leaves.length) {
            throw new Error(`Index ${leafIndex} out of range (total leaves: ${this.leaves.length})`);
        }
        const poseidon = await (0, normaliseId_1.getPoseidon)();
        const pathElements = [];
        const pathIndices = [];
        // Current level nodes map (index -> node value)
        let currentLevel = new Map();
        for (let i = 0; i < this.leaves.length; i++) {
            currentLevel.set(i, this.leaves[i]);
        }
        let currentIndex = leafIndex;
        for (let level = 0; level < this.depth; level++) {
            const isRightChild = currentIndex % 2 === 1;
            const siblingIndex = isRightChild ? currentIndex - 1 : currentIndex + 1;
            const defaultZero = this.zeroes[level];
            const sibling = currentLevel.get(siblingIndex) ?? defaultZero;
            pathElements.push(sibling);
            pathIndices.push(isRightChild ? 1 : 0);
            // Compute parent level
            const nextLevel = new Map();
            const maxIndexInLevel = Math.max(...Array.from(currentLevel.keys()), siblingIndex);
            const parentCount = Math.floor(maxIndexInLevel / 2) + 1;
            for (let p = 0; p < parentCount; p++) {
                const leftNode = currentLevel.get(p * 2) ?? defaultZero;
                const rightNode = currentLevel.get(p * 2 + 1) ?? defaultZero;
                const parentHash = poseidon([leftNode, rightNode]);
                nextLevel.set(p, BigInt(poseidon.F.toString(parentHash)));
            }
            currentLevel = nextLevel;
            currentIndex = Math.floor(currentIndex / 2);
        }
        const root = currentLevel.get(0) ?? this.zeroes[this.depth];
        return {
            root,
            leaf: this.leaves[leafIndex],
            pathElements,
            pathIndices,
            leafIndex,
        };
    }
    /**
     * Convenience: returns Merkle inclusion proof directly by leaf commitment value.
     * Throws if leaf is not found in tree or is zeroed (revoked).
     */
    async getProof(leaf) {
        const idx = this.indexOf(leaf);
        if (idx === -1 || leaf === 0n) {
            throw new Error(`Leaf ${leaf.toString()} not found in Merkle tree`);
        }
        return this.generateProof(idx);
    }
}
exports.KavachMerkleTree = KavachMerkleTree;
/**
 * Rebuilds the incremental Merkle tree from on-chain IdentityFlagged and LeafRevoked logs.
 * Skips/zeros out revoked leaves to ensure off-chain tree state matches FraudRegistry on-chain root.
 *
 * @param events Array of IdentityFlagged event logs (with optional revoked indicator).
 * @param revokedLeaves Optional Set or Array of leaf values that have been revoked by AppealDAO.
 * @param depth Tree depth (defaults to 20).
 */
async function buildTreeFromEvents(events, revokedLeaves, depth = 20) {
    const tree = new KavachMerkleTree(depth);
    await tree.init();
    const revokedSet = new Set();
    if (revokedLeaves) {
        for (const r of revokedLeaves)
            revokedSet.add(BigInt(r));
    }
    // Sort events by leaf index to reconstruct exact insertion order
    const sorted = [...events].sort((a, b) => Number(a.index) - Number(b.index));
    for (const ev of sorted) {
        const leafVal = BigInt(ev.leaf);
        const isRevoked = ev.revoked || revokedSet.has(leafVal);
        // If leaf was revoked, insert 0n or insert then zero
        if (isRevoked) {
            await tree.insert(0n);
        }
        else {
            await tree.insert(leafVal);
        }
    }
    return tree;
}
//# sourceMappingURL=tree.js.map