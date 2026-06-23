import { CATEGORIES, TOOLS, type Tool } from "@/lib/tools";

/** Common aliases users type instead of the official tool name. */
const TOOL_KEYWORDS: Partial<Record<string, string[]>> = {
  "merge-pdf": ["combine", "join", "append", "concat"],
  "split-pdf": ["divide", "separate", "break"],
  "organize-pdf": ["reorder", "rearrange", "delete pages", "move pages"],
  "compress-pdf": ["shrink", "reduce", "optimize", "smaller"],
  "rotate-pdf": ["turn", "orientation"],
  "watermark-pdf": ["stamp text", "overlay text"],
  "sign-pdf": ["signature", "esign", "e-sign"],
  "protect-pdf": ["password", "encrypt", "lock"],
  "unlock-pdf": ["decrypt", "remove password"],
  "ocr-pdf": ["scan", "text recognition", "searchable"],
  "redact-pdf": ["blackout", "censor", "hide text"],
  "pdf-to-word": ["docx", "doc", "word"],
  "pdf-to-excel": ["xlsx", "spreadsheet", "excel"],
  "html-to-pdf": ["website", "url", "web page", "html"],
  "pdf-to-jpg": ["jpeg", "image", "photo"],
  "jpg-to-pdf": ["jpeg", "image", "photo"],
  "pdf-to-png": ["image"],
  "png-to-pdf": ["image"],
  "flatten-pdf": ["form flatten", "forms"],
  "grayscale-pdf": ["black and white", "grey", "gray"],
  "compare-pdf": ["diff", "difference"],
  "n-up-pdf": ["imposition", "multiple per page", "2up", "4up"],
  "booklet-pdf": ["fold", "book"],
  "extract-text-pdf": ["copy text", "text extract"],
  "extract-images-pdf": ["save images", "export images"],
  "sanitize-pdf": ["clean", "remove metadata", "metadata strip"],
  "bookmarks-pdf": ["toc", "table of contents", "outline", "navigation"],
  "split-by-bookmarks": ["bookmark split", "section split", "chapters"],
  "header-footer-pdf": ["header", "footer", "letterhead"],
  "pdf-to-powerpoint": ["pptx", "ppt", "powerpoint", "slides"],
  "webp-to-pdf": ["webp", "image"],
  "split-by-size": ["size limit", "mb split", "file size", "email attachment"],
  "merge-alternate": ["interleave", "alternate", "combine pages", "mix pdf"],
  "add-links-pdf": ["hyperlink", "url", "clickable link", "website link"],
  "text-to-pdf": ["plain text", "notes", "txt", "write pdf"],
  "auto-rotate-pdf": ["orientation", "landscape", "portrait", "fix rotation"],
};

export const SUGGESTED_SEARCH_QUERIES = [
  "merge",
  "compress",
  "sign",
  "split",
  "ocr",
  "protect",
] as const;

export type SearchQuickActionId = "privacy" | "contact" | "terms" | "theme" | "all-tools";

export interface SearchQuickAction {
  id: SearchQuickActionId;
  labelKey: string;
  icon: string;
  href?: string;
  action?: "theme";
}

export const SEARCH_QUICK_ACTIONS: SearchQuickAction[] = [
  { id: "all-tools", labelKey: "header.allTools", icon: "grid_view", href: "/#tools" },
  { id: "privacy", labelKey: "legal.footer.privacy", icon: "shield", href: "/privacy" },
  { id: "contact", labelKey: "legal.footer.contact", icon: "mail", href: "/contact" },
  { id: "terms", labelKey: "legal.footer.terms", icon: "description", href: "/terms" },
  { id: "theme", labelKey: "header.searchToggleTheme", icon: "dark_mode", action: "theme" },
];

export function normalizeQuery(value: string) {
  return value.toLowerCase().trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = temp;
    }
  }
  return row[b.length];
}

function fuzzyTextScore(text: string, query: string): number {
  const haystack = normalizeQuery(text);
  const q = normalizeQuery(query);
  if (!q || !haystack) return 0;

  if (haystack.includes(q)) return 72;

  const words = haystack.split(/[\s/]+/).filter(Boolean);
  let best = 0;
  for (const word of words) {
    if (word.startsWith(q)) best = Math.max(best, 68);
    const dist = levenshtein(word, q);
    const threshold =
      q.length <= 3 ? 1 : q.length <= 6 ? 2 : Math.max(2, Math.floor(q.length / 3));
    if (dist <= threshold && Math.abs(word.length - q.length) <= 2) {
      const fuzzyScore = 62 - dist * 10 - (word.length > q.length ? 2 : 0);
      best = Math.max(best, fuzzyScore);
    }
  }

  let qi = 0;
  for (let i = 0; i < haystack.length && qi < q.length; i++) {
    if (haystack[i] === q[qi]) qi++;
  }
  if (qi === q.length) best = Math.max(best, 48);

  return best;
}

