"use client";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export type BatchItemStatus = "pending" | "processing" | "done" | "error";

export interface BatchQueueItem {
  id: string;
  file: File;
  status: BatchItemStatus;
  error?: string;
}

interface BatchFileQueueProps {
  items: BatchQueueItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
  className?: string;
}

export default function BatchFileQueue({ items, onRemove, onClear, className }: BatchFileQueueProps) {
  const { t } = useTranslation();

  if (items.length === 0) return null;

  const statusIcon: Record<BatchItemStatus, string> = {
    pending: "schedule",
    processing: "progress_activity",
    done: "check_circle",
    error: "error",
  };

  const statusClass: Record<BatchItemStatus, string> = {
    pending: "text-slate-400",
    processing: "text-teal-600 animate-spin",
    done: "text-emerald-600",
    error: "text-red-600",
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {t("batch.queueCount", { count: items.length })}
        </p>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
          {t("common.clearAll")}
        </button>
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-sm shadow-sm"
        >
          <span className={cn("material-symbols-outlined text-[18px]", statusClass[item.status])}>
            {statusIcon[item.status]}
          </span>
          <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-[18px]">picture_as_pdf</span>
          <span className="flex-1 truncate text-slate-700 dark:text-slate-300 font-medium">{item.file.name}</span>
          {item.error && (
            <span className="text-xs text-red-500 truncate max-w-[120px]" title={item.error}>
              {item.error}
            </span>
          )}
          {item.status === "pending" && (
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="text-slate-400 hover:text-red-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export function createBatchId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
