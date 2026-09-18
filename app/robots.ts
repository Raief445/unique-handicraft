import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/login', '/enquiry/success'],
    },
    sitemap: 'https://uniquehandicrafts.in/sitemap.xml',
  }
}
