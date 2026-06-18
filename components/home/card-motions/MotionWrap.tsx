import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MotionSize = "sm" | "md" | "lg";

export interface CardMotionProps {
  watermarkClass: string;
  size?: MotionSize;
  className?: string;
}

const wrapSize: Record<MotionSize, string> = {
  sm: "h-[5rem] w-[5.5rem] right-0 bottom-0",
  md: "h-[6rem] w-[6.5rem] -right-1 -bottom-1",
  lg: "h-[8.5rem] w-[9.5rem] right-2 bottom-0 sm:right-4 sm:bottom-2",
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
        "pointer-events-none absolute select-none opacity-45 transition-opacity duration-300 group-hover:opacity-60",
        wrapSize[size],
        watermarkClass,
        className
      )}
      aria-hidden
    >
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}
