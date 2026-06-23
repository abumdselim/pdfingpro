import { cn } from "@/lib/utils";

interface CardPdfShadowProps {
  /** Tailwind color class e.g. text-white/15 or text-black/10 */
  watermarkClass: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-[4rem] w-[4rem] right-1 bottom-0 sm:h-[4.5rem] sm:w-[4.5rem] sm:right-2 sm:bottom-1",
  md: "h-[5rem] w-[5rem] right-0 bottom-0 sm:h-[5.5rem] sm:w-[5.5rem] sm:right-1 sm:bottom-1",
  lg: "h-[6.5rem] w-[6.5rem] right-2 bottom-1 sm:h-[7.5rem] sm:w-[7.5rem] sm:right-3 sm:bottom-2",
};

/** Faint stacked PDF page watermark for colorful bento cards. */
export default function CardPdfShadow({
  watermarkClass,
  size = "md",
  className,
}: CardPdfShadowProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute select-none overflow-visible opacity-30 transition-opacity duration-300",
        "group-hover:opacity-45",
        sizeMap[size],
        watermarkClass,
        className
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 88 104"
        fill="none"
        className="h-full w-full drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Back page */}
        <rect
          x="18"
          y="8"
          width="52"
          height="68"
          rx="5"
          className="fill-current opacity-[0.18]"
          transform="rotate(-10 44 42)"
        />
        {/* Middle page */}
        <rect
          x="12"
          y="14"
          width="52"
          height="68"
          rx="5"
          className="fill-current opacity-[0.28] stroke-current"
          strokeWidth="1.5"
          transform="rotate(-5 38 48)"
        />
        {/* Front page */}
        <rect x="8" y="20" width="56" height="72" rx="6" className="fill-current opacity-[0.38]" />
        <rect x="8" y="20" width="56" height="72" rx="6" className="stroke-current opacity-50" strokeWidth="1.5" />
        {/* Folded corner */}
        <path
          d="M52 20h12v12L52 20z"
          className="fill-current opacity-25"
        />
        <path d="M52 20h12v12L52 20z" className="stroke-current opacity-40" strokeWidth="1" />
        {/* Text lines */}
        <rect x="16" y="38" width="28" height="2.5" rx="1.25" className="fill-current opacity-30" />
        <rect x="16" y="46" width="36" height="2" rx="1" className="fill-current opacity-22" />
        <rect x="16" y="53" width="32" height="2" rx="1" className="fill-current opacity-22" />
        <rect x="16" y="60" width="24" height="2" rx="1" className="fill-current opacity-18" />
        {/* PDF badge */}
        <rect x="16" y="72" width="22" height="12" rx="2.5" className="fill-current opacity-35" />
        <text
          x="27"
          y="81"
          textAnchor="middle"
          className="fill-current opacity-70"
          fontSize="7"
          fontWeight="800"
          fontFamily="Inter, system-ui, sans-serif"
        >
          PDF
        </text>
      </svg>
    </div>
  );
}
