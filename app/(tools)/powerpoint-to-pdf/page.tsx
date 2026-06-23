"use client";

import OfficeToPdfPage from "@/components/tools/OfficeToPdfPage";

export default function Page() {
  return (
    <OfficeToPdfPage
      toolId="powerpoint-to-pdf"
      format="pptx"
      localeKey="powerpointToPdf"
      accept={{
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
        "application/vnd.ms-powerpoint": [".ppt"],
      }}
    />
  );
}
