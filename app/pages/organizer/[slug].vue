<script setup lang="ts">
import type { OrganizerResponse } from '~~/types/profile'

const { params } = useRoute()
const slug = computed(() =>
  String(Array.isArray(params.slug) ? params.slug[0] : params.slug || '')
    .trim()
    .toLowerCase(),
)

const { getToursByOrganizer } = useTour()

const { data, error, status } = await useAsyncData<OrganizerResponse>(
  () => `organizer-${slug.value}`,
  async (): Promise<OrganizerResponse> => {
    const [organizerData, tours] = await Promise.all([
      $fetch<{ user: OrganizerResponse['user'] }>(`/api/users/${encodeURIComponent(slug.value)}`).catch((err) => {
        if (err.statusCode === 404) {
          return null
        }
        throw err
      }),
      getToursByOrganizer(slug.value).catch((err) => {
        console.error('Error fetching tours for organizer:', err)
        return []
      }),
    ])
    if (!organizerData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Organizer not found',
        fatal: true,
      })
    }
    return { user: organizerData.user, tours }
  },
  { watch: [slug] },
)

const organizer = computed<OrganizerResponse['user'] | null>(() => data.value?.user ?? null)
const organizerProfile = computed(() => organizer.value?.profile ?? null)
const tours = computed(() => data.value?.tours || [])

if (error.value || (status.value === 'success' && !organizer.value)) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Organizer not found',
    fatal: true,
  })
}
</script>

<template>
    <ProfileShowcase :user="organizer" :profile="organizerProfile" :tours="tours" tours-title="Organizer tours" />
</template>
