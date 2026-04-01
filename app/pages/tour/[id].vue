<script setup lang="ts">
import type { Tour } from '~~/types/tour'
import type { ResettableFormHandle } from '~~/types/app'
import {
  formatTourDate,
  formatTourPrice,
  getTourCreatorId,
  getTourOrganizerLink,
  getTourOrganizerName,
} from '~~/app/utils/tour'
import { toEditableTourState } from '~~/app/utils/tour-form'

const id = String(useRoute().params.id || '')
const seo = useSeo()

const { session, fetchSession } = useAuth()
const { profile, loadProfile } = useProfile()
const { tour, loadTour, saveTour } = useTour()
const { openConfirmation } = useConfirmation()

const editTourModal = ref(false)
const addAttendeeModal = ref(false)
const addSponsorModal = ref(false)
const attendeeFormRef = ref<ResettableFormHandle | null>(null)
const sponsorFormRef = ref<ResettableFormHandle | null>(null)

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

const creatorId = computed(() => getTourCreatorId(tour.value))

const isOwner = computed(() => {
  return Boolean(profile.value?.user && creatorId.value && profile.value.user === creatorId.value)
})

const packageOptions = computed(() =>
  (tour.value?.packages ?? []).map(pkg => ({
    label: pkg.name,
    value: String(pkg.level),
  })),
)

const formattedDate = computed(() => formatTourDate(tour.value?.date))
const formattedPrice = computed(() => formatTourPrice(tour.value?.price))
const organizerName = computed(() => getTourOrganizerName(tour.value))
const organizerLink = computed(() => getTourOrganizerLink(tour.value))

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

function openAddAttendeeModal() {
  attendeeFormRef.value?.resetDraft()
  addAttendeeModal.value = true
}

function openAddSponsorModal() {
  sponsorFormRef.value?.resetDraft()
  addSponsorModal.value = true
}

async function removeAttendee(index: number) {
  if (!tour.value || !isOwner.value) {
    return
  }

  const attendee = tour.value.attendees?.[index]
  if (!attendee) {
    return
  }

  await openConfirmation({
    title: `¿Quitar a ${attendee.name}?`,
    description: 'Se eliminará este asistente del tour.',
    confirmLabel: 'Quitar asistente',
    color: 'error',
    icon: 'i-lucide-triangle-alert',
    onConfirm: async () => {
      const form = toEditableTourState(tour.value as Tour)
      form.attendees.splice(index, 1)

      const ok = await saveTour(form, undefined, { id })
      if (!ok) {
        throw new Error('No se pudo quitar el asistente.')
      }
    },
  })
}

async function removeSponsor(index: number) {
  if (!tour.value || !isOwner.value) {
    return
  }

  const sponsor = tour.value.sponsors?.[index]
  if (!sponsor) {
    return
  }

  await openConfirmation({
    title: `¿Quitar a ${sponsor.name}?`,
    description: 'Se eliminará este patrocinador del tour.',
    confirmLabel: 'Quitar patrocinador',
    color: 'error',
    icon: 'i-lucide-triangle-alert',
    onConfirm: async () => {
      const form = toEditableTourState(tour.value as Tour)
      form.sponsors.splice(index, 1)

      const ok = await saveTour(form, undefined, { id })
      if (!ok) {
        throw new Error('No se pudo quitar el patrocinador.')
      }
    },
  })
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
          <TourDetailHero
            :tour="tour"
            :is-owner="isOwner"
            :formatted-date="formattedDate"
            :formatted-price="formattedPrice"
            :attendee-count="attendeeCount"
            :sponsor-count="sponsorCount"
            :package-count="packageCount"
            :departure-count="departureCount"
            @edit="editTourModal = true"
          />

          <TourDetailSections
            :tour="tour"
            :is-owner="isOwner"
            :organizer-name="organizerName"
            :organizer-link="organizerLink"
            :attendee-count="attendeeCount"
            :sponsor-count="sponsorCount"
            :package-count="packageCount"
            :departure-count="departureCount"
            @add-attendee="openAddAttendeeModal"
            @add-sponsor="openAddSponsorModal"
            @remove-attendee="removeAttendee"
            @remove-sponsor="removeSponsor"
          />
        </div>

        <TourBookingSidebar
          :formatted-date="formattedDate"
          :formatted-price="formattedPrice"
          :organizer-name="organizerName"
          :package-count="packageCount"
          :departure-count="departureCount"
          :location="tour?.location"
          :packages="tour?.packages ?? []"
          :departure-points="tour?.departure_points ?? []"
        />
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
        <TourFormSponsor
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
