import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Underwriting Console & Screening",
  description: "Institutional underwriter terminal for loan applicant zero-knowledge verification.",
};

export default function BankLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

