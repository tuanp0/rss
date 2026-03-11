import type { NextConfig } from "next";

const nextConfig = (phase: string): NextConfig => {
  const PHASE_DEVELOPMENT_SERVER = "phase-development-server";
  
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      // Development config
    };
  }

  // Production config
  return {
    output: 'export',
    basePath: "",
    assetPrefix: "",
    trailingSlash: false,
    images: {
      unoptimized: true,
    },
  };
};

export default nextConfig;