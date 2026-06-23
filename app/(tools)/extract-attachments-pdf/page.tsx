"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, ProgressBar, SecondaryButton } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { extractAttachments } from "@/lib/pdf/attachments";
import { downloadBlob, getBaseName } from "@/lib/utils";
import JSZip from "jszip";
import { useTranslation } from "@/lib/i18n";

export default function ExtractAttachmentsPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const attachments = await extractAttachments(await file.arrayBuffer());
      if (attachments.length === 0) {
        setError(t("extractAttachments.none"));
        return;
      }
      const zip = new JSZip();
      attachments.forEach((item) => zip.file(item.filename, item.bytes));
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, `${getBaseName(file.name)}-attachments.zip`);
      setCount(attachments.length);
      setDone(true);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("extractAttachments.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setDone(false);
    setCount(0);
    setError(null);
  };

  return (
    <ToolLayout
      title={t("tools.extractAttachmentsPdf.title")}
      description={t("extractAttachments.pageDescription")}
      icon="attach_file"
      iconClass="bg-amber-50 text-amber-600"
    >
      <div className="space-y-4">
        <ToolCard>
          <FileDropzone onFiles={(f) => { setFile(f[0]); setDone(false); setError(null); }} files={file ? [file] : []} />
        </ToolCard>
        {file && !done && (
          <>
            {processing && <ToolCard><ProgressBar value={processing ? 50 : 0} /></ToolCard>}
            {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}
            <PrimaryButton onClick={handleExtract} loading={processing}>
              <span className="material-symbols-outlined text-[18px]">attach_file</span>
              {t("extractAttachments.button")}
            </PrimaryButton>
          </>
        )}
        {done && (
          <ToolCard>
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <p className="font-semibold text-slate-800 dark:text-slate-200">{t("extractAttachments.found", { count })}</p>
              <SecondaryButton onClick={reset}>{t("common.startOver")}</SecondaryButton>
            </div>
          </ToolCard>
        )}
      </div>
    </ToolLayout>
  );
}
