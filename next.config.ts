import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static export — served by nginx + Cloudflare (all processing is
  // client-side, so no Node runtime is needed). Security headers are set at the
  // nginx layer instead of Next's headers() (which requires a server).
  output: "export",
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Static export cannot run the image optimizer.
    unoptimized: true,
  },
  // lucide-react is huge if not tree-shaken; optimize its imports.
  experimental: {
    optimizePackageImports: ["lucide-react"],
    // Several heavy WASM deps (pdf.js, ffmpeg, tesseract, jSquash codecs) make
    // the bundle memory-hungry; this flag trades a little build speed for lower
    // peak webpack memory so the build completes on memory-constrained machines.
    webpackMemoryOptimizations: true,
  },
  // The image engine loads WASM codecs (Squoosh: MozJPEG/WebP/OxiPNG) on demand.
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
};

export default nextConfig;
