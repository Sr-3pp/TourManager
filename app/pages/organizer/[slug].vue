<script setup lang="ts">
import type { OrganizerResponse } from '~~/types/profile'

const { params } = useRoute()
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

if (error.value || (status.value === 'success' && !organizer.value)) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Organizador no encontrado',
    fatal: true,
  })
}
</script>

<template>
    <ProfileShowcase :user="organizer" :profile="organizerProfile" :tours="tours" tours-title="Tours del organizador" />
</template>
