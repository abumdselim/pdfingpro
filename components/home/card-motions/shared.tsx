import { cn } from "@/lib/utils";

export function MiniPage({ className, label = "PDF" }: { className?: string; label?: string }) {
  return (
    <svg viewBox="0 0 48 60" className={cn("h-full w-auto", className)} aria-hidden>
      <rect x="2" y="2" width="44" height="56" rx="4" className="fill-current opacity-40" />
      <rect x="2" y="2" width="44" height="56" rx="4" className="stroke-current opacity-55" strokeWidth="1.2" fill="none" />
      <path d="M34 2h10v10L34 2z" className="fill-current opacity-30" />
      <rect x="8" y="14" width="20" height="2" rx="1" className="fill-current opacity-35" />
      <rect x="8" y="20" width="28" height="1.5" rx="0.75" className="fill-current opacity-25" />
      <rect x="8" y="25" width="24" height="1.5" rx="0.75" className="fill-current opacity-25" />
      <rect x="8" y="44" width="14" height="8" rx="2" className="fill-current opacity-35" />
      <text x="15" y="50" textAnchor="middle" fontSize="5" fontWeight="800" className="fill-current opacity-65">
        {label}
      </text>
    </svg>
  );
}

export function MiniImage({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-full w-auto", className)} aria-hidden>
      <rect x="2" y="2" width="36" height="36" rx="4" className="fill-current opacity-35" />
      <rect x="2" y="2" width="36" height="36" rx="4" className="stroke-current opacity-50" strokeWidth="1.2" fill="none" />
      <circle cx="13" cy="14" r="4" className="fill-current opacity-40" />
      <path d="M6 30l10-9 7 6 5-4 6 7H6z" className="fill-current opacity-35" />
    </svg>
  );
}

export function MiniDoc({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 60" className={cn("h-full w-auto", className)} aria-hidden>
      <rect x="2" y="2" width="44" height="56" rx="4" className="fill-current opacity-38" />
      <rect x="2" y="2" width="44" height="56" rx="4" className="stroke-current opacity-55" strokeWidth="1.2" fill="none" />
      <rect x="8" y="12" width="28" height="3" rx="1.5" className="fill-current opacity-40" />
      <rect x="8" y="20" width="32" height="2" rx="1" className="fill-current opacity-28" />
      <rect x="8" y="26" width="30" height="2" rx="1" className="fill-current opacity-28" />
      <rect x="8" y="32" width="26" height="2" rx="1" className="fill-current opacity-22" />
      <rect x="8" y="38" width="20" height="2" rx="1" className="fill-current opacity-22" />
      <text x="24" y="52" textAnchor="middle" fontSize="6" fontWeight="800" className="fill-current opacity-60">
        DOC
      </text>
    </svg>
  );
}
