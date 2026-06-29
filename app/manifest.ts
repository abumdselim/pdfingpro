import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pdfing Pro - Free Online PDF Tools",
    short_name: "Pdfing Pro",
    description: "Merge, split, compress, convert, rotate, watermark and sign PDFs - all in your browser.",
    start_url: "/",
    display: "standalone",
    background_color: "#f1f5f9",
    theme_color: "#f1f5f9",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
