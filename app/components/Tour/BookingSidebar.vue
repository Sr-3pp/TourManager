<script setup lang="ts">
import type { TourDeparturePoint, TourPackage } from '~~/types/tour'

defineProps<{
  formattedDate: string
  formattedPrice: string
  organizerName: string
  packageCount: number
  departureCount: number
  location?: string
  packages: TourPackage[]
  departurePoints: TourDeparturePoint[]
}>()
</script>

<template>
  <aside class="lg:sticky lg:top-6 flex flex-col gap-6">
    <UCard class="rounded-3xl border-default shadow-sm" variant="soft">
      <div class="space-y-6">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Resumen del tour</p>
          <p class="mt-3 text-4xl font-bold tracking-tight">{{ formattedPrice }}</p>
          <p class="mt-2 text-sm leading-6 text-muted">
            Tour programado para <span class="font-medium text-primary">{{ formattedDate }}</span> en
            <span class="font-medium text-secondary">{{ location }}</span>.
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
      </div>
    </UCard>

    <TourDetailPackagesCard
      :packages="packages"
      :package-count="packageCount"
    />

    <TourDetailDeparturePointsCard
      :departure-points="departurePoints"
      :departure-count="departureCount"
    />
  </aside>
</template>
