import type { Metadata } from "next";
import TermsPageContent from "./TermsPageContent";

export const metadata: Metadata = {
  title: "Terms of Service — Pdfing Pro",
  description:
    "Terms and conditions for using Pdfing Pro, the free browser-based PDF toolkit by Intactic Innovations.",
};

export default function TermsPage() {
  return <TermsPageContent />;
}
