<script setup lang="ts">
defineProps<{
  formattedDate: string
  formattedPrice: string
  organizerName: string
  packageCount: number
  departureCount: number
  location?: string
}>()
</script>

<template>
  <aside class="lg:sticky lg:top-6">
    <UCard class="rounded-3xl border-default shadow-sm">
      <div class="space-y-6">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Resumen de reserva</p>
          <p class="mt-3 text-4xl font-bold tracking-tight">{{ formattedPrice }}</p>
          <p class="mt-2 text-sm leading-6 text-muted">
            Reserva tu lugar para <span class="font-medium text-primary">{{ formattedDate }}</span> en
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

        <UButton block size="xl">Reservar este tour</UButton>
        <UButton block size="xl" color="neutral" variant="soft">Contactar organizador</UButton>
      </div>
    </UCard>
  </aside>
</template>
