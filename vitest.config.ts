import path from "node:path";
import { defineConfig } from "vitest/config";

const mplBrokenTypes = path.join(
  __dirname,
  "node_modules",
  "modern-pdf-lib",
  "dist",
  "index-B4S61WjK.d.mts"
);
const mplExportAllShim = path.join(
  __dirname,
  "lib",
  "vendor",
  "modern-pdf-lib-rolldown-runtime.mjs"
);
const fsPromisesStub = path.join(__dirname, "lib", "vendor", "empty-node-fs-promises.mjs");

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
    server: {
      deps: {
        inline: ["modern-pdf-lib", "@pdfsmaller/pdf-encrypt-lite"],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      [mplBrokenTypes]: mplExportAllShim,
      "node:fs/promises": fsPromisesStub,
    },
  },
});
