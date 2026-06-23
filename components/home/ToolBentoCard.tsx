"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { getToolCardTheme } from "@/lib/home-card-themes";
import CardToolMotion from "@/components/home/card-motions";
import ProcessingBadge from "@/components/shared/ProcessingBadge";
import { getToolProcessingTier } from "@/lib/tool-processing";
import type { Tool } from "@/lib/tools";
import type { BentoSize } from "@/lib/home-bento";

interface ToolBentoCardProps {
  tool: Tool;
  title: string;
  size?: BentoSize;
  className?: string;
}

export default function ToolBentoCard({
  tool,
  title,
  size = "sm",
  className,
}: ToolBentoCardProps) {
  const isLarge = size === "lg";
  const isMedium = size === "md";
  const theme = getToolCardTheme(tool.id);
  const processingTier = getToolProcessingTier(tool.id);
  const motionSize = isLarge ? "lg" : isMedium ? "md" : "sm";

  return (
    <Link
      href={tool.href}
      className={cn(
        "group color-bento-card color-bento-card-interactive relative flex flex-col overflow-hidden rounded-2xl border-2",
        "shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 dark:focus-visible:ring-white",
        theme.surface,
        theme.border,
        isLarge
          ? "min-h-[10.5rem] p-6 sm:min-h-[12rem]"
          : isMedium
            ? "min-h-[8.75rem] p-5 sm:min-h-[9.5rem]"
            : "min-h-[7.75rem] p-4 sm:min-h-[8.25rem] sm:p-5",
        className
      )}
    >
      <CardToolMotion toolId={tool.id} watermarkClass={theme.watermark} size={motionSize} />

      <div className="absolute top-3 right-3 z-[2]">
        <ProcessingBadge
          tier={processingTier}
          size="compact"
          compactTier={motionSize}
          className="shadow-sm backdrop-blur-sm bg-white/80 dark:bg-slate-900/75"
        />
      </div>

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
        <div
          className={cn(
            "flex shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-[1.04]",
            theme.icon,
            isLarge
              ? "h-14 w-14 rounded-2xl [&_.material-symbols-outlined]:!text-[28px]"
              : isMedium
                ? "h-12 w-12 rounded-xl [&_.material-symbols-outlined]:!text-[24px]"
                : "h-11 w-11 rounded-xl [&_.material-symbols-outlined]:!text-[22px]"
          )}
        >
          <span className="material-symbols-outlined icon-filled">{tool.icon}</span>
        </div>

        <div className="mt-auto pt-4 sm:pt-5">
          <div className="flex items-end justify-between gap-3">
            <h2
              className={cn(
                "min-w-0 font-bold leading-snug tracking-tight line-clamp-2",
                theme.title,
                isLarge ? "text-lg sm:text-xl" : isMedium ? "text-[15px] sm:text-base" : "text-[14px] sm:text-[15px]"
              )}
            >
              {title}
            </h2>
            <span
              className={cn(
                "mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                "opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0",
                theme.arrow
              )}
            >
              <span className="material-symbols-outlined !text-[16px]">arrow_forward</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
