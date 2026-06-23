import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const tools = JSON.parse(readFileSync(join(ROOT, "scripts/phase8-14-tools.json"), "utf8"));

// --- tools.ts ---
const toolsPath = join(ROOT, "lib/tools.ts");
let toolsSrc = readFileSync(toolsPath, "utf8");
const marker = "  // Security\n  {\n    id: \"protect-pdf\",";

const newEntries = tools
  .map((t) => {
    const light = t.color.replace("bg-", "").split(" ")[0];
    const dark = t.color.split(" ")[1] || "text-white";
    return `  {
    id: "${t.id}",
    titleKey: "tools.${camel(t.id)}.title",
    descriptionKey: "tools.${camel(t.id)}.description",
    icon: "${t.icon}",
    href: "${t.href}",
    category: "${t.category}",
    color: icon("bg-${light.split("-")[0]}-${light.split("-")[1] || "50"} ${dark}"),
  },`;
  })
  .join("\n");

function camel(id) {
  return id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

if (!toolsSrc.includes('"csv-to-pdf"')) {
  toolsSrc = toolsSrc.replace(marker, `${newEntries}\n\n${marker}`);
  writeFileSync(toolsPath, toolsSrc);
  console.log("Updated tools.ts");
}

// --- themes ---
const themesPath = join(ROOT, "lib/home-card-themes.ts");
let themesSrc = readFileSync(themesPath, "utf8");
if (!themesSrc.includes('"csv-to-pdf"')) {
  const themeLines = tools
    .map((t) => `  "${t.id}": solid("${t.theme.replace("bg-", "bg-")}", "${t.theme.replace("bg-", "border-")}", ON_DARK),`)
    .join("\n");
  themesSrc = themesSrc.replace(/\n};\n\nexport function getToolCardTheme/, `\n${themeLines}\n};\n\nexport function getToolCardTheme`);
  writeFileSync(themesPath, themesSrc);
  console.log("Updated themes");
}

// --- motions ---
const motionsPath = join(ROOT, "components/home/card-motions/motions.tsx");
let motionsSrc = readFileSync(motionsPath, "utf8");
if (!motionsSrc.includes('"csv-to-pdf"')) {
  const motionLines = tools.map((t) => `  "${t.id}": ${t.motion},`).join("\n");
  motionsSrc = motionsSrc.replace(/\n};\n$/, `\n${motionLines}\n};\n`);
  writeFileSync(motionsPath, motionsSrc);
  console.log("Updated motions");
}

// --- locales (minimal) ---
const localesPath = join(ROOT, "locales/en.json");
const locales = JSON.parse(readFileSync(localesPath, "utf8"));
for (const t of tools) {
  const key = camel(t.id);
  locales[`tools.${key}.title`] = t.title;
  locales[`tools.${key}.description`] = t.desc;
  locales[`${key}.pageDescription`] = t.desc;
  locales[`${key}.button`] = "Process";
  locales[`${key}.error`] = "Processing failed.";
}
locales["home.comingSoon.item.aiSummary"] = "AI redaction";
locales["home.comingSoon.item.formBuilder"] = "Batch OCR";
locales["home.comingSoon.item.pdfa3"] = "Cloud sync";
locales["home.comingSoon.item.csvToPdf"] = "API access";
writeFileSync(localesPath, JSON.stringify(locales, null, 2) + "\n");
console.log("Updated locales");

console.log(`Registered ${tools.length} tools.`);

function icon(s) {
  return s; // placeholder - tools.ts uses icon() helper
}
