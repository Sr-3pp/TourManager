<script setup lang="ts">
import type { FeaturedOrganizer } from '~~/types/profile'

defineProps<{
  organizers: FeaturedOrganizer[]
}>()
</script>

<template>
  <UCard class="overflow-hidden rounded-[2rem] lg:col-span-2">
    <div class="space-y-6 p-1">
      <div class="flex flex-col gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
        <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">
          Promociones pagadas de organizadores
        </p>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 class="text-2xl font-semibold tracking-tight">Organizadores destacados</h3>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Aquí solo se muestran los organizadores marcados como destacados después del pago.
            </p>
          </div>
          <UBadge color="secondary" variant="soft">{{ organizers.length }} activos</UBadge>
        </div>
      </div>

      <UCarousel
        v-if="organizers.length"
        :items="organizers"
        arrows
        dots
        loop
        class="px-5 pb-10 sm:px-6 sm:pb-12"
        :ui="{
          container: 'p-2',
          item: 'basis-full lg:basis-1/2 self-stretch',
          prev: 'start-6 top-32 sm:start-8',
          next: 'end-6 top-32 sm:end-8',
          dots: 'relative inset-auto justify-start pt-4'
        }"
      >
        <template #default="{ item: entry }">
          <OrganizerCard :organizer="entry" />
        </template>
      </UCarousel>

      <div v-else class="px-5 pb-5 sm:px-6 sm:pb-6">
        <div class="rounded-3xl border border-dashed border-default p-10 text-center">
          <p class="text-lg font-semibold">Aún no hay organizadores destacados disponibles.</p>
          <p class="mt-3 text-sm text-muted">
            Cuando un organizador haya pagado y un administrador marque su perfil como destacado, aparecerá aquí automáticamente.
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>
