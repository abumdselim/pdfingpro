export type UrlToPdfPageSize = "Letter" | "A4" | "Legal";
export type UrlToPdfOrientation = "portrait" | "landscape";
export type UrlToPdfMargin = "none" | "small" | "normal" | "wide";
export type UrlToPdfFitMode = "natural" | "fit-width" | "compact";

export interface UrlToPdfRequest {
  url: string;
  pageSize: UrlToPdfPageSize;
  orientation: UrlToPdfOrientation;
  margin: UrlToPdfMargin;
  scale: number;
  fitMode: UrlToPdfFitMode;
}

export const URL_TO_PDF_MARGINS: Record<UrlToPdfMargin, string> = {
  none: "0in",
  small: "0.25in",
  normal: "0.5in",
  wide: "0.75in",
};
