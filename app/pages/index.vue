<script setup lang="ts">
import { formatTourDate, formatTourPrice, getTourOrganizerName } from '~~/app/utils/tour'

const { featuredTours, featuredTour, loadFeaturedTours } = useTour()
const { featuredOrganizers, loadFeaturedOrganizers } = useUser()
const seo = useSeo()

const featuredDate = computed(() => {
  return formatTourDate(featuredTour.value?.date, 'Horario próximamente', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
})

const featuredPrice = computed(() => formatTourPrice(featuredTour.value?.price))
const featuredOrganizer = computed(() => getTourOrganizerName(featuredTour.value))
const pageTitle = computed(() => `Tours destacados y organizadores | ${seo.siteName.value}`)
const pageDescription = computed(() =>
  seo.description(
    'Descubre tours destacados, organizadores y próximas experiencias de viaje en Tour Manager.',
    featuredTour.value?.name ? `Tour en portada: ${featuredTour.value.name}.` : '',
    featuredTour.value?.location ? `Ubicación: ${featuredTour.value.location}.` : '',
  ),
)

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
    statusMessage: error.value.statusMessage || 'No se pudieron cargar los tours',
    fatal: true,
  })
}

seo.setCanonical('/')

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogType: 'website',
  ogUrl: seo.canonical('/'),
  ogImage: seo.imageUrl(),
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: seo.imageUrl(),
})

seo.setJsonLd('home-structured-data', [
  {
    '@type': 'WebSite',
    name: seo.siteName.value,
    url: seo.canonical('/'),
    description: pageDescription.value,
    inLanguage: 'es-MX',
  },
  {
    '@type': 'Organization',
    name: seo.siteName.value,
    url: seo.canonical('/'),
    logo: seo.imageUrl('/favicon.ico'),
  },
])
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
            Tours destacados
          </div>

          <div class="space-y-4">
            <h1 class="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Descubre tours destacados, organizadores y nuevas experiencias de viaje.
            </h1>
            <p class="max-w-2xl text-base leading-7 text-muted sm:text-lg">
              Tour Manager reúne tours promocionados y perfiles de organizadores para que la portada muestre las salidas con mayor visibilidad y contexto para nuevos viajeros.
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <UButton v-if="featuredTour?._id" :to="`/tour/${featuredTour._id}`" color="primary" size="xl">
              Ver tour destacado
            </UButton>
            <UButton to="/#tour-showcase" color="secondary" variant="soft" size="xl">
              Ver destacados
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
                  <p class="text-xs uppercase tracking-[0.3em] text-inverted/70">Ruta destacada</p>
                  <h2 class="mt-3 text-3xl font-bold">{{ featuredTour.name }}</h2>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <UBadge color="secondary" variant="soft">{{ featuredDate }}</UBadge>
              <UBadge color="primary" variant="soft">{{ featuredPrice }}</UBadge>
              <UBadge color="neutral" variant="soft">{{ featuredTour.location || 'Ubicación pendiente' }}</UBadge>
            </div>

            <div>
              <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">En portada ahora</p>
              <h2 class="mt-2 text-3xl font-semibold tracking-tight">{{ featuredTour.name }}</h2>
              <p class="mt-3 text-sm leading-6 text-muted">
                {{ featuredTour.description || 'Este tour destacado tiene visibilidad pagada en la portada mientras se siguen actualizando los detalles de la ruta y la información de asistentes.' }}
              </p>
            </div>

            <div class="grid gap-3 sm:grid-cols-3">
              <div class="rounded-2xl bg-muted/40 p-4 col-span-3">
                  <p class="text-xs uppercase tracking-[0.18em] text-muted">Organizador</p>
                <p class="mt-2 font-semibold">{{ featuredOrganizer }}</p>
              </div>
              <div class="rounded-2xl bg-muted/40 p-4">
                  <p class="text-xs uppercase tracking-[0.18em] text-muted">Asistentes</p>
                <p class="mt-2 font-semibold">{{ featuredTour.attendees?.length ?? 0 }}</p>
              </div>
              <div class="rounded-2xl bg-muted/40 p-4">
                  <p class="text-xs uppercase tracking-[0.18em] text-muted">Patrocinadores</p>
                <p class="mt-2 font-semibold">{{ featuredTour.sponsors?.length ?? 0 }}</p>
              </div>
            </div>
          </div>

          <div v-else class="rounded-[1.5rem] border border-dashed border-default p-8 text-center">
            <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Aún no hay tours destacados</p>
            <h2 class="mt-3 text-2xl font-semibold">La portada está esperando su primera promoción pagada.</h2>
            <p class="mt-3 text-sm leading-6 text-muted">
              Cuando un tour sea marcado como destacado, aparecerá aquí automáticamente.
            </p>
          </div>
        </UCard>
      </div>

      <div id="tour-showcase" class="mt-12 space-y-6 scroll-mt-28 sm:mt-16">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">
              Promociones pagadas en portada
            </p>
            <h2 class="mt-2 text-3xl font-semibold tracking-tight">Organizadores y tours destacados</h2>
          </div>
          <p class="max-w-2xl text-sm leading-6 text-muted">
            Explora perfiles de organizadores, tours activos y experiencias destacadas desde un solo escaparate público.
          </p>
        </div>

        <div class="grid gap-6 lg:grid-cols-3 lg:items-start">
          <OrganizerFeaturedCarousel :organizers="featuredOrganizers" />
          <TourFeaturedCarousel :tours="featuredTours" />
        </div>
      </div>
    </UContainer>
  </section>
</template>
