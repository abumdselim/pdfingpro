"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { toolAccentClass } from "@/components/home/BentoPanel";
import type { Tool } from "@/lib/tools";
import type { BentoSize } from "@/lib/home-bento";

interface ToolBentoCardProps {
  tool: Tool;
  title: string;
  description: string;
  openLabel?: string;
  size?: BentoSize;
  className?: string;
}

export default function ToolBentoCard({
  tool,
  title,
  description,
  openLabel = "Open tool",
  size = "sm",
  className,
}: ToolBentoCardProps) {
  const isLarge = size === "lg";
  const isMedium = size === "md";
  const showCta = isLarge || isMedium;

  return (
    <Link
      href={tool.href}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300",
        "border-slate-200/80 dark:border-slate-700/80",
        "bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm",
        "hover:shadow-bento hover:-translate-y-0.5 hover:border-[#1461bd]/30 dark:hover:border-teal-500/40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1461bd]/40 dark:focus-visible:ring-teal-500/50",
        isLarge ? "min-h-[12rem] p-6 sm:min-h-[14rem]" : isMedium ? "min-h-[8rem] p-5" : "min-h-[7rem] p-4",
        className
      )}
    >
      <div
        className={cn(
          "absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-[0.08] blur-2xl transition-opacity group-hover:opacity-[0.14]",
          toolAccentClass(tool.color)
        )}
        aria-hidden
      />

      <div className="relative flex flex-1 flex-col min-h-0">
        <div className="flex items-start justify-between gap-2">
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-105",
              tool.color,
              isLarge ? "h-14 w-14" : isMedium ? "h-11 w-11" : "h-10 w-10"
            )}
          >
            <span
              className={cn(
                "material-symbols-outlined",
                isLarge ? "text-[28px]" : isMedium ? "text-[22px]" : "text-[20px]"
              )}
            >
              {tool.icon}
            </span>
          </div>
          <span className="material-symbols-outlined text-[18px] text-slate-300 dark:text-slate-600 transition-all duration-300 group-hover:text-[#1461bd] dark:group-hover:text-teal-400 group-hover:translate-x-0.5 opacity-0 group-hover:opacity-100 shrink-0">
            arrow_forward
          </span>
        </div>

        <h2
          className={cn(
            "font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#1461bd] dark:group-hover:text-teal-400 transition-colors leading-snug",
            isLarge ? "mt-5 text-lg sm:text-xl" : isMedium ? "mt-4 text-[15px]" : "mt-3 text-[14px]"
          )}
        >
          {title}
        </h2>

        <p
          className={cn(
            "mt-1.5 text-slate-500 dark:text-slate-400 leading-relaxed",
            isLarge ? "text-sm line-clamp-3" : "text-xs line-clamp-2"
          )}
        >
          {description}
        </p>

        {showCta && (
          <span className="mt-auto pt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#1461bd] dark:text-teal-400 opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            {openLabel}
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </span>
        )}
      </div>
    </Link>
  );
}
