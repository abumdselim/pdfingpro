import type { Metadata } from "next";
import WhatWorksPageContent from "./WhatWorksPageContent";

export const metadata: Metadata = {
  title: "What Works — Pdfing Pro",
  description:
    "See how all 101 Pdfing Pro tools are processed — local in your browser, limited best-effort, or server-assisted.",
};

export default function WhatWorksPage() {
  return <WhatWorksPageContent />;
}
