import type { NextConfig } from "next";

const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require("next/constants");

module.exports = async (phase: string): Promise<NextConfig> => {
  let nextConfig: NextConfig = {};

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    nextConfig = {};
  } else {
    nextConfig = {
      output: "export",
      basePath: "",
      assetPrefix: "",
      images: {
        unoptimized: true,
      },
    };
  }

  // if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
  //   const withSerwist = (await import("@serwist/next")).default({
  //     swSrc: "app/app-worker.js",
  //     swDest: "public/sw.js",
  //     reloadOnOnline: true,
  //   });
  //   return withSerwist(nextConfig);
  // }

  return nextConfig;
};