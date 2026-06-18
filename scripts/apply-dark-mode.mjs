/**
 * Adds explicit dark: Tailwind pairs to tool page class strings.
 * Skips canvas/iframe surfaces that must stay white.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const toolsDir = join(__dirname, "../app/(tools)");

const SKIP_LINE =
  /cursor-crosshair|min-h-\[480px\]|h-\[70vh\].*bg-white|bg-white.*h-\[70vh\]|iframe|ds-canvas|canvasSurface/;

const TOKEN_DARK = {
  "text-slate-900": "dark:text-slate-100",
  "text-slate-800": "dark:text-slate-200",
  "text-slate-700": "dark:text-slate-300",
  "text-slate-600": "dark:text-slate-400",
  "text-slate-500": "dark:text-slate-400",
  "text-slate-400": "dark:text-slate-500",
  "text-slate-300": "dark:text-slate-600",
  "text-red-600": "dark:text-red-400",
  "text-red-900": "dark:text-red-300",
  "text-amber-900": "dark:text-amber-200",
  "text-amber-800": "dark:text-amber-300",
  "text-amber-700": "dark:text-amber-300",
  "text-teal-700": "dark:text-teal-300",
  "text-teal-600": "dark:text-teal-400",
  "text-indigo-700": "dark:text-indigo-300",
  "text-blue-600": "dark:text-blue-400",
  "bg-white": "dark:bg-slate-800",
  "bg-white/95": "dark:bg-slate-800/95",
  "bg-white/90": "dark:bg-slate-800/90",
  "bg-white/85": "dark:bg-slate-900/85",
  "bg-white/80": "dark:bg-slate-900/80",
  "bg-white/70": "dark:bg-slate-900/70",
  "bg-slate-50": "dark:bg-slate-900/50",
  "bg-slate-50/30": "dark:bg-slate-900/30",
  "bg-slate-100": "dark:bg-slate-800",
  "bg-slate-200": "dark:bg-slate-700",
  "bg-teal-50": "dark:bg-teal-950/40",
  "bg-teal-50/50": "dark:bg-teal-950/40",
  "bg-teal-50/20": "dark:bg-teal-950/20",
  "bg-teal-100": "dark:bg-teal-900/40",
  "bg-blue-50": "dark:bg-blue-950/40",
  "bg-blue-50/50": "dark:bg-blue-950/40",
  "bg-red-50": "dark:bg-red-950/30",
  "bg-amber-50": "dark:bg-amber-950/25",
  "bg-amber-100": "dark:bg-amber-900/40",
  "bg-yellow-50": "dark:bg-yellow-950/40",
  "bg-indigo-50": "dark:bg-indigo-950/40",
  "bg-orange-50": "dark:bg-orange-950/40",
  "bg-emerald-50": "dark:bg-emerald-950/40",
  "bg-purple-50": "dark:bg-purple-950/40",
  "bg-violet-50": "dark:bg-violet-950/40",
  "bg-pink-50": "dark:bg-pink-950/40",
  "bg-cyan-50": "dark:bg-cyan-950/40",
  "bg-lime-50": "dark:bg-lime-950/40",
  "bg-green-50": "dark:bg-green-950/40",
  "bg-rose-50": "dark:bg-rose-950/40",
  "bg-fuchsia-50": "dark:bg-fuchsia-950/40",
  "bg-sky-50": "dark:bg-sky-950/40",
  "bg-stone-50": "dark:bg-stone-900/40",
  "border-slate-200": "dark:border-slate-700",
  "border-slate-200/80": "dark:border-slate-700/80",
  "border-slate-200/60": "dark:border-slate-700/60",
  "border-slate-300": "dark:border-slate-600",
  "border-slate-300/80": "dark:border-slate-600/80",
  "border-teal-200": "dark:border-teal-800/50",
  "border-teal-300": "dark:border-teal-600",
  "border-amber-200": "dark:border-amber-800/50",
  "border-red-200": "dark:border-red-800/50",
  "hover:bg-slate-50": "dark:hover:bg-slate-800",
  "hover:bg-white": "dark:hover:bg-slate-700",
  "hover:text-slate-800": "dark:hover:text-slate-200",
  "hover:text-slate-900": "dark:hover:text-slate-100",
  "hover:text-slate-700": "dark:hover:text-slate-300",
  "hover:text-slate-600": "dark:hover:text-slate-400",
  "hover:border-slate-300": "dark:hover:border-slate-500",
  "hover:border-slate-400": "dark:hover:border-slate-500",
  "hover:bg-teal-50": "dark:hover:bg-teal-950/40",
  "hover:bg-red-50": "dark:hover:bg-red-950/30",
  "focus:ring-teal-100": "dark:focus:ring-teal-900/50",
  "ring-teal-100": "dark:ring-teal-900/50",
  "from-teal-50": "dark:from-teal-950/40",
  "to-teal-100": "dark:to-teal-900/40",
};

function patchClassString(classStr) {
  let result = classStr;
  for (const [light, dark] of Object.entries(TOKEN_DARK)) {
    const escaped = light.replace(/\//g, "\\/");
    const re = new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, "g");
    result = result.replace(re, (match, offset) => {
      const after = result.slice(offset + match.length, offset + match.length + dark.length + 1);
      if (after.startsWith(" " + dark) || after.startsWith(dark)) return match;
      const beforeContext = result.slice(Math.max(0, offset - 80), offset + match.length + 40);
      if (beforeContext.includes(dark)) return match;
      return `${match} ${dark}`;
    });
  }
  return result;
}

function patchFile(content) {
  const lines = content.split("\n");
  return lines
    .map((line) => {
      if (SKIP_LINE.test(line)) return line;
      if (!line.includes("className")) return line;
      return line.replace(/className=\{?(`[^`]+`|"[^"]+"|\{[^}]+\})\}?/g, (match) => {
        if (match.includes("dark:")) {
          // still patch tokens missing dark pairs inside template literals
        }
        if (match.startsWith('className={`') || match.startsWith("className={`")) {
          const inner = match.slice(12, -2);
          return `className={\`${patchClassString(inner)}\`}`;
        }
        if (match.startsWith('className="')) {
          const inner = match.slice(11, -1);
          return `className="${patchClassString(inner)}"`;
        }
        if (match.startsWith("className={'")) {
          const inner = match.slice(12, -2);
          return `className={'${patchClassString(inner)}'}`;
        }
        return match;
      });
    })
    .join("\n");
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".tsx")) {
      const before = readFileSync(p, "utf8");
      const after = patchFile(before);
      if (after !== before) {
        writeFileSync(p, after);
        console.log("patched:", p.replace(/\\/g, "/"));
      }
    }
  }
}

walk(toolsDir);

// Also patch contact + legal content
for (const rel of [
  "../app/contact/ContactPageContent.tsx",
  "../app/privacy/PrivacyPageContent.tsx",
  "../app/terms/TermsPageContent.tsx",
  "../components/layout/LegalPageLayout.tsx",
  "../components/layout/Header.tsx",
  "../app/page.tsx",
]) {
  const p = join(__dirname, rel);
  try {
    const before = readFileSync(p, "utf8");
    const after = patchFile(before);
    if (after !== before) {
      writeFileSync(p, after);
      console.log("patched:", rel);
    }
  } catch {
    /* skip missing */
  }
}

console.log("Done.");
