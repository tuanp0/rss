export const dynamic = 'force-static'

const sitemap = () => {
  const baseUrl = 'https://rss.tuanphung.com'
  
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]

  return [...staticRoutes]
}

export default sitemap