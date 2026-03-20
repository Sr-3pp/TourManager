type JsonLdNode = Record<string, unknown>

function normalizeSiteUrl(siteUrl: string) {
  const trimmed = String(siteUrl || '').trim()

  if (!trimmed) {
    return 'http://localhost:3000'
  }

  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
}

function ensureArray<T>(value: T | T[] | undefined) {
  if (Array.isArray(value)) {
    return value
  }

  return value ? [value] : []
}

export function useSeo() {
  const runtimeConfig = useRuntimeConfig()
  const route = useRoute()

  const siteName = computed(() => String(runtimeConfig.public.siteName || 'Tour Manager'))
  const siteUrl = computed(() => normalizeSiteUrl(String(runtimeConfig.public.siteUrl || '')))
  const defaultDescription = computed(() =>
    String(runtimeConfig.public.defaultSeoDescription || '').trim(),
  )
  const defaultOgImage = computed(() =>
    String(runtimeConfig.public.defaultOgImage || '/og/default.svg').trim() || '/og/default.svg',
  )

  function absoluteUrl(path = '/') {
    if (/^https?:\/\//i.test(path)) {
      return path
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return new URL(normalizedPath, `${siteUrl.value}/`).toString()
  }

  function imageUrl(path?: string | null) {
    if (!path) {
      return absoluteUrl(defaultOgImage.value)
    }

    return absoluteUrl(path)
  }

  function description(...parts: Array<string | null | undefined>) {
    const text = parts
      .map(value => String(value || '').trim())
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (!text) {
      return defaultDescription.value
    }

    return text.length > 160 ? `${text.slice(0, 157).trimEnd()}...` : text
  }

  function canonical(path = route.path) {
    return absoluteUrl(path)
  }

  function setCanonical(path = route.path) {
    useHead({
      link: [
        {
          rel: 'canonical',
          href: canonical(path),
        },
      ],
    })
  }

  function setJsonLd(key: string, schema: JsonLdNode | JsonLdNode[]) {
    const nodes = ensureArray(schema)
      .filter(Boolean)
      .map(node => ({
        ...node,
        '@context': 'https://schema.org',
      }))

    useHead({
      script: [
        {
          key,
          type: 'application/ld+json',
          children: JSON.stringify(nodes.length === 1 ? nodes[0] : nodes),
        },
      ],
    })
  }

  function noIndex() {
    useSeoMeta({
      robots: 'noindex, nofollow',
      googlebot: 'noindex, nofollow',
    })
  }

  return {
    absoluteUrl,
    canonical,
    defaultDescription,
    description,
    imageUrl,
    noIndex,
    setCanonical,
    setJsonLd,
    siteName,
    siteUrl,
  }
}
