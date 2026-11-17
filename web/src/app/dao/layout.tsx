import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AppealDAO Governance & Adjudication",
  description: "Decentralized 2/3 supermajority dispute resolution and wrongful flag revocation for Kavach Network.",
};

export default function DaoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

