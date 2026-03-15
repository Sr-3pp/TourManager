<script setup lang="ts">
import type { OrganizerResponse, ProfileSocial } from '~~/types/profile'

const {params} = useRoute()
const slug = computed(() =>
  String(Array.isArray(params.slug) ? params.slug[0] : params.slug || '')
    .trim()
    .toLowerCase(),
)

const {getToursByOrganizer} = useTour();

const { data, error, status } = await useAsyncData<OrganizerResponse>(
  () => `organizer-${slug.value}`,
  async () => {
    const [organizerData, tours] = await Promise.all([
      $fetch(`/api/users/${encodeURIComponent(slug.value)}`).catch((err) => {
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

const organizer = computed(() => data.value?.user)
const tours = computed(() => data.value?.tours || [])

if (error.value || !organizer.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Organizer not found',
    fatal: true,
  })
}
</script>

<template>
    <ProfileHeader :user="organizer" :profile="organizer.profile" />

    <p class="text-muted">{{ organizer.profile?.bio }}</p>

    <SocialNetworks :social-networks="(organizer.profile?.social as ProfileSocial)" />

    <ul>
        <li v-for="tour in tours" :key="tour._id">
            <UCard>
                <template #header>
                    <h2 class="text-xl font-bold">{{ tour.name }}</h2>
                </template>
                <figure>
                    <NuxtImg
                        v-if="tour.image"
                        :src="`/blob/${tour.image}`"
                        alt="Tour Picture"
                        class="w-full h-48 object-cover rounded"
                    />
                </figure>
                <p>{{ tour.description }}</p>
            </UCard>
        </li>
    </ul>
</template>
