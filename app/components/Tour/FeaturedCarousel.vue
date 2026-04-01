<script setup lang="ts">
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
          <TourCard :tour="tour" />
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
