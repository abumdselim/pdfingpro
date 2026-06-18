import { cn } from "@/lib/utils";

interface BentoPanelProps {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
  warning?: boolean;
}

/** Shared surface for homepage bento cells — matches ToolBentoCard chrome. */
export default function BentoPanel({
  children,
  className,
  accent,
  warning,
}: BentoPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border backdrop-blur-sm transition-shadow duration-300",
        warning
          ? "border-amber-200/80 dark:border-amber-800/50 bg-amber-50/90 dark:bg-amber-950/25"
          : accent
            ? "border-[#1461bd]/20 dark:border-teal-500/30 bg-gradient-to-br from-[#1461bd]/5 to-teal-500/5 dark:from-teal-950/40 dark:to-slate-800/90"
            : "border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90",
        className
      )}
    >
      {children}
    </div>
  );
}

/** First light `bg-*` token from tool color string (ignores dark: variants). */
export function toolAccentClass(color: string): string {
  const match = color.match(/(?:^|\s)(bg-[a-z0-9-]+(?:\/[0-9]+)?)(?=\s|$)/);
  return match?.[1] ?? "bg-teal-500";
}
