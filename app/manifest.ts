import type { MetadataRoute } from 'next'

export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  return {
    "name": "TP Reader",
    "short_name": "TP Reader",
    "description": "Application web légère et pratique pour rassembler toutes vos news et articles en un seul endroit.",
    "theme_color": "#ffffff",
    "background_color": "#ffffff",
    "display": "standalone",
    "scope": "/",
    "start_url": "/",
    "icons": [
      { "src": "android-chrome-192x192.png", "type": "image/png", "sizes": "192x192" },
      { "src": "android-chrome-512x512.png", "type": "image/png", "sizes": "512x512" }
    ]
  }
}