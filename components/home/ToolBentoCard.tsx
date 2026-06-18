"use client";



import Link from "next/link";

import { cn } from "@/lib/utils";

import { getToolCardTheme } from "@/lib/home-card-themes";

import CardToolMotion from "@/components/home/card-motions";

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

        isLarge ? "min-h-[9.5rem] p-6 sm:min-h-[11rem]" : isMedium ? "min-h-[7.5rem] p-5" : "min-h-[6.5rem] p-4",

        className

      )}

    >

      <CardToolMotion toolId={tool.id} watermarkClass={theme.watermark} size={motionSize} />

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">

        <div className="flex items-start justify-between gap-2">

          <div

            className={cn(

              "flex shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105",

              theme.icon,

              isLarge

                ? "h-14 w-14 rounded-2xl [&_.material-symbols-outlined]:!text-[28px]"

                : isMedium

                  ? "h-11 w-11 rounded-xl [&_.material-symbols-outlined]:!text-[22px]"

                  : "h-10 w-10 rounded-xl [&_.material-symbols-outlined]:!text-[20px]"

            )}

          >

            <span className="material-symbols-outlined icon-filled">{tool.icon}</span>

          </div>



          <span

            className={cn(

              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300",

              "opacity-70 sm:opacity-0 sm:group-hover:opacity-100",

              theme.arrow

            )}

          >

            <span className="material-symbols-outlined !text-[16px]">arrow_forward</span>

          </span>

        </div>



        <h2

          className={cn(

            "font-bold leading-snug tracking-tight mt-auto",

            theme.title,

            isLarge ? "mt-5 text-lg sm:text-xl" : isMedium ? "mt-4 text-[15px] sm:text-base" : "mt-3 text-[14px]"

          )}

        >

          {title}

        </h2>

      </div>

    </Link>

  );

}

