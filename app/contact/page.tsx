import type { Metadata } from "next";
import ContactPageContent from "./ContactPageContent";

export const metadata: Metadata = {
  title: "Contact — Pdfing Pro",
  description:
    "Get in touch with the Pdfing Pro team for support, feedback, privacy questions, or partnership inquiries.",
};

export default function ContactPage() {
  return <ContactPageContent />;
}
