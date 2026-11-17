import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Presenter Pitch Mode (3-Min Pitch)",
  description: "Interactive 5-step guided pitch journey demonstrating zero-knowledge banking security.",
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

