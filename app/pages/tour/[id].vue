<script setup lang="ts">
import type { Tour } from '~~/types/tour'

const id = String(useRoute().params.id || '')
const seo = useSeo()

const { session, fetchSession } = useAuth()
const { profile, loadProfile } = useProfile()
const { tour, loadTour } = useTour()

type ResettableModalForm = {
  resetDraft: () => void
}

const editTourModal = ref(false)
const addAttendeeModal = ref(false)
const addSponsorModal = ref(false)
const attendeeFormRef = ref<ResettableModalForm | null>(null)
const sponsorFormRef = ref<ResettableModalForm | null>(null)

await fetchSession()

if (session.value) {
  await loadProfile()
}

const loadedTour = await loadTour(id)

if (!loadedTour) {
  throw createError({
    statusCode: 404,
    statusMessage: 'No se pudo cargar el tour',
    fatal: true,
  })
}

const creatorId = computed(() => {
  const creator = tour.value?.creator

  if (!creator) {
    return ''
  }

  return typeof creator === 'string' ? creator : String(creator._id || '')
})

const isOwner = computed(() => {
  return Boolean(profile.value?.user && creatorId.value && profile.value.user === creatorId.value)
})

const packageOptions = computed(() =>
  (tour.value?.packages ?? []).map(pkg => ({
    label: pkg.name,
    value: String(pkg.level),
  })),
)

const formattedDate = computed(() => {
  if (!tour.value?.date) {
    return 'Fecha por confirmar'
  }

  const date = new Date(tour.value.date)
  if (Number.isNaN(date.getTime())) {
    return String(tour.value.date)
  }

  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
})

const formattedPrice = computed(() => {
  const price = Number(tour.value?.price ?? 0)

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(price)
})

const organizerName = computed(() => {
  const creator = tour.value?.creator

  if (!creator) {
    return 'Organizador por confirmar'
  }

  if (typeof creator === 'string') {
    return creator
  }

  return creator.name || creator.username || 'Organizador por confirmar'
})

const organizerLink = computed(() => {
  const creator = tour.value?.creator

  if (!creator || typeof creator === 'string' || !creator.username) {
    return null
  }

  return `/organizer/${creator.username}`
})

const attendeeCount = computed(() => tour.value?.attendees?.length ?? 0)
const sponsorCount = computed(() => tour.value?.sponsors?.length ?? 0)
const packageCount = computed(() => tour.value?.packages?.length ?? 0)
const departureCount = computed(() => tour.value?.departure_points?.length ?? 0)
const pageTitle = computed(() => `${tour.value?.name || 'Tour'} | ${seo.siteName.value}`)
const pageDescription = computed(() =>
  seo.description(
    tour.value?.description,
    tour.value?.location ? `Ubicación: ${tour.value.location}.` : '',
    formattedDate.value ? `Fecha: ${formattedDate.value}.` : '',
  ),
)
const canonicalUrl = computed(() => seo.canonical(`/tour/${id}`))
const tourImage = computed(() => {
  if (tour.value?.image) {
    return seo.imageUrl(`/blob/${tour.value.image}`)
  }

  return seo.imageUrl()
})
const structuredStartDate = computed(() => {
  if (!tour.value?.date) {
    return undefined
  }

  const date = new Date(tour.value.date)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
})

function formatDepartureDate(value: string | Date) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat('es-MX', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function packageLabelByLevel(level: string) {
  const match = tour.value?.packages?.find(pkg => String(pkg.level) === String(level))
  return match?.name || level
}

function openAddAttendeeModal() {
  attendeeFormRef.value?.resetDraft()
  addAttendeeModal.value = true
}

function openAddSponsorModal() {
  sponsorFormRef.value?.resetDraft()
  addSponsorModal.value = true
}

seo.setCanonical(`/tour/${id}`)

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogType: 'website',
  ogUrl: canonicalUrl,
  ogImage: tourImage,
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: tourImage,
})

