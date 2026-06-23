import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import DevServiceWorkerCleanup from "@/components/layout/DevServiceWorkerCleanup";
import DevSwCleanupScript from "@/components/layout/DevSwCleanupScript";
import ThemeScript from "@/components/layout/ThemeScript";
import { materialSymbols } from "@/lib/fonts/material-symbols";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { I18nProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Pdfing Pro - Free Online PDF Tools",
  description:
    "Merge, split, compress, convert, rotate, watermark and sign PDFs - all in your browser. No uploads, no server. 100% private.",
  keywords: ["pdf editor", "merge pdf", "split pdf", "compress pdf", "free pdf tools", "online pdf"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pdfing Pro",
  },
  openGraph: {
    title: "Pdfing Pro - Free Online PDF Tools",
    description: "All PDF tools. Browser-only. Zero uploads.",
    type: "website",
  },
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
  interactiveWidget: "resizes-content" as const,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f5f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`light ${materialSymbols.variable}`}
      suppressHydrationWarning
      style={{ colorScheme: "light" }}
    >
      <head>
        <DevSwCleanupScript />
        <ThemeScript />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ThemeProvider>
          <I18nProvider>
            <DevServiceWorkerCleanup />
            <ScrollToTop />
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
