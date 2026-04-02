function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const siteName = escapeXml(String(config.public.siteName || 'Tour Manager'))
  const description = escapeXml(
    String(config.public.defaultSeoDescription || 'Descubre tours y organizadores destacados'),
  )

  setHeader(event, 'content-type', 'image/svg+xml')
  setHeader(event, 'cache-control', 'public, max-age=3600, s-maxage=86400')

  return `
    <svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="80" y1="40" x2="1080" y2="590" gradientUnits="userSpaceOnUse">
          <stop stop-color="#123C69"/>
          <stop offset="0.55" stop-color="#1D6FA3"/>
          <stop offset="1" stop-color="#F4B942"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="#0B1726"/>
      <rect x="36" y="36" width="1128" height="558" rx="36" fill="url(#bg)"/>
      <circle cx="1048" cy="122" r="96" fill="white" fill-opacity="0.12"/>
      <circle cx="155" cy="517" r="132" fill="white" fill-opacity="0.08"/>
      <rect x="92" y="96" width="180" height="180" rx="42" fill="white" fill-opacity="0.14"/>
      <path d="M182.5 131C151.296 131 126 156.296 126 187.5C126 234 182.5 289 182.5 289C182.5 289 239 234 239 187.5C239 156.296 213.704 131 182.5 131ZM182.5 210.5C169.521 210.5 159 199.979 159 187C159 174.021 169.521 163.5 182.5 163.5C195.479 163.5 206 174.021 206 187C206 199.979 195.479 210.5 182.5 210.5Z" fill="white"/>
      <text x="92" y="372" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="700">${siteName}</text>
      <text x="92" y="438" fill="white" fill-opacity="0.92" font-family="Arial, Helvetica, sans-serif" font-size="28">${description}</text>
      <text x="92" y="520" fill="white" fill-opacity="0.8" font-family="Arial, Helvetica, sans-serif" font-size="24">Tours destacados, organizadores y experiencias listas para compartir.</text>
    </svg>
  `.trim()
})
