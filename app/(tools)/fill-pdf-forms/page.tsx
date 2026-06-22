"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { listFormFields, fillPdfForm, type FormFieldInfo } from "@/lib/pdf/forms";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function FillPdfFormsPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [fields, setFields] = useState<FormFieldInfo[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFile = async (f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
    const listed = await listFormFields(await f.arrayBuffer());
    setFields(listed);
    const init: Record<string, string> = {};
    listed.forEach((fld) => { init[fld.name] = fld.value; });
    setValues(init);
  };

  const handleFill = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const bytes = await fillPdfForm(await file.arrayBuffer(), values);
      setResult({ blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }), filename: `${getBaseName(file.name)}-filled.pdf` });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("fillForms.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => { setFile(null); setFields([]); setValues({}); setResult(null); setError(null); };

  return (
    <ToolLayout title={t("tools.fillPdfForms.title")} description={t("fillForms.pageDescription")} icon="edit_note" iconClass="bg-cyan-50 text-cyan-600">
      {result ? (
        <ToolCard>
          <DownloadSuccess onDownload={() => downloadBlob(result.blob, result.filename)} onReset={reset} filename={result.filename} />
        </ToolCard>
      ) : (
        <div className="space-y-4">
          <ToolCard>
            <FileDropzone onFiles={(f) => loadFile(f[0])} files={file ? [file] : []} />
          </ToolCard>
          {file && fields.length === 0 && (
            <p className="text-sm text-amber-700 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded">{t("fillForms.noFields")}</p>
          )}
          {fields.length > 0 && (
            <ToolCard className="space-y-4">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("fillForms.fields")}</p>
              {fields.map((fld) => (
                <div key={fld.name}>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">{fld.name} ({fld.type})</label>
                  {fld.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      checked={values[fld.name] === "true"}
                      onChange={(e) => setValues((v) => ({ ...v, [fld.name]: e.target.checked ? "true" : "false" }))}
                      className="rounded"
                    />
                  ) : fld.options && fld.options.length > 0 ? (
                    <select
                      value={values[fld.name] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [fld.name]: e.target.value }))}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                    >
                      {fld.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      value={values[fld.name] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [fld.name]: e.target.value }))}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                    />
                  )}
                </div>
              ))}
              {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}
              <PrimaryButton onClick={handleFill} loading={processing}>
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                {t("fillForms.button")}
              </PrimaryButton>
            </ToolCard>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
