<script setup lang="ts">
import { formatTourDate, formatTourPrice, getTourOrganizerName } from '~~/app/utils/tour'

const { featuredTours, featuredTour, loadFeaturedTours } = useTour()
const { featuredOrganizers, loadFeaturedOrganizers } = useUser()

const featuredDate = computed(() => {
  return formatTourDate(featuredTour.value?.date, 'Schedule coming soon', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
})

const featuredPrice = computed(() => formatTourPrice(featuredTour.value?.price))
const featuredOrganizer = computed(() => getTourOrganizerName(featuredTour.value))

const { error } = await useAsyncData(
  'homepage-featured-content',
  async () => {
    await Promise.all([
      loadFeaturedTours({ force: true }),
      loadFeaturedOrganizers({ force: true }),
    ])
  },
)

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode || 500,
    statusMessage: error.value.statusMessage || 'Failed to load tours',
    fatal: true,
  })
}
</script>

<template>
  <section class="relative overflow-hidden bg-default">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute left-0 top-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div class="absolute right-0 top-20 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
    </div>

    <UContainer class="relative py-10 sm:py-14 lg:py-18">
      <div class="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,440px)] lg:items-center">
        <div class="space-y-6">
          <div class="inline-flex rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-secondary">
            Featured tours
          </div>

          <div class="space-y-4">
            <h1 class="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Give paid placements the homepage visibility they were meant to get.
            </h1>
            <p class="max-w-2xl text-base leading-7 text-muted sm:text-lg">
              This section is reserved for tours marked as featured, so promoted trips get priority placement across the landing page.
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <UButton v-if="featuredTour?._id" :to="`/tour/${featuredTour._id}`" color="primary" size="xl">
              Explore featured tour
            </UButton>
            <UButton to="/#tour-showcase" color="secondary" variant="soft" size="xl">
              Browse showcase
            </UButton>
          </div>
        </div>

        <UCard class="rounded-[2rem] border-default/80 bg-default/90 shadow-sm">
          <div v-if="featuredTour" class="space-y-5">
            <div class="overflow-hidden rounded-[1.5rem]">
              <NuxtImg
                v-if="featuredTour.image"
                :src="`/blob/${featuredTour.image}`"
                :alt="featuredTour.name"
                class="h-64 w-full object-cover"
              />
              <div
                v-else
                class="flex h-64 items-end bg-gradient-to-br from-primary via-secondary to-primary p-6 text-inverted"
              >
                <div>
                  <p class="text-xs uppercase tracking-[0.3em] text-inverted/70">Featured route</p>
                  <h2 class="mt-3 text-3xl font-bold">{{ featuredTour.name }}</h2>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <UBadge color="secondary" variant="soft">{{ featuredDate }}</UBadge>
              <UBadge color="primary" variant="soft">{{ featuredPrice }}</UBadge>
              <UBadge color="neutral" variant="soft">{{ featuredTour.location || 'Location pending' }}</UBadge>
            </div>

            <div>
              <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Now spotlighting</p>
              <h2 class="mt-2 text-3xl font-semibold tracking-tight">{{ featuredTour.name }}</h2>
              <p class="mt-3 text-sm leading-6 text-muted">
                {{ featuredTour.description || 'This featured tour currently has paid visibility on the homepage while route details and attendee information continue to update.' }}
              </p>
            </div>

            <div class="grid gap-3 sm:grid-cols-3">
              <div class="rounded-2xl bg-muted/40 p-4">
                <p class="text-xs uppercase tracking-[0.18em] text-muted">Organizer</p>
                <p class="mt-2 font-semibold">{{ featuredOrganizer }}</p>
              </div>
              <div class="rounded-2xl bg-muted/40 p-4">
                <p class="text-xs uppercase tracking-[0.18em] text-muted">Attendees</p>
                <p class="mt-2 font-semibold">{{ featuredTour.attendees?.length ?? 0 }}</p>
              </div>
              <div class="rounded-2xl bg-muted/40 p-4">
                <p class="text-xs uppercase tracking-[0.18em] text-muted">Sponsors</p>
                <p class="mt-2 font-semibold">{{ featuredTour.sponsors?.length ?? 0 }}</p>
              </div>
            </div>
          </div>

          <div v-else class="rounded-[1.5rem] border border-dashed border-default p-8 text-center">
            <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">No featured tours yet</p>
            <h2 class="mt-3 text-2xl font-semibold">The homepage is waiting for its first paid placement.</h2>
            <p class="mt-3 text-sm leading-6 text-muted">
              Once a tour is marked as featured, it will appear here automatically.
            </p>
          </div>
        </UCard>
      </div>

      <div id="tour-showcase" class="mt-12 space-y-6 scroll-mt-28 sm:mt-16">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">
              Paid homepage placements
            </p>
            <h2 class="mt-2 text-3xl font-semibold tracking-tight">Featured organizers and tours</h2>
          </div>
          <p class="max-w-2xl text-sm leading-6 text-muted">
            Organizers and tours share the same row here, each inside its own carousel-driven panel.
          </p>
        </div>

        <div class="grid gap-6 lg:grid-cols-3 lg:items-start">
          <HomeFeaturedOrganizersPanel :organizers="featuredOrganizers" />
          <HomeFeaturedToursPanel :tours="featuredTours" />
        </div>
      </div>
    </UContainer>
  </section>
</template>
