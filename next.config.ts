import type { NextConfig } from "next"
import withSerwistInit from "@serwist/next"

const {
  PHASE_DEVELOPMENT_SERVER,
} = require("next/constants")

module.exports = async (phase: string): Promise<NextConfig> => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER

  const nextConfig: NextConfig = isDev
    ? {}
    : {
        output: "export",
        basePath: "",
        assetPrefix: "",
        images: {
          unoptimized: true,
        },
      }

  const withSerwist = withSerwistInit({
    swSrc: "app/sw.ts",
    swDest: "public/sw.js",
    cacheOnNavigation: true,
    reloadOnOnline: true,
    disable: isDev,
    additionalPrecacheEntries: [{ url: "/index.html", revision: "<build-hash>" }],
  })

  return withSerwist(nextConfig)
}