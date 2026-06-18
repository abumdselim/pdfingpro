import { TOOL_MOTIONS } from "@/components/home/card-motions/motions";
import type { CardMotionProps } from "@/components/home/card-motions/MotionWrap";
import CardPdfShadow from "@/components/home/CardPdfShadow";

interface CardToolMotionProps extends CardMotionProps {
  toolId: string;
}

/** Per-tool background motion; falls back to static watermark if unknown. */
export default function CardToolMotion({ toolId, watermarkClass, size = "md", className }: CardToolMotionProps) {
  const Motion = TOOL_MOTIONS[toolId];
  if (!Motion) {
    return <CardPdfShadow watermarkClass={watermarkClass} size={size} className={className} />;
  }
  return <Motion watermarkClass={watermarkClass} size={size} className={className} />;
}
