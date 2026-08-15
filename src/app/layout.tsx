import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/lib/i18n/I18nContext";

export const metadata: Metadata = {
  title: "Deploy Doctor for Vercel — Catch regressions before your users do",
  description:
    "Paste any Vercel URL and get a 40+ point deploy audit in under 30 seconds: security headers, caching, vercel.json, performance, SEO, a11y — with code snippets to fix each finding.",
  metadataBase: new URL("https://deploy.doctor"),
  openGraph: {
    title: "Deploy Doctor for Vercel",
    description: "Pre-launch deploy audit. 40+ checks. Fix recipes with code snippets.",
    type: "website",
    siteName: "Deploy Doctor",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deploy Doctor for Vercel",
    description: "Pre-launch deploy audit. 40+ checks with copy-paste fix recipes.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-gray-950 antialiased">
        <I18nProvider>
          <AuthProvider>{children}</AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
