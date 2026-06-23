"use client";

import OfficeToPdfPage from "@/components/tools/OfficeToPdfPage";

export default function Page() {
  return (
    <OfficeToPdfPage
      toolId="word-to-pdf"
      format="docx"
      localeKey="wordToPdf"
      accept={{
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
        "application/msword": [".doc"],
      }}
    />
  );
}
