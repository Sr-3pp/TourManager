<script setup lang="ts">
import { formatTourDate, formatTourPrice, getTourOrganizerName } from '~~/app/utils/tour'
import type { Tour } from '~~/types/tour'

defineProps<{
  tours: Tour[]
}>()
</script>

<template>
  <UCard class="overflow-hidden rounded-[2rem]">
    <div class="space-y-6 p-1">
      <div class="flex flex-col gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
        <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">
          Promociones pagadas de tours
        </p>
        <div class="flex flex-col gap-2">
          <h3 class="text-2xl font-semibold tracking-tight">Tours destacados</h3>
          <p class="text-sm leading-6 text-muted">
            Los tours destacados rotan en este panel después de haberse vendido como espacios en portada.
          </p>
          <div>
            <UBadge color="primary" variant="soft">{{ tours.length }} activos</UBadge>
          </div>
        </div>
      </div>

      <UCarousel
        v-if="tours.length"
        :items="tours"
        arrows
        dots
        loop
        class="px-5 pb-10 sm:px-6 sm:pb-12"
        :ui="{
          item: 'basis-full',
          prev: 'start-6 top-32',
          next: 'end-6 top-32',
          dots: 'relative inset-auto justify-start pt-4'
        }"
      >
        <template #default="{ item: tour }">
          <div class="overflow-hidden rounded-[1.75rem] border border-default bg-default">
            <div class="overflow-hidden">
              <NuxtImg
                v-if="tour.image"
                :src="`/blob/${tour.image}`"
                :alt="tour.name"
                class="h-48 w-full object-cover"
              />
              <div
                v-else
                class="flex h-48 items-end bg-gradient-to-br from-primary via-secondary to-primary p-6 text-inverted"
              >
                <div>
                  <p class="text-xs uppercase tracking-[0.3em] text-inverted/70">Ruta destacada</p>
                  <h3 class="mt-2 text-2xl font-bold">{{ tour.name }}</h3>
                </div>
              </div>
            </div>

            <div class="space-y-4 p-6">
              <div class="flex flex-wrap gap-2">
                <UBadge color="secondary" variant="soft">
                  {{ formatTourDate(tour.date, 'Horario próximamente', { month: 'short', day: 'numeric' }) }}
                </UBadge>
                <UBadge color="primary" variant="soft">{{ formatTourPrice(tour.price) }}</UBadge>
              </div>

              <div>
                <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Tour destacado</p>
                <h3 class="mt-2 text-2xl font-semibold tracking-tight">{{ tour.name }}</h3>
                <p class="mt-3 text-sm leading-6 text-muted">
                  {{ tour.description || 'Este tour se muestra actualmente como una promoción pagada en la portada.' }}
                </p>
              </div>

              <div class="grid gap-3">
                <div class="rounded-2xl bg-muted/40 p-4">
                  <p class="text-xs uppercase tracking-[0.18em] text-muted">Organizador</p>
                  <p class="mt-2 font-semibold">{{ getTourOrganizerName(tour) }}</p>
                </div>
                <div class="rounded-2xl bg-muted/40 p-4">
                  <p class="text-xs uppercase tracking-[0.18em] text-muted">Ubicación</p>
                  <p class="mt-2 font-semibold">{{ tour.location || 'Ubicación pendiente' }}</p>
                </div>
              </div>

              <div class="flex flex-wrap gap-3">
                <UButton v-if="tour._id" :to="`/tour/${tour._id}`" color="primary">
                  Ver tour
                </UButton>
              </div>
            </div>
          </div>
        </template>
      </UCarousel>

      <div v-else class="px-5 pb-5 sm:px-6 sm:pb-6">
        <div class="rounded-3xl border border-dashed border-default p-10 text-center">
          <p class="text-lg font-semibold">Aún no hay tours destacados disponibles.</p>
          <p class="mt-3 text-sm text-muted">
            Marca un tour como destacado después de la compra y aparecerá aquí automáticamente.
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>
