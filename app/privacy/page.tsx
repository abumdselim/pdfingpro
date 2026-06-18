import type { Metadata } from "next";
import PrivacyPageContent from "./PrivacyPageContent";

export const metadata: Metadata = {
  title: "Privacy Policy — Pdfing Pro",
  description:
    "Learn how Pdfing Pro protects your data. Most PDF tools run entirely in your browser — your files never leave your device.",
};

export default function PrivacyPage() {
  return <PrivacyPageContent />;
}
