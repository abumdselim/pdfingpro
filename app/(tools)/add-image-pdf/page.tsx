"use client";

import { useEffect, useState } from "react";
import ToolLayout, { ToolCard, ToolUploadCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import PageJumpInput from "@/components/shared/PageJumpInput";
import { getPdfPageCount } from "@/lib/pdf/core";
import { addImageToPdf, type ImagePlacementPreset } from "@/lib/pdf/add-image";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

const PRESETS: ImagePlacementPreset[] = ["center", "top-left", "bottom-right", "full-page"];

export default function AddImagePdfPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [targetPage, setTargetPage] = useState(0);
  const [preset, setPreset] = useState<ImagePlacementPreset>("center");
  const [widthFrac, setWidthFrac] = useState(35);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPageCount(0);
      return;
    }
    let cancelled = false;
    file
      .arrayBuffer()
      .then((buf) => getPdfPageCount(buf))
      .then((count) => {
        if (!cancelled) setPageCount(count);
      })
      .catch(() => {
        if (!cancelled) setPageCount(1);
      });
    return () => {
      cancelled = true;
    };
  }, [file]);

  const handleAdd = async () => {
    if (!file || !image) return;
    setProcessing(true);
    setError(null);
    try {
      const bytes = await addImageToPdf(await file.arrayBuffer(), await image.arrayBuffer(), image.type, {
        pageIndex: targetPage,
        preset,
        widthFrac: widthFrac / 100,
      });
      setResult({
        blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }),
        filename: `${getBaseName(file.name)}-with-image.pdf`,
      });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("addImagePdf.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setImage(null);
    setResult(null);
    setTargetPage(0);
    setPageCount(0);
    setError(null);
  };

  return (
    <ToolLayout title={t("tools.addImagePdf.title")} description={t("addImagePdf.pageDescription")} icon="add_photo_alternate" iconClass="bg-pink-50 text-pink-600">
      {result ? (
        <ToolCard><DownloadSuccess onDownload={() => downloadBlob(result.blob, result.filename)} onReset={reset} filename={result.filename} /></ToolCard>
      ) : (
        <div className="space-y-4">
          <ToolUploadCard>
            <FileDropzone
              sectionLabel={t("addImagePdf.pdfFile")}
              onFiles={(f) => { setFile(f[0]); setError(null); setTargetPage(0); }}
              files={file ? [file] : []}
            />
          </ToolUploadCard>
          {file && (
            <>
              <ToolUploadCard>
                <FileDropzone
                  sectionLabel={t("addImagePdf.imageFile")}
                  accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                  onFiles={(f) => setImage(f[0])}
                  files={image ? [image] : []}
                />
              </ToolUploadCard>
              <ToolCard className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("addImagePdf.targetPage")}</p>
                  <PageJumpInput currentPage={targetPage} totalPages={Math.max(1, pageCount)} onJump={setTargetPage} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t("addImagePdf.placement")}</p>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPreset(p)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                          preset === p ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-600"
                        )}
                      >
                        {t(`addImagePdf.preset.${p}`)}
                      </button>
                    ))}
                  </div>
                </div>
                {preset !== "full-page" && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("addImagePdf.size", { value: widthFrac })}</label>
                    <input type="range" min={15} max={90} value={widthFrac} onChange={(e) => setWidthFrac(Number(e.target.value))} className="w-full mt-2 accent-teal-600" />
                  </div>
                )}
              </ToolCard>
              {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}
              <PrimaryButton onClick={handleAdd} loading={processing} disabled={!image}>
                <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
                {t("addImagePdf.button")}
              </PrimaryButton>
            </>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
