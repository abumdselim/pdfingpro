/**
 * Semantic UI class strings — every token includes explicit light + dark pairs.
 * Import these instead of raw Tailwind for consistent theming across tools.
 */
export const ui = {
  /** Page typography */
  heading: "text-slate-900 dark:text-slate-100",
  subheading: "text-slate-800 dark:text-slate-200",
  body: "text-slate-600 dark:text-slate-400",
  muted: "text-slate-500 dark:text-slate-400",
  faint: "text-slate-400 dark:text-slate-500",

  /** Section labels inside tool cards */
  sectionLabel:
    "text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500",

  /** Form */
  label: "text-sm font-medium text-slate-700 dark:text-slate-300",
  input:
    "w-full min-h-11 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1461bd]/20 dark:focus:ring-teal-500/25 focus:border-[#1461bd] dark:focus:border-teal-500 transition-colors",
  select:
    "min-h-11 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1461bd]/20 dark:focus:ring-teal-500/25 focus:border-[#1461bd] dark:focus:border-teal-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors",

  /** Surfaces */
  surface: "bg-white dark:bg-slate-900",
  surfaceMuted: "bg-slate-50 dark:bg-slate-900/50",
  surfaceSubtle: "bg-slate-100 dark:bg-slate-800",
  border: "border-slate-200/80 dark:border-slate-700/80",
  borderStrong: "border-slate-300 dark:border-slate-600",

  /** Navigation */
  backLink:
    "inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors",

  /** Pills / option buttons */
  pillActive:
    "border-[#1461bd] bg-[#1461bd]/[0.06] dark:border-teal-500 dark:bg-teal-950/40 text-[#1461bd] dark:text-teal-300 shadow-sm",
  pillInactive:
    "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/80 dark:hover:bg-slate-800/50",

  /** Toggle group (segmented control) */
  toggleGroup:
    "inline-flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-900/80 p-1",
  toggleActive:
    "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm",
  toggleInactive:
    "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200",

  /** Alerts */
  error:
    "flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-lg border border-red-200/80 dark:border-red-900/50",
  errorText: "text-sm text-red-600 dark:text-red-400",
  warning:
    "rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/25 p-4 sm:p-5",
  warningIcon: "w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300",
  warningTitle: "font-semibold text-amber-900 dark:text-amber-200",
  warningBody: "mt-1 text-sm text-amber-800 dark:text-amber-300/90 leading-relaxed",

  /** PDF preview chrome */
  previewFrame:
    "border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden",
  previewNavBtn:
    "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#1461bd] dark:hover:text-teal-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95",
  previewLoadingOverlay:
    "absolute inset-0 flex items-center justify-center bg-white/75 dark:bg-slate-900/75 rounded-lg pointer-events-none",
  previewHintOverlay:
    "absolute inset-0 flex items-center justify-center bg-white/85 dark:bg-slate-900/85 p-4 rounded-lg pointer-events-none",
  previewHintBadge:
    "rounded-md border border-dashed border-[#1461bd]/30 dark:border-teal-600/50 bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-[#1461bd] dark:text-teal-300 pointer-events-none whitespace-nowrap",
  previewHandle:
    "bg-white dark:bg-slate-200 border-2 border-[#1461bd] dark:border-teal-500 rounded-sm shadow-sm z-20 touch-none",
  previewDeleteBtn:
    "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-lg flex items-center justify-center shadow-sm hover:bg-red-500 hover:border-red-500 hover:text-white transition-all active:scale-95",

  /** Always white — signature pads, iframe previews, PDF canvas */
  canvasSurface: "bg-white",

  /** File list / dropzone */
  fileRow:
    "flex items-center gap-3 rounded-lg border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700/80 dark:bg-slate-800/40",
  dropzone:
    "border-slate-200/90 bg-white shadow-sm dark:border-slate-700/90 dark:bg-slate-900/50 hover:border-[#1461bd]/35 hover:shadow-md dark:hover:border-teal-500/40",
  dropzoneActive:
    "border-[#1461bd] bg-[#1461bd]/[0.03] shadow-md ring-2 ring-[#1461bd]/10 dark:border-teal-500 dark:bg-teal-950/20 dark:ring-teal-500/10",

  /** Code / pre blocks */
  codeBlock:
    "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg p-4 text-sm overflow-auto",

  /** Icon badge (tool headers) */
  iconBadge:
    "bg-[#1461bd]/10 dark:bg-teal-950/50 text-[#1461bd] dark:text-teal-400",

  /** Progress track */
  progressTrack: "h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden",
} as const;

/** Append dark-mode pairs to tool icon colors from lib/tools.ts */
export function withDarkIcon(lightClasses: string): string {
  const map: Record<string, string> = {
    "bg-indigo-50 text-indigo-600": "dark:bg-indigo-950/50 dark:text-indigo-400",
    "bg-rose-50 text-rose-600": "dark:bg-rose-950/50 dark:text-rose-400",
    "bg-amber-50 text-amber-600": "dark:bg-amber-950/50 dark:text-amber-400",
    "bg-sky-50 text-sky-600": "dark:bg-sky-950/50 dark:text-sky-400",
    "bg-orange-50 text-orange-600": "dark:bg-orange-950/50 dark:text-orange-400",
    "bg-fuchsia-50 text-fuchsia-600": "dark:bg-fuchsia-950/50 dark:text-fuchsia-400",
    "bg-blue-50 text-blue-600": "dark:bg-blue-950/50 dark:text-blue-400",
    "bg-stone-50 text-stone-600": "dark:bg-stone-900/50 dark:text-stone-400",
    "bg-emerald-50 text-emerald-600": "dark:bg-emerald-950/50 dark:text-emerald-400",
    "bg-purple-50 text-purple-600": "dark:bg-purple-950/50 dark:text-purple-400",
    "bg-cyan-50 text-cyan-600": "dark:bg-cyan-950/50 dark:text-cyan-400",
    "bg-pink-50 text-pink-600": "dark:bg-pink-950/50 dark:text-pink-400",
    "bg-yellow-50 text-yellow-600": "dark:bg-yellow-950/50 dark:text-yellow-400",
    "bg-teal-50 text-teal-600": "dark:bg-teal-950/50 dark:text-teal-400",
    "bg-lime-50 text-lime-600": "dark:bg-lime-950/50 dark:text-lime-400",
    "bg-slate-100 text-slate-700": "dark:bg-slate-800 dark:text-slate-300",
    "bg-violet-50 text-violet-600": "dark:bg-violet-950/50 dark:text-violet-400",
    "bg-red-50 text-red-600": "dark:bg-red-950/50 dark:text-red-400",
    "bg-green-50 text-green-600": "dark:bg-green-950/50 dark:text-green-400",
    "bg-zinc-50 text-zinc-600": "dark:bg-zinc-900/50 dark:text-zinc-400",
    "bg-neutral-50 text-neutral-600": "dark:bg-neutral-900/50 dark:text-neutral-400",
  };
  const dark = map[lightClasses.trim()];
  return dark ? `${lightClasses} ${dark}` : lightClasses;
}
