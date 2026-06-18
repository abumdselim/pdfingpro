"use client";

import { useState, useEffect } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import TouchHint from "@/components/shared/TouchHint";
import { PdfSession, streamThumbnails } from "@/lib/pdf/core";
import { reorganizePages } from "@/lib/pdf/organize";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { MIN_TOUCH_TARGET } from "@/lib/touch-utils";
import { useIsTouchDevice } from "@/lib/hooks/useIsTouchDevice";
import { useTranslation } from "@/lib/i18n";

interface PageItem {
  originalIndex: number;
  thumbnail: string;
  deleted: boolean;
}

export default function OrganizePDFPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState({ loaded: 0, total: 0 });
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isTouch = useIsTouchDevice();

  useEffect(() => {
    if (!file) return;

    let cancelled = false;
    let session: PdfSession | null = null;

    setLoading(true);
    setPages([]);
    setLoadProgress({ loaded: 0, total: 0 });

    (async () => {
      try {
        session = await PdfSession.fromFile(file);
        if (cancelled) return;

        const total = session.pageCount;
        setLoadProgress({ loaded: 0, total });
        setPages(
          Array.from({ length: total }, (_, i) => ({
            originalIndex: i,
            thumbnail: "",
            deleted: false,
          }))
        );

        await streamThumbnails({
          session,
          onPage: (index, dataUrl) => {
            if (cancelled) return;
            setPages((prev) =>
              prev.map((p, i) => (i === index ? { ...p, thumbnail: dataUrl } : p))
            );
            setLoadProgress({ loaded: index + 1, total });
          },
        });
      } catch (err: unknown) {
        if (!cancelled) {
          setError((err as Error)?.message ?? t("common.failed"));
        }
      } finally {
        session?.destroy();
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      session?.destroy();
    };
  }, [file, t]);

  const toggleDelete = (i: number) => {
    setPages((prev) => prev.map((p, idx) => idx === i ? { ...p, deleted: !p.deleted } : p));
  };

  const movePage = (from: number, to: number) => {
    setPages((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  };

  const handleApply = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const order = pages.filter((p) => !p.deleted).map((p) => p.originalIndex);
      if (order.length === 0) { setError(t("organize.atLeastOne")); return; }
      const bytes = await reorganizePages(buffer, order);
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      setResult({ blob, filename: `${getBaseName(file.name)}-organized.pdf` });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("common.failed"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => { setFile(null); setPages([]); setResult(null); setError(null); };

  const active = pages.filter((p) => !p.deleted);
  const deleted = pages.filter((p) => p.deleted);
  const thumbsReady = pages.some((p) => p.thumbnail);

  return (
    <ToolLayout
      title={t("tools.organizePdf.title")}
      description={t("organize.pageDescription")}
      icon="grid_view"
      iconClass="bg-blue-50 text-blue-600"
    >
      {result ? (
        <ToolCard>
          <DownloadSuccess
            onDownload={() => downloadBlob(result.blob, result.filename)}
            onReset={reset}
            filename={result.filename}
          />
        </ToolCard>
      ) : (
        <div className="space-y-4">
          <ToolCard>
            <FileDropzone
              onFiles={(f) => { setFile(f[0]); setResult(null); setError(null); }}
              files={file ? [file] : []}
            />
          </ToolCard>

          {loading && (
            <div className="flex flex-col gap-2 text-slate-500 dark:text-slate-400 py-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined animate-spin text-teal-500">progress_activity</span>
                <span className="text-sm">
                  {loadProgress.total > 0
                    ? `${t("common.loadingPages")} (${loadProgress.loaded}/${loadProgress.total})`
                    : t("common.loadingPages")}
                </span>
              </div>
            </div>
          )}

          {pages.length > 0 && (
            <ToolCard>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t("organize.pageCount", { count: active.length })}
              </p>
              <TouchHint
                text={isTouch ? t("organize.hintTouch") : t("organize.hintMouse")}
                icon="grid_view"
                className="mb-4"
              />

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {pages.map((page, i) => (
                  <div
                    key={i}
                    draggable={!page.deleted && !!page.thumbnail}
                    onDragStart={() => { if (!page.deleted && page.thumbnail) setDragFrom(i); }}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(i); }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragFrom !== null && dragFrom !== i) movePage(dragFrom, i);
                      setDragFrom(null);
                      setDragOver(null);
                    }}
                    onDragEnd={() => { setDragFrom(null); setDragOver(null); }}
                    className={cn(
                      "relative group rounded border-2 overflow-hidden transition-all",
                      page.deleted
                        ? "opacity-40 border-slate-200 cursor-pointer"
                        : dragOver === i
                        ? "border-teal-400 scale-105"
                        : "border-slate-200 hover:border-slate-400 cursor-grab active:cursor-grabbing"
                    )}
                    onClick={() => page.deleted && toggleDelete(i)}
                  >
                    {page.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={page.thumbnail}
                        alt={`Page ${page.originalIndex + 1}`}
                        className="w-full h-auto"
                        style={{ aspectRatio: "1 / 1.414", objectFit: "cover" }}
                      />
                    ) : (
                      <div className="animate-pulse bg-slate-100 dark:bg-slate-800 animate-shimmer" style={{ aspectRatio: "1 / 1.414" }} />
                    )}
                    {page.deleted && (
                      <div className="absolute inset-0 bg-red-100/70 flex items-center justify-center">
                        <span className="material-symbols-outlined text-red-500 text-[28px]">delete</span>
                      </div>
                    )}
                    {!page.deleted && page.thumbnail && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleDelete(i); }}
                        className="absolute top-1 right-1 bg-white dark:bg-slate-800 rounded-full shadow text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 active:scale-95 z-20"
                        style={{ width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET }}
                        aria-label={t("common.removeFile")}
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    )}
                    {isTouch && !page.deleted && page.thumbnail && (
                      <div className="absolute top-1 left-1 z-20 flex flex-col gap-1">
                        <button
                          type="button"
                          disabled={i === 0}
                          onClick={(e) => { e.stopPropagation(); if (i > 0) movePage(i, i - 1); }}
                          className="inline-flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/95 text-slate-700 dark:text-slate-300 shadow-sm disabled:opacity-40 active:scale-95"
                          style={{ width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET }}
                          aria-label="Move page up"
                        >
                          <span className="material-symbols-outlined text-[20px]">keyboard_arrow_up</span>
                        </button>
                        <button
                          type="button"
                          disabled={i >= pages.length - 1}
                          onClick={(e) => { e.stopPropagation(); if (i < pages.length - 1) movePage(i, i + 1); }}
                          className="inline-flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/95 text-slate-700 dark:text-slate-300 shadow-sm disabled:opacity-40 active:scale-95"
                          style={{ width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET }}
                          aria-label="Move page down"
                        >
                          <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
                        </button>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 py-1 px-1.5">
                      <span className="text-white text-[10px] font-medium">{page.originalIndex + 1}</span>
                    </div>
                  </div>
                ))}
              </div>

              {deleted.length > 0 && (
                <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                  {t("organize.deletedCount", { count: deleted.length })}
                </p>
              )}

              {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}

              <div className="mt-5 flex gap-3">
                <PrimaryButton onClick={handleApply} loading={processing} disabled={loading || !thumbsReady}>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  {t("organize.button")}
                </PrimaryButton>
                <button
                  onClick={() => setPages(pages.map((p) => ({ ...p, deleted: false })))}
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  {t("organize.restoreAll")}
                </button>
              </div>
            </ToolCard>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
