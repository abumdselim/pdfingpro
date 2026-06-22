"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ToolLayout, { DownloadSuccess, PrimaryButton, SecondaryButton, ToolCard } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import PDFThumbnails from "@/components/shared/PDFThumbnail";
import TouchHint from "@/components/shared/TouchHint";
import PageJumpInput from "@/components/shared/PageJumpInput";
import ProcessingBadge from "@/components/shared/ProcessingBadge";
import { renderPageToCanvas } from "@/lib/pdf/core";
import {
  applyRedactions,
  findTextMatches,
  matchesToRegions,
  type RedactRegion,
  type TextMatch,
} from "@/lib/pdf/redact";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { preventScrollDuringTouch, MIN_TOUCH_TARGET } from "@/lib/touch-utils";
import { useIsTouchDevice } from "@/lib/hooks/useIsTouchDevice";
import { useTranslation } from "@/lib/i18n";

type RedactItem = RedactRegion & {
  id: string;
  source: "manual" | "search";
  label?: string;
};

type DrawState = {
  startX: number;
  startY: number;
  curX: number;
  curY: number;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function normalizeRect(r: Pick<RedactRegion, "xFrac" | "yFrac" | "wFrac" | "hFrac">) {
  const x1 = clamp01(r.xFrac);
  const y1 = clamp01(r.yFrac);
  const x2 = clamp01(r.xFrac + r.wFrac);
  const y2 = clamp01(r.yFrac + r.hFrac);
  return {
    xFrac: Math.min(x1, x2),
    yFrac: Math.min(y1, y2),
    wFrac: Math.max(0.01, Math.abs(x2 - x1)),
    hFrac: Math.max(0.008, Math.abs(y2 - y1)),
  };
}

function regionKey(r: RedactRegion) {
  return `${r.pageIndex}:${Math.round(r.xFrac * 1000)}:${Math.round(r.yFrac * 1000)}:${Math.round(r.wFrac * 1000)}:${Math.round(r.hFrac * 1000)}`;
}

export default function RedactPdfPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [targetPage, setTargetPage] = useState(0);
  const [regions, setRegions] = useState<RedactItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [pendingMatches, setPendingMatches] = useState<TextMatch[]>([]);
  const [searching, setSearching] = useState(false);

  const [draw, setDraw] = useState<DrawState | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const orderRef = useRef(1);
  const isTouch = useIsTouchDevice();

  useEffect(() => {
    const cleanup = preventScrollDuringTouch(overlayRef.current);
    return cleanup;
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewError(null);
      setPreviewLoading(false);
      return;
    }
    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError(null);
    file
      .arrayBuffer()
      .then((buf) => renderPageToCanvas(buf, targetPage + 1, 2))
      .then((rendered) => {
        if (cancelled || !previewCanvasRef.current) return;
        const canvas = previewCanvasRef.current;
        canvas.width = rendered.width;
        canvas.height = rendered.height;
        canvas.getContext("2d")!.drawImage(rendered, 0, 0);
      })
      .catch((err: unknown) => {
        if (!cancelled) setPreviewError((err as Error)?.message ?? "Failed to render.");
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [file, targetPage]);

  const getRelFrac = (clientX: number, clientY: number) => {
    const source = previewCanvasRef.current ?? overlayRef.current;
    if (!source) return null;
    const r = source.getBoundingClientRect();
    return {
      x: clamp01((clientX - r.left) / Math.max(1, r.width)),
      y: clamp01((clientY - r.top) / Math.max(1, r.height)),
    };
  };

  const addRegions = useCallback((incoming: RedactItem[]) => {
    if (incoming.length === 0) return;
    setRegions((prev) => {
      const seen = new Set(prev.map((r) => regionKey(r)));
      const next = [...prev];
      for (const item of incoming) {
        const key = regionKey(item);
        if (seen.has(key)) continue;
        seen.add(key);
        next.push(item);
      }
      return next;
    });
  }, []);

  const handleSearch = async () => {
    if (!file || !searchText.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const matches = await findTextMatches(await file.arrayBuffer(), searchText, { caseSensitive, wholeWord });
      setPendingMatches(matches);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("redact.error"));
      setPendingMatches([]);
    } finally {
      setSearching(false);
    }
  };

  const addPendingMatches = () => {
    const items: RedactItem[] = pendingMatches.map((m) => ({
      id: crypto.randomUUID(),
      pageIndex: m.pageIndex,
      xFrac: m.xFrac,
      yFrac: m.yFrac,
      wFrac: m.wFrac,
      hFrac: m.hFrac,
      source: "search" as const,
      label: m.text,
    }));
    addRegions(items);
    setPendingMatches([]);
  };

  const findAndAddAll = async () => {
    if (!file || !searchText.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const matches = await findTextMatches(await file.arrayBuffer(), searchText, { caseSensitive, wholeWord });
      const items: RedactItem[] = matches.map((m) => ({
        id: crypto.randomUUID(),
        pageIndex: m.pageIndex,
        xFrac: m.xFrac,
        yFrac: m.yFrac,
        wFrac: m.wFrac,
        hFrac: m.hFrac,
        source: "search" as const,
        label: m.text,
      }));
      addRegions(items);
      setPendingMatches([]);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("redact.error"));
    } finally {
      setSearching(false);
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType !== "touch") return;
    if ((e.target as HTMLElement).dataset.rid) return;
    e.preventDefault();
    const pt = getRelFrac(e.clientX, e.clientY);
    if (!pt) return;
    overlayRef.current?.setPointerCapture(e.pointerId);
    setSelectedId(null);
    setDraw({ startX: pt.x, startY: pt.y, curX: pt.x, curY: pt.y });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draw) return;
    e.preventDefault();
    const pt = getRelFrac(e.clientX, e.clientY);
    if (!pt) return;
    setDraw((prev) => (prev ? { ...prev, curX: pt.x, curY: pt.y } : null));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!draw) return;
    e.preventDefault();
    const wFrac = Math.abs(draw.curX - draw.startX);
    const hFrac = Math.abs(draw.curY - draw.startY);
    if (wFrac > 0.01 && hFrac > 0.005) {
      const rect = normalizeRect({
        xFrac: Math.min(draw.startX, draw.curX),
        yFrac: Math.min(draw.startY, draw.curY),
        wFrac,
        hFrac,
      });
      const item: RedactItem = {
        id: crypto.randomUUID(),
        pageIndex: targetPage,
        ...rect,
        source: "manual",
      };
      addRegions([item]);
      setSelectedId(item.id);
      orderRef.current += 1;
    }
    setDraw(null);
  };

  const removeRegion = (id: string) => {
    setRegions((prev) => prev.filter((r) => r.id !== id));
    setSelectedId((sel) => (sel === id ? null : sel));
  };

  const undoLast = useCallback(() => {
    setRegions((prev) => prev.slice(0, -1));
    setSelectedId(null);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undoLast();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undoLast]);

  const handleApply = async () => {
    if (!file || regions.length === 0) return;
    setProcessing(true);
    setError(null);
    try {
      const payload: RedactRegion[] = regions.map(({ pageIndex, xFrac, yFrac, wFrac, hFrac }) => ({
        pageIndex,
        xFrac,
        yFrac,
        wFrac,
        hFrac,
      }));
      const bytes = await applyRedactions(await file.arrayBuffer(), payload);
      setResult({
        blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }),
        filename: `${getBaseName(file.name)}-redacted.pdf`,
      });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("redact.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setRegions([]);
    setResult(null);
    setError(null);
    setSearchText("");
    setPendingMatches([]);
    setTargetPage(0);
    setPageCount(0);
    setPreviewError(null);
    setSelectedId(null);
    setDraw(null);
    orderRef.current = 1;
  };

  const goToPage = (n: number) => {
    setTargetPage(Math.min(Math.max(0, n), Math.max(0, pageCount - 1)));
    setSelectedId(null);
  };

  const pageRegions = regions.filter((r) => r.pageIndex === targetPage);
  const drawRect = draw
    ? {
        x: Math.min(draw.startX, draw.curX),
        y: Math.min(draw.startY, draw.curY),
        w: Math.abs(draw.curX - draw.startX),
        h: Math.abs(draw.curY - draw.startY),
      }
    : null;

  return (
    <ToolLayout
      title={t("tools.redactPdf.title")}
      description={t("redact.pageDescription")}
      icon="visibility_off"
      iconClass="bg-neutral-50 text-neutral-600"
    >
      {result ? (
        <ToolCard>
          <DownloadSuccess onDownload={() => downloadBlob(result.blob, result.filename)} onReset={reset} filename={result.filename} />
        </ToolCard>
      ) : (
        <div className="space-y-4">
          <ToolCard>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <ProcessingBadge tier="local" />
            </div>
            <FileDropzone
              onFiles={(f) => {
                setFile(f[0]);
                setRegions([]);
                setResult(null);
                setError(null);
                setSearchText("");
                setPendingMatches([]);
                setTargetPage(0);
                setPageCount(0);
                setPreviewError(null);
                setSelectedId(null);
                orderRef.current = 1;
              }}
              files={file ? [file] : []}
            />
          </ToolCard>

          {file && (
            <>
              <ToolCard className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    {t("redact.search")}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={searchText}
                      onChange={(e) => {
                        setSearchText(e.target.value);
                        setPendingMatches([]);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void handleSearch();
                      }}
                      placeholder={t("redact.searchPlaceholder")}
                      className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900"
                    />
                    <PrimaryButton onClick={handleSearch} loading={searching} className="!px-4 !py-2 shrink-0">
                      {t("redact.find")}
                    </PrimaryButton>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={caseSensitive}
                        onChange={(e) => {
                          setCaseSensitive(e.target.checked);
                          setPendingMatches([]);
                        }}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-slate-600 dark:text-slate-400">{t("redact.caseSensitive")}</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wholeWord}
                        onChange={(e) => {
                          setWholeWord(e.target.checked);
                          setPendingMatches([]);
                        }}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-slate-600 dark:text-slate-400">{t("redact.wholeWord")}</span>
                    </label>
                  </div>
                  {pendingMatches.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2">
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {t("redact.matchCount", { count: pendingMatches.length })}
                      </span>
                      <button
                        type="button"
                        onClick={addPendingMatches}
                        className="text-sm font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400"
                      >
                        {t("redact.addMatches")}
                      </button>
                    </div>
                  )}
                  {searchText.trim() && pendingMatches.length === 0 && !searching && (
                    <div className="mt-3">
                      <SecondaryButton onClick={findAndAddAll} disabled={searching} className="!py-2">
                        <span className="material-symbols-outlined text-[18px]">search</span>
                        {t("redact.redactAll")}
                      </SecondaryButton>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <SecondaryButton onClick={undoLast} disabled={regions.length === 0} className="!py-2">
                    <span className="material-symbols-outlined text-[18px]">undo</span>
                    {t("redact.undoLast")}
                  </SecondaryButton>
                  {regions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setRegions([]);
                        setSelectedId(null);
                      }}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
                      {t("common.clearAll")}
                    </button>
                  )}
                  {regions.length > 0 && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full ml-auto">
                      {t("redact.regions", { count: regions.length })}
                    </span>
                  )}
                </div>
              </ToolCard>

              <ToolCard className="p-4 md:p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("common.pagePreview")}</p>
                    <TouchHint
                      text={isTouch ? t("redact.hintDrawTouch") : t("redact.hintDraw")}
                      icon="visibility_off"
                      className="mt-2"
                    />
                  </div>
                  <PageJumpInput currentPage={targetPage} totalPages={pageCount} onJump={goToPage} />
                </div>

                <div className="relative">
                  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                    <canvas ref={previewCanvasRef} className="block w-full h-auto" />
                  </div>

                  <div
                    ref={overlayRef}
                    className="absolute inset-0 touch-none no-select cursor-crosshair"
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                  >
                    {pageRegions.map((region) => {
                      const isSel = region.id === selectedId;
                      return (
                        <div
                          key={region.id}
                          data-rid={region.id}
                          className="absolute bg-black/90"
                          style={{
                            left: `${region.xFrac * 100}%`,
                            top: `${region.yFrac * 100}%`,
                            width: `${region.wFrac * 100}%`,
                            height: `${region.hFrac * 100}%`,
                            outline: isSel ? "2px solid #14b8a6" : "1px solid rgba(0,0,0,0.6)",
                            zIndex: isSel ? 10 : 1,
                          }}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            setSelectedId(region.id);
                          }}
                        >
                          {isSel && (
                            <button
                              type="button"
                              className="absolute z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow hover:bg-red-500 hover:border-red-500 hover:text-white text-slate-500 dark:text-slate-400 transition-all active:scale-95"
                              style={{
                                width: MIN_TOUCH_TARGET,
                                height: MIN_TOUCH_TARGET,
                                top: -MIN_TOUCH_TARGET / 2,
                                right: -MIN_TOUCH_TARGET / 2,
                              }}
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeRegion(region.id);
                              }}
                            >
                              <span className="material-symbols-outlined text-[18px] leading-none">delete</span>
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {drawRect && (
                      <div
                        className="absolute pointer-events-none bg-black/50 border-2 border-dashed border-neutral-700"
                        style={{
                          left: `${drawRect.x * 100}%`,
                          top: `${drawRect.y * 100}%`,
                          width: `${drawRect.w * 100}%`,
                          height: `${drawRect.h * 100}%`,
                        }}
                      />
                    )}

                    {previewLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-800/70 rounded-xl pointer-events-none">
                        <span className="material-symbols-outlined animate-spin text-teal-500 text-[22px]">progress_activity</span>
                      </div>
                    )}
                    {previewError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/85 dark:bg-slate-800/85 p-4 rounded-xl pointer-events-none">
                        <p className="text-sm text-red-600 dark:text-red-400 text-center">{previewError}</p>
                      </div>
                    )}
                  </div>

                  {pageCount > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label="Previous page"
                        onClick={() => goToPage(targetPage - 1)}
                        disabled={targetPage === 0}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/95 text-slate-700 dark:text-slate-300 shadow-md transition hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                        style={{ width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET }}
                      >
                        <span className="material-symbols-outlined text-[24px]">chevron_left</span>
                      </button>
                      <button
                        type="button"
                        aria-label="Next page"
                        onClick={() => goToPage(targetPage + 1)}
                        disabled={targetPage >= pageCount - 1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/95 text-slate-700 dark:text-slate-300 shadow-md transition hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                        style={{ width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET }}
                      >
                        <span className="material-symbols-outlined text-[24px]">chevron_right</span>
                      </button>
                    </>
                  )}
                </div>
              </ToolCard>

              {regions.length > 0 && (
                <ToolCard>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    {t("redact.boxes")}
                  </p>
                  <div className="space-y-1 max-h-40 overflow-auto">
                    {regions.map((r) => (
                      <div
                        key={r.id}
                        className="text-xs text-slate-600 dark:text-slate-400 flex justify-between items-center gap-2 py-1"
                      >
                        <button
                          type="button"
                          onClick={() => goToPage(r.pageIndex)}
                          className="text-left hover:text-teal-600 dark:hover:text-teal-400 truncate"
                        >
                          {t("redact.page", { page: r.pageIndex + 1 })}
                          {r.label ? ` — “${r.label}”` : ""}
                          {r.source === "manual" ? ` (${t("redact.manual")})` : ""}
                        </button>
                        <button type="button" onClick={() => removeRegion(r.id)} className="text-red-500 shrink-0 px-2">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </ToolCard>
              )}

              <ToolCard>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{t("common.pages")}</p>
                <PDFThumbnails
                  file={file}
                  selectedPages={new Set([targetPage])}
                  onTogglePage={goToPage}
                  onLoaded={setPageCount}
                  columns={6}
                  mobileHorizontalScroll
                />
              </ToolCard>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>
              )}

              <PrimaryButton onClick={handleApply} loading={processing} disabled={regions.length === 0}>
                <span className="material-symbols-outlined text-[18px]">visibility_off</span>
                {regions.length > 0 ? t("redact.buttonCount", { count: regions.length }) : t("redact.apply")}
              </PrimaryButton>
            </>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
