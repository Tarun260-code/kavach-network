import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "../components/Toast";
import { BankSessionProvider } from "../context/BankSessionContext";
import { ThemeProvider } from "../context/ThemeContext";

export const metadata: Metadata = {
  title: {
    template: "%s • Kavach Network",
    default: "Kavach Network (कवच) • Institutional Zero-Knowledge Fraud Shield",
  },
  description:
    "Institutional consortium fraud intelligence protocol for Indian commercial banks and NBFCs, preventing syndicated loan stacking under the DPDP Act (2023).",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Kavach Network • Institutional Zero-Knowledge Fraud Shield",
    description:
      "Armouring Indian Banking Against Syndicated Loan Stacking Without Violating the DPDP Act. Client-side Groth16 zk-SNARK proofs over BN254.",
    url: "https://kavach.network",
    siteName: "Kavach Network",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Kavach Network • Fraud Shared, Never Exposed",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kavach Network (कवच) • Zero-Knowledge Banking Security",
    description:
      "Zero-knowledge consortium fraud intelligence protocol for Indian banking under the DPDP Act (2023).",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('kavach-theme');
                  var supportDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = saved || (supportDark ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-canvas text-ink antialiased min-h-screen selection:bg-brand-sapphire/15 selection:text-ink">
        <ThemeProvider>
          <BankSessionProvider>
            <ToastProvider>{children}</ToastProvider>
          </BankSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
