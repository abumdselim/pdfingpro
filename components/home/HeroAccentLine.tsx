"use client";

import { TOOLS } from "@/lib/tools";
import { useCountUp } from "@/lib/hooks/use-count-up";
import { cn } from "@/lib/utils";

interface HeroAccentLineProps {
  t: (key: string) => string;
  className?: string;
}

const accentBlue = "text-[#1461bd] dark:text-teal-400";
const accentAmber = "text-amber-600 dark:text-amber-400";

export default function HeroAccentLine({ t, className }: HeroAccentLineProps) {
  const toolCount = TOOLS.length;
  const count = useCountUp(toolCount);

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-baseline justify-center gap-x-2 sm:gap-x-2.5",
        className
      )}
    >
      <span
        className={cn(
          accentAmber,
          "tabular-nums tracking-tight text-[1.12em] sm:text-[1.08em] font-extrabold"
        )}
      >
        {count}
        {t("home.hero.titleAccentPlus")}
      </span>
      <span className={cn(accentBlue, "font-extrabold")}>
        {t("home.hero.titleAccentLead")}{" "}
        <span className="whitespace-nowrap">{t("home.hero.titleAccentTail")}</span>
      </span>
    </span>
  );
}
