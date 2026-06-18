import path from "node:path";
import { fileURLToPath } from "node:url";
import withPWAInit from "@ducanh2912/next-pwa";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  webpack: (config, { isServer, webpack }) => {
    // pdfjs-dist tries to import 'canvas' which is a Node-only optional dep.
    // Aliasing to false tells webpack to provide an empty module instead.
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    // modern-pdf-lib: bundled chunks import __exportAll from a .d.mts file (broken for webpack).
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
    config.resolve.alias[mplBrokenTypes] = mplExportAllShim;
    // Client bundle: webpack cannot resolve `node:fs/promises` (used only on Node in modern-pdf-lib).
    if (!isServer) {
      const fsPromisesStub = path.join(
        __dirname,
        "lib",
        "vendor",
        "empty-node-fs-promises.mjs"
      );
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:fs\/promises$/, fsPromisesStub)
      );
    }
    return config;
  },
};

export default withPWA(nextConfig);
