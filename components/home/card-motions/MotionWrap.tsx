import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MotionSize = "sm" | "md" | "lg";

export interface CardMotionProps {
  watermarkClass: string;
  size?: MotionSize;
  className?: string;
}

const wrapSize: Record<MotionSize, string> = {
  sm: "h-[4.25rem] w-[4.75rem] right-1 bottom-0 sm:h-[4.75rem] sm:w-[5.25rem] sm:right-2 sm:bottom-1",
  md: "h-[5.5rem] w-[6rem] right-0 bottom-0 sm:h-[6rem] sm:w-[6.75rem] sm:right-1 sm:bottom-1",
  lg: "h-[7.5rem] w-[8.25rem] right-2 bottom-1 sm:h-[8.5rem] sm:w-[9.5rem] sm:right-3 sm:bottom-2",
};

const contentScale: Record<MotionSize, string> = {
  sm: "scale-[0.78] origin-bottom-right",
  md: "scale-[0.88] origin-bottom-right",
  lg: "scale-100 origin-bottom-right",
};

export default function MotionWrap({
  watermarkClass,
  size = "md",
  className,
  children,
}: CardMotionProps & { children: ReactNode }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute select-none opacity-30 transition-opacity duration-300 group-hover:opacity-45",
        wrapSize[size],
        watermarkClass,
        className
      )}
      aria-hidden
    >
      <div className={cn("relative h-full w-full p-1.5 sm:p-2", contentScale[size])}>
        {children}
      </div>
    </div>
  );
}
