<script setup lang="ts">
import type { Profile, ProfileSocial } from '~~/types/profile'

type OrganizerUser = {
  name?: string
  slug?: string
  profile?: Profile
}

type OrganizerResponse = {
  user: OrganizerUser
}

const route = useRoute()
const slug = computed(() =>
  String(Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug || '')
    .trim()
    .toLowerCase(),
)

const { data, error, status } = await useAsyncData<OrganizerResponse>(
  () => `organizer-${slug.value}`,
  () => $fetch(`/api/users/${encodeURIComponent(slug.value)}`),
  { watch: [slug] },
)

const organizer = computed(() => data.value?.user)
const bannerUrl = computed(() =>
  organizer.value?.profile?.banner ? `/blob/${organizer.value.profile.banner}` : '',
)
const pictureUrl = computed(() =>
  organizer.value?.profile?.picture ? `/blob/${organizer.value.profile.picture}` : '',
)

if (error.value || !organizer.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Organizer not found',
    fatal: true,
  })
}
</script>

<template>
    <ProfileHeader :user="organizer" :profile="organizer.profile" @edit-profile="profileModal = true" />

    <p class="text-muted">{{ organizer.profile?.bio }}</p>

    <SocialNetworks :social-networks="(organizer.profile?.social as ProfileSocial)" />
</template>
