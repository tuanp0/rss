export default function manifest() {
  return {
    name: "Reader - TP",
    short_name: "Reader",
    description: "RSS Reeder",
    start_url: '/rss',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
    icons: [
      {
        src: '../app/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '../app/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: './app/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}