seo.setJsonLd('tour-structured-data', {
  '@type': 'Event',
  name: tour.value?.name || 'Tour',
  description: pageDescription.value,
  url: canonicalUrl.value,
  image: [tourImage.value],
  startDate: structuredStartDate.value,
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  location: {
    '@type': 'Place',
    name: tour.value?.location || 'Ubicación por confirmar',
    address: tour.value?.location || 'México',
  },
  organizer: {
    '@type': 'Organization',
    name: organizerName.value,
    url: organizerLink.value ? seo.absoluteUrl(organizerLink.value) : undefined,
  },
  offers: {
    '@type': 'Offer',
    price: Number(tour.value?.price ?? 0),
    priceCurrency: 'MXN',
    availability: 'https://schema.org/InStock',
    url: canonicalUrl.value,
  },
})
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
        Volver a los tours
      </NuxtLink>

      <div class="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_360px] lg:items-start">
        <div class="space-y-8">
          <div class="overflow-hidden rounded-3xl border border-default bg-default shadow-sm">
            <figure class="relative">
              <NuxtImg
                v-if="tour?.image"
                :src="`/blob/${tour.image}`"
                :alt="tour?.name || 'Imagen del tour'"
                class="h-72 w-full object-cover sm:h-96"
              />
              <div
                v-else
                class="flex h-72 w-full items-center justify-center bg-gradient-to-br from-primary via-secondary to-primary text-inverted sm:h-96"
              >
                <div class="text-center">
                  <p class="text-xs uppercase tracking-[0.35em] text-inverted/70">Tour destacado</p>
                  <h1 class="mt-3 text-3xl font-bold sm:text-4xl">{{ tour?.name }}</h1>
                </div>
              </div>

              <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/80 via-secondary/35 to-transparent p-5 sm:p-7">
                <div class="flex flex-wrap items-center gap-2">
                  <UBadge color="secondary" variant="solid">{{ formattedDate }}</UBadge>
                  <UBadge color="primary" variant="solid">{{ formattedPrice }}</UBadge>
                  <UBadge color="secondary" variant="solid">{{ tour?.location }}</UBadge>
                  <UButton
                    v-if="isOwner"
                    size="sm"
                    color="neutral"
                    variant="solid"
                    class="ml-auto"
                    @click="editTourModal = true"
                  >
                    Editar tour
                  </UButton>
                </div>
              </div>
            </figure>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <UCard>
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-sm text-muted">Asistentes</p>
                  <p class="mt-2 text-3xl font-semibold">{{ attendeeCount }}</p>
                </div>
                <UIcon name="i-lucide-users" class="mt-1 text-2xl text-primary" />
              </div>
            </UCard>
            <UCard>
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-sm text-muted">Patrocinadores</p>
                  <p class="mt-2 text-3xl font-semibold">{{ sponsorCount }}</p>
                </div>
                <UIcon name="i-lucide-badge-dollar-sign" class="mt-1 text-2xl text-primary" />
              </div>
            </UCard>
            <UCard>
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-sm text-muted">Paquetes</p>
                  <p class="mt-2 text-3xl font-semibold">{{ packageCount }}</p>
                </div>
                <UIcon name="i-lucide-package" class="mt-1 text-2xl text-primary" />
              </div>
            </UCard>
            <UCard>
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-sm text-muted">Salidas</p>
                  <p class="mt-2 text-3xl font-semibold">{{ departureCount }}</p>
                </div>
                <UIcon name="i-lucide-map-pinned" class="mt-1 text-2xl text-primary" />
              </div>
            </UCard>
          </div>

          <UCard class="rounded-3xl">
            <div class="space-y-6">
              <div>
                <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Resumen</p>
                <h1 class="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{{ tour?.name }}</h1>
                <p class="mt-4 max-w-3xl text-base leading-7 text-muted">
                  {{ tour?.description || 'Se están preparando los detalles completos del evento. Vuelve pronto para ver el itinerario final y los aspectos destacados.' }}
                </p>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <div class="rounded-2xl bg-muted/40 p-4">
                  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Ubicación</p>
                  <p class="mt-2 text-lg font-medium">{{ tour?.location || 'Ubicación por confirmar' }}</p>
                </div>
                <div class="rounded-2xl bg-muted/40 p-4">
                  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Organizador</p>
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
                  <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Paquetes</p>
                  <h2 class="mt-2 text-2xl font-semibold">Qué incluye</h2>
                </div>
                <UBadge color="neutral" variant="soft">{{ packageCount }} opciones</UBadge>
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
                      {{ new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(pkg.price) }}
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
                Los detalles de los paquetes aún no se han publicado.
              </div>
            </UCard>

            <UCard class="rounded-3xl">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Salidas</p>
                  <h2 class="mt-2 text-2xl font-semibold">Plan de salida</h2>
                </div>
                <UBadge color="neutral" variant="soft">{{ departureCount }} paradas</UBadge>
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
                Los puntos de salida se compartirán más cerca de la fecha del evento.
              </div>
            </UCard>
          </div>

          <div class="grid gap-6 xl:grid-cols-2">
            <UCard class="rounded-3xl">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Asistentes</p>
                  <h2 class="mt-2 text-2xl font-semibold">Quiénes vienen</h2>
                </div>
                <div class="flex items-center gap-2">
                  <UButton
                    v-if="isOwner"
                    size="sm"
                    variant="soft"
                    icon="i-lucide-plus"
                    @click="openAddAttendeeModal"
                  >
                    Agregar
                  </UButton>
                  <UBadge color="neutral" variant="soft">{{ attendeeCount }}</UBadge>
                </div>
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
                Aún no se han agregado asistentes.
              </div>
            </UCard>

            <UCard class="rounded-3xl">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Patrocinadores</p>
                  <h2 class="mt-2 text-2xl font-semibold">Aliados</h2>
                </div>
                <div class="flex items-center gap-2">
                  <UButton
                    v-if="isOwner"
                    size="sm"
                    variant="soft"
                    icon="i-lucide-plus"
                    @click="openAddSponsorModal"
                  >
                    Agregar
                  </UButton>
                  <UBadge color="neutral" variant="soft">{{ sponsorCount }}</UBadge>
                </div>
              </div>

              <div v-if="tour?.sponsors?.length" class="mt-6 space-y-3">
                <div
                  v-for="sponsor in tour.sponsors"
                  :key="`${sponsor.name}-${sponsor.website}`"
                  class="flex items-start justify-between gap-4 rounded-2xl border border-default p-4"
                >
                  <div class="min-w-0">
                    <p class="font-medium">{{ sponsor.name }}</p>
                    <p class="text-sm text-muted">{{ packageLabelByLevel(sponsor.packageLevel) }}</p>
                    <NuxtLink
                      v-if="sponsor.website"
                      :to="sponsor.website"
                      target="_blank"
                      class="mt-2 inline-flex text-sm text-primary hover:opacity-80"
                    >
                      Visitar sitio web
                    </NuxtLink>
                  </div>
                  <div v-if="sponsor.logo" class="h-12 w-12 overflow-hidden rounded-xl border border-default">
                    <NuxtImg :src="`/blob/${sponsor.logo}`" :alt="`Logotipo de ${sponsor.name}`" class="h-full w-full object-cover" />
                  </div>
                </div>
              </div>

              <div v-else class="mt-6 rounded-2xl border border-dashed border-default p-5 text-sm text-muted">
                Aún no se ha agregado la información de patrocinio.
              </div>
            </UCard>
          </div>
        </div>

        <aside class="lg:sticky lg:top-6">
          <UCard class="rounded-3xl border-default shadow-sm">
            <div class="space-y-6">
              <div>
                <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Resumen de reserva</p>
                <p class="mt-3 text-4xl font-bold tracking-tight">{{ formattedPrice }}</p>
                <p class="mt-2 text-sm leading-6 text-muted">
                  Reserva tu lugar para <span class="font-medium text-primary">{{ formattedDate }}</span> en
                  <span class="font-medium text-secondary">{{ tour?.location }}</span>.
                </p>
              </div>

              <USeparator />

              <div class="space-y-4">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted">Fecha del tour</span>
                  <span class="font-medium text-right">{{ formattedDate }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted">Organizador</span>
                  <span class="font-medium text-right">{{ organizerName }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted">Paquetes</span>
                  <span class="font-medium">{{ packageCount }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted">Puntos de salida</span>
                  <span class="font-medium">{{ departureCount }}</span>
                </div>
              </div>

              <UButton block size="xl">Reservar este tour</UButton>
              <UButton block size="xl" color="neutral" variant="soft">Contactar organizador</UButton>
            </div>
          </UCard>
        </aside>
      </div>
    </UContainer>

    <UModal v-model:open="editTourModal" title="Editar tour">
      <template #body>
        <TourForm :tour-id="id" @saved="editTourModal = false" />
      </template>
    </UModal>

    <UModal v-model:open="addAttendeeModal" title="Agregar asistente">
      <template #body>
        <TourAttendeeForm
          ref="attendeeFormRef"
          :tour="tour!"
          :tour-id="id"
          @saved="addAttendeeModal = false"
          @cancel="addAttendeeModal = false"
        />
      </template>
    </UModal>

    <UModal v-model:open="addSponsorModal" title="Agregar patrocinador">
      <template #body>
        <TourSponsorForm
          ref="sponsorFormRef"
          :tour="tour!"
          :tour-id="id"
          :package-options="packageOptions"
          @saved="addSponsorModal = false"
          @cancel="addSponsorModal = false"
        />
      </template>
    </UModal>
  </section>
</template>
