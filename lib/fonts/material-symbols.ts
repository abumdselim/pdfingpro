import localFont from "next/font/local";

export const materialSymbols = localFont({
  src: "../../assets/fonts/material-symbols-outlined.woff2",
  display: "block",
  variable: "--font-material-symbols",
  preload: true,
  adjustFontFallback: false,
});
