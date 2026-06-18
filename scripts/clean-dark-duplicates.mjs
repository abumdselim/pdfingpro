/** Removes duplicate/broken dark: classes left by apply-dark-mode.mjs */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function clean(content) {
  let s = content;
  const fixes = [
    [/ dark:text-slate-400 dark:text-slate-500/g, " dark:text-slate-400"],
    [/ dark:text-slate-300 dark:text-slate-600/g, " dark:text-slate-300"],
    [/ dark:text-slate-500 dark:text-slate-400/g, " dark:text-slate-400"],
    [/ dark:from-teal-950\/40\/50/g, " dark:from-teal-950/30"],
    [/hover:bg-slate-200 dark:bg-slate-700/g, "hover:bg-slate-200 dark:hover:bg-slate-700"],
    [/hover:bg-slate-50 dark:bg-slate-900\/50/g, "hover:bg-slate-50 dark:hover:bg-slate-800"],
    [/hover:bg-white dark:hover:bg-slate-700 dark:bg-slate-800/g, "hover:bg-white dark:hover:bg-slate-700"],
    [/hover:text-slate-800 dark:hover:text-slate-200 dark:text-slate-200/g, "hover:text-slate-800 dark:hover:text-slate-200"],
    [/group-hover:text-slate-900 dark:text-slate-100/g, "group-hover:text-slate-900 dark:group-hover:text-slate-100"],
    [/hover:text-red-600 dark:text-red-400/g, "hover:text-red-600 dark:hover:text-red-400"],
    [/hover:text-teal-700 dark:text-teal-300/g, "hover:text-teal-700 dark:hover:text-teal-300"],
    [/text-slate-700 dark:text-slate-300 dark:text-teal-300/g, "text-slate-700 dark:text-teal-300"],
    [/ dark:ring-teal-900\/50 dark:focus:ring-teal-900\/50/g, " dark:focus:ring-teal-900/50"],
    [/ dark:ring-teal-900\/50(?![\w-/])/g, ""],
  ];
  for (const [re, rep] of fixes) s = s.replace(re, rep);
  return s;
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === "node_modules" || name === ".next") continue;
      walk(p);
    } else if (p.endsWith(".tsx") || p.endsWith(".ts")) {
      const before = readFileSync(p, "utf8");
      const after = clean(before);
      if (after !== before) {
        writeFileSync(p, after);
        console.log("cleaned:", p.replace(/\\/g, "/").replace(root.replace(/\\/g, "/"), ""));
      }
    }
  }
}

walk(root);
