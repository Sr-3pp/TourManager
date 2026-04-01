<script setup lang="ts">
import type { Tour } from '~~/types/tour'

defineProps<{
  tour?: Tour
  organizerName: string
  organizerLink?: string | null
}>()
</script>

<template>
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
</template>
