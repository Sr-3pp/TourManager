<script setup lang="ts">
import type { FeaturedOrganizer } from '~~/types/profile'

defineProps<{
  organizers: FeaturedOrganizer[]
}>()

function getOrganizerSocialLinksCount(social?: Record<string, string>) {
  return Object.values(social ?? {}).filter(Boolean).length
}
</script>

<template>
  <UCard class="overflow-hidden rounded-[2rem] lg:col-span-2">
    <div class="space-y-6 p-1">
      <div class="flex flex-col gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
        <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">
          Paid organizer placements
        </p>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 class="text-2xl font-semibold tracking-tight">Featured organizers</h3>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Only organizers marked as featured after payment are shown here.
            </p>
          </div>
          <UBadge color="secondary" variant="soft">{{ organizers.length }} active</UBadge>
        </div>
      </div>

      <UCarousel
        v-if="organizers.length"
        :items="organizers"
        arrows
        dots
        loop
        class="px-5 pb-10 sm:px-6 sm:pb-12"
        :ui="{
          item: 'basis-full lg:basis-1/2',
          prev: 'start-6 top-32 sm:start-8',
          next: 'end-6 top-32 sm:end-8',
          dots: 'relative inset-auto justify-start pt-4'
        }"
      >
        <template #default="{ item: entry }">
          <div class="overflow-hidden rounded-[1.75rem] border border-default bg-default">
            <div
              v-if="entry.profile.banner"
              class="h-44 bg-cover bg-center"
              :style="{ backgroundImage: `linear-gradient(180deg, transparent, rgba(0,0,0,0.18)), url(/blob/${entry.profile.banner})` }"
            />
            <div v-else class="flex h-44 items-end bg-gradient-to-br from-secondary via-primary to-secondary p-6 text-inverted">
              <div>
                <p class="text-xs uppercase tracking-[0.3em] text-inverted/70">Paid placement</p>
                <h3 class="mt-2 text-3xl font-bold">{{ entry.user.name || 'Organizer' }}</h3>
              </div>
            </div>

            <div class="space-y-5 p-6">
              <div class="flex items-center gap-4">
                <div class="flex h-18 w-18 items-center justify-center overflow-hidden rounded-3xl bg-muted">
                  <NuxtImg
                    v-if="entry.profile.picture"
                    :src="`/blob/${entry.profile.picture}`"
                    :alt="`${entry.user.name || 'Organizer'} picture`"
                    class="h-full w-full object-cover"
                  />
                  <UIcon v-else name="i-lucide-user-round" class="text-3xl text-muted" />
                </div>

                <div class="min-w-0">
                  <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Featured organizer</p>
                  <h3 class="truncate text-3xl font-semibold">{{ entry.user.name || 'Organizer' }}</h3>
                  <p v-if="entry.user.slug" class="mt-1 text-sm text-muted">@{{ entry.user.slug }}</p>
                </div>
              </div>

              <p class="max-w-3xl text-sm leading-6 text-muted">
                {{ entry.profile.bio || 'This organizer has secured homepage placement and will appear here while their public profile continues to take shape.' }}
              </p>

              <div class="grid gap-3 sm:grid-cols-2">
                <div class="rounded-2xl bg-muted/40 p-4">
                  <p class="text-xs uppercase tracking-[0.18em] text-muted">Tours</p>
                  <p class="mt-2 font-semibold">{{ entry.toursCount }}</p>
                </div>
                <div class="rounded-2xl bg-muted/40 p-4">
                  <p class="text-xs uppercase tracking-[0.18em] text-muted">Social links</p>
                  <p class="mt-2 font-semibold">{{ getOrganizerSocialLinksCount(entry.profile.social) }}</p>
                </div>
              </div>

              <div class="flex flex-wrap gap-3 justify-center">
                <UButton
                  v-if="entry.user.id || entry.user.slug"
                  :to="`/organizer/${entry.user.id || entry.user.slug}`"
                  color="secondary"
                >
                  View organizer
                </UButton>
              </div>
            </div>
          </div>
        </template>
      </UCarousel>

      <div v-else class="px-5 pb-5 sm:px-6 sm:pb-6">
        <div class="rounded-3xl border border-dashed border-default p-10 text-center">
          <p class="text-lg font-semibold">No featured organizers are available yet.</p>
          <p class="mt-3 text-sm text-muted">
            Once an organizer has paid and an admin marks their profile as featured, they will appear here automatically.
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>
