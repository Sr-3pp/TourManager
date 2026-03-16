<script setup lang="ts">
import type { Tour } from '~~/types/tour'

const id = useRoute().params.id as string

const { loadTour } = useTour()

const { data: tour, error } = await useAsyncData<Tour | null>(
  () => `tour-${id}`,
  () => loadTour(id),
)

const formattedDate = computed(() => {
  if (!tour.value?.date) {
    return 'Date to be announced'
  }

  const date = new Date(tour.value.date)
  if (Number.isNaN(date.getTime())) {
    return String(tour.value.date)
  }

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
})

const formattedPrice = computed(() => {
  const price = Number(tour.value?.price ?? 0)

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
})

const organizerName = computed(() => {
  const creator = tour.value?.creator

  if (!creator) {
    return 'Organizer to be announced'
  }

  if (typeof creator === 'string') {
    return creator
  }

  return creator.name || creator.slug || 'Organizer to be announced'
})

const organizerLink = computed(() => {
  const creator = tour.value?.creator

  if (!creator || typeof creator === 'string' || !creator.slug) {
    return null
  }

  return `/organizer/${creator.slug}`
})

const attendeeCount = computed(() => tour.value?.attendees?.length ?? 0)
const sponsorCount = computed(() => tour.value?.sponsors?.length ?? 0)
const packageCount = computed(() => tour.value?.packages?.length ?? 0)
const departureCount = computed(() => tour.value?.departure_points?.length ?? 0)

function formatDepartureDate(value: string | Date) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode || 500,
    statusMessage: error.value.statusMessage || 'Failed to load tour',
    fatal: true,
  })
}
</script>

