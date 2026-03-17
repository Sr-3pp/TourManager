<script setup lang="ts">
import type { Profile } from '~~/types/profile'
import type { Tour } from '~~/types/tour'

type ProfileUser = {
  name?: string
  slug?: string
} | null

const props = defineProps<{
  user: ProfileUser
  profile: Profile | null
  tours: Tour[]
  toursTitle?: string
}>()

const socialNetworks = computed(() => props.profile?.social ?? null)
const profileStats = computed(() => [
  {
    label: 'Tours',
    value: String(props.tours.length),
    icon: 'i-lucide-map',
  },
  {
    label: 'Has banner',
    value: props.profile?.banner ? 'Yes' : 'No',
    icon: 'i-lucide-image',
  },
  {
    label: 'Social links',
    value: String(Object.values(props.profile?.social ?? {}).filter(Boolean).length),
    icon: 'i-lucide-link',
  },
])
</script>

<template>
  <section class="relative overflow-hidden bg-default">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute left-0 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div class="absolute right-0 top-16 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
    </div>

    <UContainer class="relative space-y-8 py-8 sm:py-10 lg:py-12">
      <div class="overflow-hidden rounded-[2rem] border border-default bg-default shadow-sm">
        <div
          v-if="profile?.banner"
          class="h-44 w-full bg-cover bg-center sm:h-56 lg:h-64"
          :style="{ backgroundImage: `linear-gradient(180deg, transparent, rgba(0,0,0,0.12)), url(/blob/${profile.banner})` }"
        />
        <div
          v-else
          class="flex h-44 items-end justify-end flex-col bg-gradient-to-br from-primary via-secondary to-primary p-6 text-inverted sm:h-56 lg:h-64"
        >
          <p class="text-xs uppercase tracking-[0.3em] text-inverted/80">Organizer Profile</p>
          <h1 class="mt-3 text-3xl font-bold sm:text-4xl">{{ user?.name || 'Profile' }}</h1>
        </div>

        <div class="px-5 pb-6 pt-5 sm:px-8 sm:pb-8">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div class="flex items-end gap-4">
              <div
                class="-mt-16 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-default bg-muted shadow-sm sm:-mt-20 sm:h-32 sm:w-32"
              >
                <NuxtImg
                  v-if="profile?.picture"
                  :src="`/blob/${profile.picture}`"
                  :alt="`${user?.name || 'Profile'} picture`"
                  class="h-full w-full object-cover"
                />
                <UIcon v-else name="i-lucide-user-round" class="text-4xl text-muted" />
              </div>

              <div class="min-w-0">
                <h2 class="truncate text-3xl font-bold tracking-tight sm:text-4xl">{{ user?.name || 'Profile' }}</h2>
                <p v-if="user?.slug" class="mt-2 text-sm font-medium text-primary">@{{ user.slug }}</p>
                <p v-else class="mt-2 text-sm text-muted">Public organizer profile</p>
              </div>
            </div>

            <div class="flex flex-wrap gap-3">
              <slot name="actions" />
            </div>
          </div>

          <div class="mt-6 grid gap-4 md:grid-cols-3">
            <UCard v-for="stat in profileStats" :key="stat.label">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-sm text-muted">{{ stat.label }}</p>
                  <p class="mt-2 text-2xl font-semibold">{{ stat.value }}</p>
                </div>
                <UIcon :name="stat.icon" class="text-2xl text-primary" />
              </div>
            </UCard>
          </div>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_360px]">
        <UCard class="rounded-3xl">
          <div class="space-y-4">
            <div>
              <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">About</p>
              <h3 class="mt-2 text-2xl font-semibold">Profile Overview</h3>
            </div>

            <p class="max-w-3xl text-base leading-7 text-muted">
              {{ profile?.bio || 'This organizer has not added a public bio yet.' }}
            </p>
          </div>
        </UCard>

        <UCard class="rounded-3xl">
          <div class="space-y-4">
            <div>
              <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Social</p>
              <h3 class="mt-2 text-2xl font-semibold">Stay Connected</h3>
            </div>

            <SocialNetworks v-if="socialNetworks" :social-networks="socialNetworks" />
            <div v-else class="rounded-2xl border border-dashed border-default p-5 text-sm text-muted">
              Social links have not been added yet.
            </div>
          </div>
        </UCard>
      </div>

      <div class="space-y-4">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Tours</p>
            <h3 class="text-2xl font-semibold">{{ toursTitle || 'Published tours' }}</h3>
          </div>
          <UBadge color="secondary" variant="soft">{{ tours.length }} total</UBadge>
        </div>

        <TourLIst v-if="tours.length" :tours="tours" />
        <UCard v-else class="rounded-3xl border-dashed">
          <p class="text-sm text-muted">No tours have been published yet.</p>
        </UCard>
      </div>
    </UContainer>
  </section>
</template>
