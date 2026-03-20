<script setup lang="ts">
import type { Tour } from '~~/types/tour'

defineProps<{
  tour?: Tour
  isOwner?: boolean
  formattedDate: string
  formattedPrice: string
  attendeeCount: number
  sponsorCount: number
  packageCount: number
  departureCount: number
}>()

defineEmits<{
  edit: []
}>()
</script>

<template>
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
              @click="$emit('edit')"
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
  </div>
</template>
