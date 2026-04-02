function normalizeSiteUrl(siteUrl: string) {
  const trimmed = String(siteUrl || '').trim()

  if (!trimmed) {
    return 'http://localhost:3000'
  }

  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
}

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const siteUrl = normalizeSiteUrl(String(config.public.siteUrl || ''))

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')

  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /auth/',
    'Disallow: /panel/',
    'Disallow: /profile',
    `Sitemap: ${siteUrl}/sitemap.xml`,
  ].join('\n')
})
