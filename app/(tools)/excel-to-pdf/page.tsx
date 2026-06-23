"use client";

import OfficeToPdfPage from "@/components/tools/OfficeToPdfPage";

export default function Page() {
  return (
    <OfficeToPdfPage
      toolId="excel-to-pdf"
      format="xlsx"
      localeKey="excelToPdf"
      accept={{
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
        "application/vnd.ms-excel": [".xls"],
      }}
    />
  );
}
