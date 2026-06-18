"use client";

import { useEffect, useState } from "react";
import { renderAllPageThumbnails } from "@/lib/pdf/core";
import { cn } from "@/lib/utils";
import { isTouchDevice } from "@/lib/touch-utils";

interface PDFThumbnailsProps {
  file: File | null;
  selectedPages?: Set<number>;      // 0-indexed
  onTogglePage?: (index: number) => void;
  showLabels?: boolean;
  columns?: number;
  className?: string;
  /** Called when thumbnails finish loading */
  onLoaded?: (count: number) => void;
  /** Enable horizontal scroll on mobile (default: false) */
  mobileHorizontalScroll?: boolean;
}

export default function PDFThumbnails({
  file,
  selectedPages,
  onTogglePage,
  showLabels = true,
  columns = 4,
  className,
  onLoaded,
  mobileHorizontalScroll = false,
}: PDFThumbnailsProps) {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTouch] = useState(() => isTouchDevice());

  useEffect(() => {
    if (!file) {
      setThumbnails([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    file.arrayBuffer().then((buf) => {
      if (cancelled) return;
      return renderAllPageThumbnails(buf, 0.35);
    }).then((thumbs) => {
      if (cancelled || !thumbs) return;
      setThumbnails(thumbs);
      onLoaded?.(thumbs.length);
    }).catch((err) => {
      if (!cancelled) setError(err?.message ?? "Failed to render pages");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [file, onLoaded]);

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
    6: "grid-cols-3 sm:grid-cols-4 md:grid-cols-6",
  }[columns] ?? "grid-cols-4";

  if (loading) {
    const skeletonArray = Array(columns).fill(0);
    return (
      <div className={cn(`grid gap-4 ${gridCols}`, className)}>
        {skeletonArray.map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/50 shadow-sm relative animate-pulse" style={{ aspectRatio: "1 / 1.414" }}>
            <div className="absolute inset-0 animate-shimmer" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-200/80" />
            <div className="absolute bottom-3 left-3 right-3 h-2.5 rounded-full bg-slate-200/80" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl">
        <span className="material-symbols-outlined text-[20px]">error</span>
        <span className="text-sm font-medium">{error}</span>
      </div>
    );
  }

  if (thumbnails.length === 0) return null;


  // Mobile horizontal scroll mode
  if (mobileHorizontalScroll && isTouch) {
    return (
      <div className={cn("overflow-x-auto touch-scroll pb-4 -mx-4 px-4 snap-x snap-mandatory", className)}>
        <div className="flex gap-4" style={{ minWidth: "min-content" }}>
          {thumbnails.map((src, i) => {
            const selected = selectedPages?.has(i) ?? false;
            return (
              <div
                key={i}
                onClick={() => onTogglePage?.(i)}
                className={cn(
                  "group relative rounded-2xl border-2 overflow-hidden transition-all duration-300 shrink-0 snap-center shadow-card bg-white",
                  onTogglePage ? "cursor-pointer active:scale-[0.98]" : "",
                  selected
                    ? "border-teal-500 ring-4 ring-teal-500/20 shadow-modern scale-[1.02] z-10"
                    : "border-slate-200/80"
                )}
                style={{ width: "130px" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Page ${i + 1}`}
                  className="w-full h-auto block"
                  style={{ aspectRatio: "1 / 1.414", objectFit: "cover" }}
                />
                {selected && (
                  <div className="absolute inset-0 bg-teal-600/10 backdrop-blur-[1px] flex items-center justify-center transition-all">
                    <div className="bg-white rounded-full shadow-sm">
                      <span className="material-symbols-outlined text-teal-600 icon-filled text-[36px] drop-shadow-md">
                        check_circle
                      </span>
                    </div>
                  </div>
                )}
                {showLabels && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/60 to-transparent py-2 px-3">
                    <span className="text-white text-xs font-bold drop-shadow-sm">{i + 1}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Standard grid layout
  return (
    <div className={cn(`grid gap-5 ${gridCols}`, className)}>
      {thumbnails.map((src, i) => {
        const selected = selectedPages?.has(i) ?? false;
        return (
          <div
            key={i}
            onClick={() => onTogglePage?.(i)}
            className={cn(
              "group relative rounded-2xl border-2 overflow-hidden transition-all duration-300 shadow-card bg-white",
              onTogglePage ? "cursor-pointer active:scale-[0.98] hover:-translate-y-1 hover:shadow-modern" : "",
              selected
                ? "border-teal-500 ring-4 ring-teal-500/20 shadow-glow scale-[1.02] z-10 hover:border-teal-400"
                : "border-slate-200/80 hover:border-teal-300/50"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Page ${i + 1}`}
              className="w-full h-auto block transition-transform duration-500"
              style={{ aspectRatio: "1 / 1.414", objectFit: "cover" }}
            />
            {selected && (
              <div className="absolute inset-0 bg-teal-600/10 backdrop-blur-[1px] flex items-center justify-center transition-all">
                <div className="bg-white rounded-full shadow-sm animate-fade-in-up">
                  <span className="material-symbols-outlined text-teal-600 icon-filled text-[40px] drop-shadow-md">
                    check_circle
                  </span>
                </div>
              </div>
            )}
            {showLabels && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/60 to-transparent pt-6 pb-2 px-3 opacity-90 transition-opacity group-hover:opacity-100">
                <span className="text-white text-xs font-bold drop-shadow-sm">{i + 1}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