<template>
  <section class="relative overflow-hidden bg-default">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute left-0 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div class="absolute right-0 top-24 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
    </div>

    <UContainer class="relative py-8 sm:py-10 lg:py-14">
      <NuxtLink to="/" class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80">
        <UIcon name="i-lucide-arrow-left" />
        Back to tours
      </NuxtLink>

      <div class="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_360px] lg:items-start">
        <div class="space-y-8">
          <div class="overflow-hidden rounded-3xl border border-default bg-default shadow-sm">
            <figure class="relative">
              <NuxtImg
                v-if="tour?.image"
                :src="`/blob/${tour.image}`"
                :alt="tour?.name || 'Tour image'"
                class="h-72 w-full object-cover sm:h-96"
              />
              <div
                v-else
                class="flex h-72 w-full items-center justify-center bg-gradient-to-br from-primary via-secondary to-primary text-inverted sm:h-96"
              >
                <div class="text-center">
                  <p class="text-xs uppercase tracking-[0.35em] text-inverted/70">Featured Tour</p>
                  <h1 class="mt-3 text-3xl font-bold sm:text-4xl">{{ tour?.name }}</h1>
                </div>
              </div>

              <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/80 via-secondary/35 to-transparent p-5 sm:p-7">
                <div class="flex flex-wrap gap-2">
                  <UBadge color="secondary" variant="solid"> {{ formattedDate }} </UBadge>
                  <UBadge color="primary" variant="solid"> {{ formattedPrice }} </UBadge>
                  <UBadge color="secondary" variant="solid"> {{ tour?.location }} </UBadge>
                </div>
              </div>
            </figure>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <UCard>
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-sm text-muted">Attendees</p>
                  <p class="mt-2 text-3xl font-semibold">{{ attendeeCount }}</p>
                </div>
                <UIcon name="i-lucide-users" class="mt-1 text-2xl text-primary" />
              </div>
            </UCard>
            <UCard>
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-sm text-muted">Sponsors</p>
                  <p class="mt-2 text-3xl font-semibold">{{ sponsorCount }}</p>
                </div>
                <UIcon name="i-lucide-badge-dollar-sign" class="mt-1 text-2xl text-primary" />
              </div>
            </UCard>
            <UCard>
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-sm text-muted">Packages</p>
                  <p class="mt-2 text-3xl font-semibold">{{ packageCount }}</p>
                </div>
                <UIcon name="i-lucide-package" class="mt-1 text-2xl text-primary" />
              </div>
            </UCard>
            <UCard>
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-sm text-muted">Departures</p>
                  <p class="mt-2 text-3xl font-semibold">{{ departureCount }}</p>
                </div>
                <UIcon name="i-lucide-map-pinned" class="mt-1 text-2xl text-primary" />
              </div>
            </UCard>
          </div>

          <UCard class="rounded-3xl">
            <div class="space-y-6">
              <div>
                <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Overview</p>
                <h1 class="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{{ tour?.name }}</h1>
                <p class="mt-4 max-w-3xl text-base leading-7 text-muted">
                  {{ tour?.description || 'Full event details are being prepared. Check back soon for the final itinerary and highlights.' }}
                </p>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <div class="rounded-2xl bg-muted/40 p-4">
                  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Location</p>
                  <p class="mt-2 text-lg font-medium">{{ tour?.location || 'Location to be announced' }}</p>
                </div>
                <div class="rounded-2xl bg-muted/40 p-4">
                  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Organizer</p>
                  <NuxtLink
                    v-if="organizerLink"
                    :to="organizerLink"
                    class="mt-2 inline-flex text-lg font-medium text-primary hover:opacity-80"
                  >
                    {{ organizerName }}
                  </NuxtLink>
                  <p v-else class="mt-2 text-lg font-medium">{{ organizerName }}</p>
                </div>
              </div>
            </div>
          </UCard>

          <div class="grid gap-6 xl:grid-cols-2">
            <UCard class="rounded-3xl">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Packages</p>
                  <h2 class="mt-2 text-2xl font-semibold">What’s included</h2>
                </div>
                <UBadge color="neutral" variant="soft">{{ packageCount }} options</UBadge>
              </div>

              <div v-if="tour?.packages?.length" class="mt-6 space-y-4">
                <div
                  v-for="pkg in tour.packages"
                  :key="`${pkg.level}-${pkg.name}`"
                  class="rounded-2xl border border-default p-4"
                >
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p class="text-lg font-semibold">{{ pkg.name }}</p>
                      <p class="text-sm text-muted">{{ pkg.description }}</p>
                    </div>
                    <UBadge color="primary" variant="soft">
                      {{ new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(pkg.price) }}
                    </UBadge>
                  </div>

                  <ul v-if="pkg.benefits?.length" class="mt-4 space-y-2 text-sm text-muted">
                    <li v-for="benefit in pkg.benefits" :key="benefit" class="flex items-start gap-2">
                      <UIcon name="i-lucide-check" class="mt-0.5 text-base text-primary" />
                      <span>{{ benefit }}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div v-else class="mt-6 rounded-2xl border border-dashed border-default p-5 text-sm text-muted">
                Package details have not been published yet.
              </div>
            </UCard>

            <UCard class="rounded-3xl">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Departures</p>
                  <h2 class="mt-2 text-2xl font-semibold">Pickup plan</h2>
                </div>
                <UBadge color="neutral" variant="soft">{{ departureCount }} stops</UBadge>
              </div>

              <div v-if="tour?.departure_points?.length" class="mt-6 space-y-4">
                <div
                  v-for="point in tour.departure_points"
                  :key="`${point.name}-${point.location}`"
                  class="rounded-2xl border border-default p-4"
                >
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p class="text-lg font-semibold">{{ point.name }}</p>
                      <p class="text-sm text-muted">{{ point.location }}</p>
                    </div>
                    <UBadge color="neutral" variant="soft">{{ formatDepartureDate(point.dateTime) }}</UBadge>
                  </div>
                  <p v-if="point.notes" class="mt-3 text-sm leading-6 text-muted">{{ point.notes }}</p>
                </div>
              </div>

              <div v-else class="mt-6 rounded-2xl border border-dashed border-default p-5 text-sm text-muted">
                Departure points will be shared closer to the event date.
              </div>
            </UCard>
          </div>

          <div class="grid gap-6 xl:grid-cols-2">
            <UCard class="rounded-3xl">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Attendees</p>
                  <h2 class="mt-2 text-2xl font-semibold">Who’s coming</h2>
                </div>
                <UBadge color="neutral" variant="soft">{{ attendeeCount }}</UBadge>
              </div>

              <div v-if="tour?.attendees?.length" class="mt-6 space-y-3">
                <div
                  v-for="attendee in tour.attendees"
                  :key="attendee.email"
                  class="flex items-start justify-between gap-4 rounded-2xl border border-default p-4"
                >
                  <div>
                    <p class="font-medium">{{ attendee.name }}</p>
                    <p class="text-sm text-muted">{{ attendee.email }}</p>
                  </div>
                  <div class="flex gap-2 text-muted">
                    <UIcon v-if="attendee.social?.instagram" name="i-simple-icons-instagram" />
                    <UIcon v-if="attendee.social?.x" name="i-simple-icons-x" />
                    <UIcon v-if="attendee.social?.tiktok" name="i-simple-icons-tiktok" />
                  </div>
                </div>
              </div>

              <div v-else class="mt-6 rounded-2xl border border-dashed border-default p-5 text-sm text-muted">
                No attendees have been added yet.
              </div>
            </UCard>

            <UCard class="rounded-3xl">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Sponsors</p>
                  <h2 class="mt-2 text-2xl font-semibold">Partners</h2>
                </div>
                <UBadge color="neutral" variant="soft">{{ sponsorCount }}</UBadge>
              </div>

              <div v-if="tour?.sponsors?.length" class="mt-6 space-y-3">
                <div
                  v-for="sponsor in tour.sponsors"
                  :key="`${sponsor.name}-${sponsor.website}`"
                  class="flex items-start justify-between gap-4 rounded-2xl border border-default p-4"
                >
                  <div class="min-w-0">
                    <p class="font-medium">{{ sponsor.name }}</p>
                    <p class="text-sm text-muted">{{ sponsor.packageLevel }}</p>
                    <NuxtLink
                      v-if="sponsor.website"
                      :to="sponsor.website"
                      target="_blank"
                      class="mt-2 inline-flex text-sm text-primary hover:opacity-80"
                    >
                      Visit website
                    </NuxtLink>
                  </div>
                  <div v-if="sponsor.logo" class="h-12 w-12 overflow-hidden rounded-xl border border-default">
                    <NuxtImg :src="`/blob/${sponsor.logo}`" :alt="`${sponsor.name} logo`" class="h-full w-full object-cover" />
                  </div>
                </div>
              </div>

              <div v-else class="mt-6 rounded-2xl border border-dashed border-default p-5 text-sm text-muted">
                Sponsorship information has not been added yet.
              </div>
            </UCard>
          </div>
        </div>

        <aside class="lg:sticky lg:top-6">
          <UCard class="rounded-3xl border-default shadow-sm">
            <div class="space-y-6">
              <div>
                <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Booking Summary</p>
                <p class="mt-3 text-4xl font-bold tracking-tight">{{ formattedPrice }}</p>
                <p class="mt-2 text-sm leading-6 text-muted">
                  Reserve your spot for <span class="font-medium text-primary">{{ formattedDate }}</span> in
                  <span class="font-medium text-secondary">{{ tour?.location }}</span>.
                </p>
              </div>

              <USeparator />

              <div class="space-y-4">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted">Tour date</span>
                  <span class="font-medium text-right">{{ formattedDate }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted">Organizer</span>
                  <span class="font-medium text-right">{{ organizerName }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted">Packages</span>
                  <span class="font-medium">{{ packageCount }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted">Departure points</span>
                  <span class="font-medium">{{ departureCount }}</span>
                </div>
              </div>

              <UButton block size="xl">Reserve This Tour</UButton>
              <UButton block size="xl" color="neutral" variant="soft">Contact Organizer</UButton>
            </div>
          </UCard>
        </aside>
      </div>
    </UContainer>
  </section>
</template>
