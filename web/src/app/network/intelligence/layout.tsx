import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Federated Credit Risk Simulation (FedAvg)",
  description: "Privacy-preserving machine learning prototype demonstrating federated credit risk scoring across member banks.",
};

export default function IntelligenceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

