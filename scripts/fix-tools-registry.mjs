import { readFileSync, writeFileSync } from "node:fs";

const tools = JSON.parse(readFileSync("scripts/phase8-14-tools.json", "utf8"));

function camel(id) {
  return id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

let src = readFileSync("lib/tools.ts", "utf8");
if (!src.includes('"csv-to-pdf"')) {
  const block = tools
    .map(
      (t) => `  {
    id: "${t.id}",
    titleKey: "tools.${camel(t.id)}.title",
    descriptionKey: "tools.${camel(t.id)}.description",
    icon: "${t.icon}",
    href: "${t.href}",
    category: "${t.category}",
    color: icon("${t.color}"),
  },`
    )
    .join("\n");
  src = src.replace("  // Security", `${block}\n\n  // Security`);
  writeFileSync("lib/tools.ts", src);
  console.log("tools.ts updated");
} else {
  console.log("tools.ts already has csv-to-pdf");
}

// Fix themes if missing
let themes = readFileSync("lib/home-card-themes.ts", "utf8");
if (!themes.includes('"csv-to-pdf"')) {
  const lines = tools.map((t) => `  "${t.id}": solid("${t.theme}", "${t.theme.replace("bg-", "border-")}", ON_DARK),`).join("\n");
  themes = themes.replace(/\r?\n};\r?\n\r?\nexport function getToolCardTheme/, `\n${lines}\n};\n\nexport function getToolCardTheme`);
  writeFileSync("lib/home-card-themes.ts", themes);
  console.log("themes updated");
}

let motions = readFileSync("components/home/card-motions/motions.tsx", "utf8");
if (!motions.includes('"csv-to-pdf"')) {
  const lines = tools.map((t) => `  "${t.id}": ${t.motion},`).join("\n");
  motions = motions.replace(/\n};\r?\n$/, `\n${lines}\n};\n`);
  writeFileSync("components/home/card-motions/motions.tsx", motions);
  console.log("motions updated");
}
