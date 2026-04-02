<script setup lang="ts">
import type { OrganizerResponse } from '~~/types/profile'

const { params } = useRoute()
const seo = useSeo()
const username = computed(() =>
  String(Array.isArray(params.slug) ? params.slug[0] : params.slug || '')
    .trim()
    .toLowerCase(),
)

const { getToursByOrganizer } = useTour()

const { data, error, status } = await useAsyncData<OrganizerResponse>(
  () => `organizer-${username.value}`,
  async (): Promise<OrganizerResponse> => {
    const [organizerData, tours] = await Promise.all([
      $fetch<{ user: OrganizerResponse['user'] }>(`/api/users/${encodeURIComponent(username.value)}`).catch((err) => {
        if (err.statusCode === 404) {
          return null
        }
        throw err
      }),
      getToursByOrganizer(username.value).catch((err) => {
        console.error('Error al cargar tours del organizador:', err)
        return []
      }),
    ])
    if (!organizerData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Organizador no encontrado',
        fatal: true,
      })
    }
    return { user: organizerData.user, tours }
  },
  { watch: [username] },
)

const organizer = computed<OrganizerResponse['user'] | null>(() => data.value?.user ?? null)
const organizerProfile = computed(() => organizer.value?.profile ?? null)
const tours = computed(() => data.value?.tours || [])
const pageTitle = computed(() => {
  const organizerLabel = organizer.value?.name || organizer.value?.username || 'Organizador'
  return `${organizerLabel} | ${seo.siteName.value}`
})
const pageDescription = computed(() =>
  seo.description(
    organizerProfile.value?.bio,
    organizer.value?.name ? `Perfil público de ${organizer.value.name}.` : 'Perfil público del organizador.',
    tours.value.length ? `${tours.value.length} tours publicados.` : 'Conoce sus próximos tours.',
  ),
)
const canonicalUrl = computed(() => seo.canonical(`/organizer/${username.value}`))
const organizerImage = computed(() => {
  if (organizerProfile.value?.banner) {
    return seo.imageUrl(`/blob/${organizerProfile.value.banner}`)
  }

  if (organizerProfile.value?.picture) {
    return seo.imageUrl(`/blob/${organizerProfile.value.picture}`)
  }

  return seo.imageUrl()
})

if (error.value || (status.value === 'success' && !organizer.value)) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Organizador no encontrado',
    fatal: true,
  })
}

seo.setCanonical(`/organizer/${username.value}`)

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogType: 'profile',
  ogUrl: canonicalUrl,
  ogImage: organizerImage,
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: organizerImage,
})

seo.setJsonLd('organizer-structured-data', {
  '@type': 'Person',
  name: organizer.value?.name || organizer.value?.username || 'Organizador',
  url: canonicalUrl.value,
  description: pageDescription.value,
  image: organizerImage.value,
})
</script>

<template>
    <ProfileShowcase :user="organizer" :profile="organizerProfile" :tours="tours" tours-title="Tours del organizador" />
</template>
