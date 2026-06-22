"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { getPdfMetadata, setPdfMetadata } from "@/lib/pdf/metadata";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function EditMetadataPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("");
  const [keywords, setKeywords] = useState("");
  const [creator, setCreator] = useState("");
  const [producer, setProducer] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFile = async (f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
    const meta = await getPdfMetadata(await f.arrayBuffer());
    setTitle(meta.title);
    setAuthor(meta.author);
    setSubject(meta.subject);
    setKeywords(meta.keywords);
    setCreator(meta.creator);
    setProducer(meta.producer);
  };

  const handleSave = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const bytes = await setPdfMetadata(await file.arrayBuffer(), { title, author, subject, keywords });
      setResult({ blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }), filename: `${getBaseName(file.name)}-metadata.pdf` });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("metadata.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => { setFile(null); setResult(null); setError(null); };

  const field = (label: string, value: string, onChange?: (v: string) => void, readOnly = false) => (
    <div>
      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">{label}</label>
      <input
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        readOnly={readOnly}
        className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 read-only:opacity-60"
      />
    </div>
  );

  return (
    <ToolLayout title={t("tools.editMetadataPdf.title")} description={t("metadata.pageDescription")} icon="info" iconClass="bg-zinc-50 text-zinc-600">
      {result ? (
        <ToolCard>
          <DownloadSuccess onDownload={() => downloadBlob(result.blob, result.filename)} onReset={reset} filename={result.filename} />
        </ToolCard>
      ) : (
        <div className="space-y-4">
          <ToolCard>
            <FileDropzone onFiles={(f) => loadFile(f[0])} files={file ? [file] : []} />
          </ToolCard>
          {file && (
            <ToolCard className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {field(t("metadata.title"), title, setTitle)}
                {field(t("metadata.author"), author, setAuthor)}
                {field(t("metadata.subject"), subject, setSubject)}
                {field(t("metadata.keywords"), keywords, setKeywords)}
                {field(t("metadata.creator"), creator, undefined, true)}
                {field(t("metadata.producer"), producer, undefined, true)}
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}
              <PrimaryButton onClick={handleSave} loading={processing}>
                <span className="material-symbols-outlined text-[18px]">save</span>
                {t("metadata.save")}
              </PrimaryButton>
            </ToolCard>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