function categoryLabel(category: Tool["category"], t: (key: string) => string) {
  const cat = CATEGORIES.find((c) => c.id === category);
  return cat ? normalizeQuery(t(cat.labelKey)) : normalizeQuery(category);
}

function scoreTool(tool: Tool, query: string, t: (key: string) => string): number {
  const q = normalizeQuery(query);
  if (!q) return 0;

  const title = normalizeQuery(t(tool.titleKey));
  const description = normalizeQuery(t(tool.descriptionKey));
  const category = categoryLabel(tool.category, t);
  const slug = normalizeQuery(tool.id.replace(/-/g, " "));
  const keywords = (TOOL_KEYWORDS[tool.id] ?? []).map(normalizeQuery);

  let score = 0;

  if (title === q) score = Math.max(score, 100);
  if (title.startsWith(q)) score = Math.max(score, 90);
  if (slug.startsWith(q) || tool.id.startsWith(q.replace(/\s+/g, "-"))) score = Math.max(score, 85);
  if (title.includes(q)) score = Math.max(score, 70);
  if (keywords.some((k) => k.includes(q) || q.includes(k))) score = Math.max(score, 65);
  if (category.includes(q)) score = Math.max(score, 60);
  if (description.includes(q)) score = Math.max(score, 50);
  if (slug.includes(q)) score = Math.max(score, 45);
  if (tool.id.includes(q.replace(/\s+/g, "-"))) score = Math.max(score, 40);

  score = Math.max(score, fuzzyTextScore(title, q));
  score = Math.max(score, fuzzyTextScore(description, q) - 8);
  for (const keyword of keywords) {
    score = Math.max(score, fuzzyTextScore(keyword, q) - 4);
  }

  const primaryWord = title.split(/\s+/).filter(Boolean)[0];
  if (primaryWord) {
    const dist = levenshtein(primaryWord, q);
    if (dist <= 2 && Math.abs(primaryWord.length - q.length) <= 2) {
      score = Math.max(score, 88 - dist * 12);
    }
  }

  return score;
}

export function searchTools(
  query: string,
  t: (key: string) => string,
  options?: { category?: Tool["category"] | null }
): Tool[] {
  const trimmed = query.trim();
  if (!trimmed) return TOOLS;

  const minScore = trimmed.length >= 3 ? 42 : 48;

  return TOOLS.filter((tool) => {
    if (options?.category && tool.category !== options.category) return false;
    return scoreTool(tool, trimmed, t) >= minScore;
  }).sort((a, b) => scoreTool(b, trimmed, t) - scoreTool(a, trimmed, t));
}

export function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

const RECENT_TOOLS_KEY = "pdfing-pro:recent-tools";
const RECENT_SEARCHES_KEY = "pdfing-pro:recent-searches";
const RECENT_LIMIT = 5;

export function getRecentToolIds(): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_TOOLS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function rememberRecentTool(toolId: string) {
  if (typeof localStorage === "undefined") return;
  const ids = getRecentToolIds().filter((id) => id !== toolId);
  ids.unshift(toolId);
  localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(ids.slice(0, RECENT_LIMIT)));
}

export function getRecentTools(t: (key: string) => string): Tool[] {
  const byId = new Map(TOOLS.map((tool) => [tool.id, tool]));
  return getRecentToolIds()
    .map((id) => byId.get(id))
    .filter((tool): tool is Tool => Boolean(tool));
}

export function getRecentSearches(): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((q) => typeof q === "string") : [];
  } catch {
    return [];
  }
}

export function rememberRecentSearch(query: string) {
  if (typeof localStorage === "undefined") return;
  const q = query.trim();
  if (q.length < 2) return;
  const items = getRecentSearches().filter((item) => item.toLowerCase() !== q.toLowerCase());
  items.unshift(q);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items.slice(0, RECENT_LIMIT)));
}

export function getDefaultSearchResults(t: (key: string) => string, limit = 8): Tool[] {
  const recent = getRecentTools(t);
  if (recent.length === 0) return TOOLS.slice(0, limit);
  const recentIds = new Set(recent.map((tool) => tool.id));
  const rest = TOOLS.filter((tool) => !recentIds.has(tool.id)).slice(0, Math.max(0, limit - recent.length));
  return [...recent, ...rest];
}

export interface HighlightPart {
  text: string;
  match: boolean;
}

export function splitByHighlight(text: string, query: string): HighlightPart[] {
  const q = query.trim();
  if (!q) return [{ text, match: false }];

  const lower = text.toLowerCase();
  const qLower = q.toLowerCase();
  const parts: HighlightPart[] = [];
  let start = 0;
  let index = lower.indexOf(qLower, start);

  while (index !== -1) {
    if (index > start) parts.push({ text: text.slice(start, index), match: false });
    parts.push({ text: text.slice(index, index + q.length), match: true });
    start = index + q.length;
    index = lower.indexOf(qLower, start);
  }

  if (start < text.length) parts.push({ text: text.slice(start), match: false });
  return parts.length > 0 ? parts : [{ text, match: false }];
}
