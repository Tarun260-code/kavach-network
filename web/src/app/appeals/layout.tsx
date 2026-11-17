import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Appeals Chamber | Kavach Network",
  description:
    "Consortium governance chamber for peer review, dispute adjudication, and collateral slashing.",
};

export default function AppealsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

