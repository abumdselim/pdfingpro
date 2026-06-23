"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { bookmarkSplitRanges, readPdfBookmarks } from "@/lib/pdf/bookmarks";
import { getPdfPageCount } from "@/lib/pdf/core";
import { splitPDF } from "@/lib/pdf/split";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import JSZip from "jszip";

export default function SplitByBookmarksPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [bookmarks, setBookmarks] = useState<{ title: string; page: number }[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (files: File[]) => {
    const selected = files[0];
    setFile(selected);
    setDone(false);
    setError(null);
    const buffer = await selected.arrayBuffer();
    const found = await readPdfBookmarks(buffer);
    setBookmarks(found);
    if (found.length === 0) {
      setError(t("splitByBookmarks.noBookmarks"));
    }
  };

  const handleSplit = async () => {
    if (!file || bookmarks.length === 0) return;
    setProcessing(true);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const pageCount = await getPdfPageCount(buffer);
      const ranges = bookmarkSplitRanges(bookmarks, pageCount);
      if (ranges.length === 0) {
        setError(t("splitByBookmarks.noBookmarks"));
        return;
      }
      const parts = await splitPDF(buffer, ranges);
      const zip = new JSZip();
      const base = getBaseName(file.name);
      parts.forEach(({ bytes, label }) => zip.file(`${base}-${label}.pdf`, bytes));
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, `${base}-by-bookmarks.zip`);
      setDone(true);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("split.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setBookmarks([]);
    setDone(false);
    setError(null);
  };

  return (
    <ToolLayout
      title={t("tools.splitByBookmarks.title")}
      description={t("splitByBookmarks.pageDescription")}
      icon="bookmark_manager"
      iconClass="bg-rose-50 text-rose-600"
    >
      {!file ? (
        <ToolCard>
          <FileDropzone onFiles={handleFile} />
        </ToolCard>
      ) : done ? (
        <ToolCard>
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 icon-filled text-[36px]">
              check_circle
            </span>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("splitByBookmarks.done")}</p>
            <PrimaryButton onClick={reset}>
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              {t("common.startOver")}
            </PrimaryButton>
          </div>
        </ToolCard>
      ) : (
        <div className="space-y-4">
          <ToolCard>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              {t("splitByBookmarks.detected", { count: bookmarks.length })}
            </p>
            {bookmarks.length > 0 && (
              <ul className="max-h-48 overflow-auto text-xs text-slate-600 dark:text-slate-400 space-y-1 mb-4">
                {bookmarks.map((item, index) => (
                  <li key={`${item.title}-${index}`} className="flex justify-between gap-3 border-b border-slate-100 dark:border-slate-800 py-1">
                    <span className="truncate">{item.title}</span>
                    <span className="shrink-0">p. {item.page}</span>
                  </li>
                ))}
              </ul>
            )}
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded mb-3">
                {error}
              </p>
            )}
            <PrimaryButton onClick={handleSplit} loading={processing} disabled={bookmarks.length === 0}>
              <span className="material-symbols-outlined text-[18px]">cut</span>
              {t("splitByBookmarks.button")}
            </PrimaryButton>
          </ToolCard>
        </div>
      )}
    </ToolLayout>
  );
}
