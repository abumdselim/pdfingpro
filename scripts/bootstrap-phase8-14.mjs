import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const tools = JSON.parse(readFileSync(join(ROOT, "scripts/phase8-14-tools.json"), "utf8"));

function camel(id) {
  return id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function slugFromHref(href) {
  return href.replace(/^\//, "");
}

// --- tools.ts ---
const colorMap = {
  "csv-to-pdf": "bg-green-50 text-green-600",
  "pdf-summary": "bg-violet-50 text-violet-600",
  "create-pdf-form": "bg-cyan-50 text-cyan-600",
  "markdown-to-pdf": "bg-stone-50 text-stone-600",
  "bmp-to-pdf": "bg-fuchsia-50 text-fuchsia-600",
  "gif-to-pdf": "bg-pink-50 text-pink-600",
  "insert-pages-pdf": "bg-indigo-50 text-indigo-600",
  "overlay-pdf": "bg-teal-50 text-teal-600",
  "pdf-to-markdown": "bg-stone-50 text-stone-600",
  "json-to-pdf": "bg-amber-50 text-amber-600",
  "add-blank-pages": "bg-sky-50 text-sky-600",
  "shuffle-pdf": "bg-purple-50 text-purple-600",
  "mirror-pdf": "bg-rose-50 text-rose-600",
  "posterize-pdf": "bg-orange-50 text-orange-600",
  "fit-to-page-pdf": "bg-cyan-50 text-cyan-700",
  "page-labels-pdf": "bg-blue-50 text-blue-600",
  "pdf-to-json": "bg-yellow-50 text-yellow-700",
  "tile-pdf": "bg-lime-50 text-lime-600",
  "replace-pages-pdf": "bg-indigo-50 text-indigo-700",
  "add-background-pdf": "bg-emerald-50 text-emerald-600",
  "pdf-validator": "bg-slate-50 text-slate-700",
  "xml-to-pdf": "bg-orange-50 text-orange-700",
  "split-even-odd": "bg-rose-50 text-rose-700",
  "export-bookmarks-pdf": "bg-amber-50 text-amber-700",
  "qr-code-pdf": "bg-neutral-50 text-neutral-700",
  "invoice-pdf": "bg-teal-50 text-teal-700",
  "linearize-pdf": "bg-blue-50 text-blue-700",
  "duplicate-range-pdf": "bg-pink-50 text-pink-700",
  "svg-to-pdf": "bg-indigo-50 text-indigo-800",
  "sort-pages-size-pdf": "bg-violet-50 text-violet-700",
  "pdf-to-pdfa-3": "bg-slate-50 text-slate-800",
  "combine-text-pdf": "bg-stone-50 text-stone-700",
  "remove-metadata-pdf": "bg-red-50 text-red-700",
  "split-every-n-pages": "bg-rose-50 text-rose-600",
};

let toolsSrc = readFileSync(join(ROOT, "lib/tools.ts"), "utf8");
if (!toolsSrc.includes('"csv-to-pdf"')) {
  const block = tools
    .map(
      (t) => `  {
    id: "${t.id}",
    titleKey: "tools.${camel(t.id)}.title",
    descriptionKey: "tools.${camel(t.id)}.description",
    icon: "${t.icon}",
    href: "${t.href}",
    category: "${t.category}",
    color: icon("${colorMap[t.id] || t.color}"),
  },`
    )
    .join("\n");
  toolsSrc = toolsSrc.replace(
    "  // Security\n  {\n    id: \"protect-pdf\",",
    `${block}\n\n  // Security\n  {\n    id: \"protect-pdf\",`
  );
  writeFileSync(join(ROOT, "lib/tools.ts"), toolsSrc);
}

// themes
const themeMap = {
  "csv-to-pdf": "bg-green-700 border-green-800",
  "pdf-summary": "bg-violet-700 border-violet-800",
  "create-pdf-form": "bg-cyan-700 border-cyan-800",
  "markdown-to-pdf": "bg-stone-600 border-stone-700",
  "bmp-to-pdf": "bg-fuchsia-600 border-fuchsia-700",
  "gif-to-pdf": "bg-pink-600 border-pink-700",
  "insert-pages-pdf": "bg-indigo-600 border-indigo-700",
  "overlay-pdf": "bg-teal-700 border-teal-800",
  "pdf-to-markdown": "bg-stone-600 border-stone-700",
  "json-to-pdf": "bg-amber-700 border-amber-800",
  "add-blank-pages": "bg-sky-600 border-sky-700",
  "shuffle-pdf": "bg-purple-700 border-purple-800",
  "mirror-pdf": "bg-rose-700 border-rose-800",
  "posterize-pdf": "bg-orange-700 border-orange-800",
  "fit-to-page-pdf": "bg-cyan-800 border-cyan-900",
  "page-labels-pdf": "bg-blue-600 border-blue-700",
  "pdf-to-json": "bg-yellow-600 border-yellow-700",
  "tile-pdf": "bg-lime-600 border-lime-700",
  "replace-pages-pdf": "bg-indigo-800 border-indigo-900",
  "add-background-pdf": "bg-emerald-700 border-emerald-800",
  "pdf-validator": "bg-slate-800 border-slate-900",
  "xml-to-pdf": "bg-orange-800 border-orange-900",
  "split-even-odd": "bg-rose-800 border-rose-900",
  "export-bookmarks-pdf": "bg-amber-800 border-amber-900",
  "qr-code-pdf": "bg-neutral-700 border-neutral-800",
  "invoice-pdf": "bg-teal-800 border-teal-900",
  "linearize-pdf": "bg-blue-800 border-blue-900",
  "duplicate-range-pdf": "bg-pink-700 border-pink-800",
  "svg-to-pdf": "bg-indigo-900 border-indigo-950",
  "sort-pages-size-pdf": "bg-violet-800 border-violet-900",
  "pdf-to-pdfa-3": "bg-slate-900 border-slate-950",
  "combine-text-pdf": "bg-stone-700 border-stone-800",
  "remove-metadata-pdf": "bg-red-800 border-red-900",
  "split-every-n-pages": "bg-rose-600 border-rose-700",
};

let themesSrc = readFileSync(join(ROOT, "lib/home-card-themes.ts"), "utf8");
if (!themesSrc.includes('"csv-to-pdf"')) {
  const lines = tools
    .map((t) => {
      const [bg, border] = (themeMap[t.id] || "bg-slate-600 border-slate-700").split(" ");
      return `  "${t.id}": solid("${bg}", "${border}", ON_DARK),`;
    })
    .join("\n");
  themesSrc = themesSrc.replace(/\n};\n\nexport function getToolCardTheme/, `\n${lines}\n};\n\nexport function getToolCardTheme`);
  writeFileSync(join(ROOT, "lib/home-card-themes.ts"), themesSrc);
}

// motions
let motionsSrc = readFileSync(join(ROOT, "components/home/card-motions/motions.tsx"), "utf8");
if (!motionsSrc.includes('"csv-to-pdf"')) {
  const lines = tools.map((t) => `  "${t.id}": ${t.motion},`).join("\n");
  motionsSrc = motionsSrc.replace(/\n};\n$/, `\n${lines}\n};\n`);
  writeFileSync(join(ROOT, "components/home/card-motions/motions.tsx"), motionsSrc);
}

