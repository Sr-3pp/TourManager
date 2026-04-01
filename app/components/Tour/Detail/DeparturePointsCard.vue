<script setup lang="ts">
import type { TourDeparturePoint } from '~~/types/tour'
import { formatDepartureDate } from '~~/app/utils/tour'

defineProps<{
  departurePoints: TourDeparturePoint[]
  departureCount: number
}>()
</script>

<template>
  <UCard class="rounded-3xl" variant="soft">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Salidas</p>
        <h2 class="mt-2 text-2xl font-semibold">Plan de salida</h2>
      </div>
      <UBadge color="neutral" variant="soft">{{ departureCount }} paradas</UBadge>
    </div>

    <div v-if="departurePoints.length" class="mt-6 space-y-4">
      <div
        v-for="point in departurePoints"
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
</template>
