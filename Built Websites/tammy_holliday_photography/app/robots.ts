import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://tammyholliday.co.za'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/uploads/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