// locales
const localesPath = join(ROOT, "locales/en.json");
const locales = JSON.parse(readFileSync(localesPath, "utf8"));
for (const t of tools) {
  const k = camel(t.id);
  locales[`tools.${k}.title`] = t.title;
  locales[`tools.${k}.description`] = t.desc;
  locales[`${k}.pageDescription`] = t.desc;
  locales[`${k}.button`] = "Process";
  locales[`${k}.error`] = "Processing failed.";
}
locales["home.comingSoon.item.aiSummary"] = "Batch OCR";
locales["home.comingSoon.item.formBuilder"] = "Cloud backup";
locales["home.comingSoon.item.pdfa3"] = "Team workspaces";
locales["home.comingSoon.item.csvToPdf"] = "API access";
writeFileSync(localesPath, JSON.stringify(locales, null, 2) + "\n");

// tool-search aliases
let searchSrc = readFileSync(join(ROOT, "lib/tool-search.ts"), "utf8");
if (!searchSrc.includes('"csv-to-pdf"')) {
  const aliases = tools.map((t) => `  "${t.id}": ["${t.title.toLowerCase()}"],`).join("\n");
  searchSrc = searchSrc.replace(/\n};\n\nexport const SUGGESTED/, `\n${aliases}\n};\n\nexport const SUGGESTED`);
  writeFileSync(join(ROOT, "lib/tool-search.ts"), searchSrc);
}

// pages - use shared generic processor page
for (const t of tools) {
  const slug = slugFromHref(t.href);
  const dir = join(ROOT, "app", "(tools)", slug);
  mkdirSync(dir, { recursive: true });
  const pagePath = join(dir, "page.tsx");
  try {
    readFileSync(pagePath);
    continue;
  } catch {
    writeFileSync(
      pagePath,
      `"use client";

import GenericToolPage from "@/components/tools/GenericToolPage";

export default function Page() {
  return <GenericToolPage toolId="${t.id}" />;
}
`
    );
  }
}

console.log(`Bootstrapped ${tools.length} tools with generic pages.`);
