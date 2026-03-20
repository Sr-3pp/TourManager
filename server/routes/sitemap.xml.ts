import { Tour } from '~~/server/models/Tour'
import { User } from '~~/server/models/User'
import { dbConnect } from '~~/server/utils/db'

function normalizeSiteUrl(siteUrl: string) {
  const trimmed = String(siteUrl || '').trim()

  if (!trimmed) {
    return 'http://localhost:3000'
  }

  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
}

function absoluteUrl(siteUrl: string, path: string) {
  return new URL(path.startsWith('/') ? path : `/${path}`, `${siteUrl}/`).toString()
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const siteUrl = normalizeSiteUrl(String(config.public.siteUrl || ''))

  await dbConnect()

  const [tours, organizers] = await Promise.all([
    Tour.find({}, '_id updatedAt creator')
      .populate('creator', 'username')
      .lean(),
    User.find(
      {
        username: {
          $exists: true,
          $ne: null,
        },
      },
      'username updatedAt',
    ).lean(),
  ])

  const urls = [
    {
      loc: absoluteUrl(siteUrl, '/'),
      changefreq: 'daily',
      priority: '1.0',
      lastmod: new Date().toISOString(),
    },
    ...tours.map((tour: any) => ({
      loc: absoluteUrl(siteUrl, `/tour/${tour._id}`),
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: new Date(tour.updatedAt || Date.now()).toISOString(),
    })),
    ...organizers
      .filter((organizer: any) => organizer.username)
      .map((organizer: any) => ({
        loc: absoluteUrl(siteUrl, `/organizer/${organizer.username}`),
        changefreq: 'weekly',
        priority: '0.7',
        lastmod: new Date(organizer.updatedAt || Date.now()).toISOString(),
      })),
  ]

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      entry => `
        <url>
          <loc>${escapeXml(entry.loc)}</loc>
          <lastmod>${escapeXml(entry.lastmod)}</lastmod>
          <changefreq>${entry.changefreq}</changefreq>
          <priority>${entry.priority}</priority>
        </url>
      `.trim(),
    ),
    '</urlset>',
  ].join('\n')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')

  return xml
})
