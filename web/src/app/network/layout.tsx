import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consortium Ledger & Merkle Tree",
  description: "Live immutable on-chain event ledger and BN254 Poseidon Merkle tree history for Kavach Network.",
};

export default function NetworkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

