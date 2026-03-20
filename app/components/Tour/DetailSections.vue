<script setup lang="ts">
import type { Tour } from '~~/types/tour'
import { formatDepartureDate, formatTourPrice } from '~~/app/utils/tour'

const props = defineProps<{
  tour?: Tour
  isOwner?: boolean
  organizerName: string
  organizerLink?: string | null
  attendeeCount: number
  sponsorCount: number
  packageCount: number
  departureCount: number
}>()

defineEmits<{
  addAttendee: []
  addSponsor: []
  removeAttendee: [index: number]
  removeSponsor: [index: number]
}>()

function packageLabelByLevel(level: string) {
  const match = props.tour?.packages?.find(pkg => String(pkg.level) === String(level))
  return match?.name || level
}
</script>

<template>
  <div class="space-y-8">
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
                {{ formatTourPrice(pkg.price) }}
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
              @click="$emit('addAttendee')"
            >
              Agregar
            </UButton>
            <UBadge color="neutral" variant="soft">{{ attendeeCount }}</UBadge>
          </div>
        </div>

        <div v-if="tour?.attendees?.length" class="mt-6 space-y-3">
          <div
            v-for="(attendee, attendeeIndex) in tour.attendees"
            :key="`${attendee.email}-${attendeeIndex}`"
            class="flex items-start justify-between gap-4 rounded-2xl border border-default p-4"
          >
            <div class="min-w-0">
              <p class="font-medium">{{ attendee.name }}</p>
              <p class="text-sm text-muted">{{ attendee.email }}</p>
            </div>
            <div class="flex items-start gap-3">
              <div class="flex gap-2 text-muted">
                <UIcon v-if="attendee.social?.instagram" name="i-simple-icons-instagram" />
                <UIcon v-if="attendee.social?.x" name="i-simple-icons-x" />
                <UIcon v-if="attendee.social?.tiktok" name="i-simple-icons-tiktok" />
              </div>
              <UButton
                v-if="isOwner"
                size="xs"
                color="error"
                variant="ghost"
                icon="i-lucide-trash"
                @click="$emit('removeAttendee', attendeeIndex)"
              >
                Quitar
              </UButton>
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
              @click="$emit('addSponsor')"
            >
              Agregar
            </UButton>
            <UBadge color="neutral" variant="soft">{{ sponsorCount }}</UBadge>
          </div>
        </div>

        <div v-if="tour?.sponsors?.length" class="mt-6 space-y-3">
          <div
            v-for="(sponsor, sponsorIndex) in tour.sponsors"
            :key="`${sponsor.name}-${sponsor.website}-${sponsorIndex}`"
            class="flex items-start justify-between gap-4 rounded-2xl border border-default p-4"
          >
            <div class="flex min-w-0 flex-1 items-start justify-between gap-4">
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
              <UButton
                v-if="isOwner"
                size="xs"
                color="error"
                variant="ghost"
                icon="i-lucide-trash"
                @click="$emit('removeSponsor', sponsorIndex)"
              >
                Quitar
              </UButton>
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
</template>
