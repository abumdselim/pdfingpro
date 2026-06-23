"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import {
  addBookmarksAndToc,
  parseBookmarkLines,
  readPdfBookmarks,
} from "@/lib/pdf/bookmarks";
import { getPdfPageCount } from "@/lib/pdf/core";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function BookmarksPdfPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [lines, setLines] = useState("Introduction|1\nChapter 1|3\nChapter 2|12");
  const [addTocPage, setAddTocPage] = useState(true);
  const [addOutline, setAddOutline] = useState(true);
  const [existing, setExisting] = useState<{ title: string; page: number }[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadExisting = async (selected: File) => {
    const buffer = await selected.arrayBuffer();
    const bookmarks = await readPdfBookmarks(buffer);
    setExisting(bookmarks);
    if (bookmarks.length > 0) {
      setLines(bookmarks.map((item) => `${item.title}|${item.page}`).join("\n"));
    }
  };

  const handleFile = async (files: File[]) => {
    const selected = files[0];
    setFile(selected);
    setResult(null);
    setError(null);
    await loadExisting(selected);
  };

  const handleApply = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const pageCount = await getPdfPageCount(buffer);
      const entries = parseBookmarkLines(lines, pageCount);
      if (!entries?.length) {
        setError(t("bookmarksPdf.invalidLines"));
        return;
      }
      const bytes = await addBookmarksAndToc(buffer, {
        entries,
        addTocPage,
        addOutline,
        tocTitle: t("bookmarksPdf.tocTitle"),
      });
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      setResult({ blob, filename: `${getBaseName(file.name)}-bookmarks.pdf` });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("common.failed"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setExisting([]);
    setResult(null);
    setError(null);
  };

  return (
    <ToolLayout
      title={t("tools.bookmarksPdf.title")}
      description={t("bookmarksPdf.pageDescription")}
      icon="bookmark_add"
      iconClass="bg-amber-50 text-amber-600"
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
            <FileDropzone onFiles={handleFile} files={file ? [file] : []} />
          </ToolCard>

          {file && (
            <ToolCard>
              <div className="space-y-5">
                {existing.length > 0 && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t("bookmarksPdf.foundExisting", { count: existing.length })}
                  </p>
                )}

                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                    {t("bookmarksPdf.entriesLabel")}
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t("bookmarksPdf.entriesHint")}</p>
                  <textarea
                    value={lines}
                    onChange={(e) => setLines(e.target.value)}
                    rows={8}
                    className="ds-input font-mono text-xs"
                  />
                </div>

                <div className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={addTocPage} onChange={(e) => setAddTocPage(e.target.checked)} />
                    {t("bookmarksPdf.addTocPage")}
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={addOutline} onChange={(e) => setAddOutline(e.target.checked)} />
                    {t("bookmarksPdf.addOutline")}
                  </label>
                </div>

                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">
                    {error}
                  </p>
                )}

                <PrimaryButton onClick={handleApply} loading={processing}>
                  <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
                  {t("bookmarksPdf.button")}
                </PrimaryButton>
              </div>
            </ToolCard>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
