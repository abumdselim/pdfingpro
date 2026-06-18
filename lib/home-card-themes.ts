/** Solid full-color card themes (JIT-safe static Tailwind classes). */

export interface CardTheme {
  surface: string;
  border: string;
  watermark: string;
  icon: string;
  title: string;
  arrow: string;
}

/** White text — for mid/dark saturated backgrounds */
const ON_DARK: Omit<CardTheme, "surface" | "border"> = {
  watermark: "text-white",
  icon: "bg-white/20 text-white ring-1 ring-white/30 shadow-md",
  title: "text-white",
  arrow: "bg-white/20 text-white ring-1 ring-white/30",
};

/** Dark text — for bright yellow/lime/amber backgrounds */
const ON_LIGHT: Omit<CardTheme, "surface" | "border"> = {
  watermark: "text-slate-900",
  icon: "bg-black/10 text-slate-900 ring-1 ring-black/10 shadow-md",
  title: "text-slate-900",
  arrow: "bg-black/10 text-slate-900 ring-1 ring-black/10",
};

function solid(bg: string, border: string, text: typeof ON_DARK): CardTheme {
  return { surface: bg, border, ...text };
}

export const TOOL_CARD_THEMES: Record<string, CardTheme> = {
  "merge-pdf": solid("bg-indigo-600", "border-indigo-700", ON_DARK),
  "split-pdf": solid("bg-rose-500", "border-rose-600", ON_DARK),
  "organize-pdf": solid("bg-orange-500", "border-orange-600", ON_DARK),
  "add-page-numbers": solid("bg-sky-500", "border-sky-600", ON_DARK),
  "pdf-to-jpg": solid("bg-orange-600", "border-orange-700", ON_DARK),
  "jpg-to-pdf": solid("bg-fuchsia-600", "border-fuchsia-700", ON_DARK),
  "pdf-to-word": solid("bg-blue-600", "border-blue-700", ON_DARK),
  "website-to-pdf": solid("bg-cyan-600", "border-cyan-700", ON_DARK),
  "compress-pdf": solid("bg-emerald-600", "border-emerald-700", ON_DARK),
  "rotate-pdf": solid("bg-purple-600", "border-purple-700", ON_DARK),
  "watermark-pdf": solid("bg-teal-600", "border-teal-700", ON_DARK),
  "sign-pdf": solid("bg-pink-600", "border-pink-700", ON_DARK),
  "highlight-pdf": solid("bg-yellow-400", "border-yellow-500", ON_LIGHT),
  "stamp-pdf": solid("bg-lime-500", "border-lime-600", ON_LIGHT),
  "crop-pdf": solid("bg-green-600", "border-green-700", ON_DARK),
  "add-padding-pdf": solid("bg-slate-600", "border-slate-700", ON_DARK),
  "ocr-pdf": solid("bg-violet-600", "border-violet-700", ON_DARK),
  "protect-pdf": solid("bg-red-600", "border-red-700", ON_DARK),
  "unlock-pdf": solid("bg-green-500", "border-green-600", ON_DARK),
};

export function getToolCardTheme(toolId: string): CardTheme {
  return TOOL_CARD_THEMES[toolId] ?? TOOL_CARD_THEMES["merge-pdf"];
}
