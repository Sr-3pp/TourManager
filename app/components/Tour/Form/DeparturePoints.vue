<script setup lang="ts">
import type { TourFormState } from '~~/types/tour'

defineProps<{
  departurePoints: TourFormState['departure_points']
}>()

defineEmits<{
  addDeparturePoint: []
  removeDeparturePoint: [index: number]
}>()
</script>

<template>
  <UCard class="col-span-2">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold">Puntos de salida</h3>
      <UButton type="button" size="sm" variant="soft" @click="$emit('addDeparturePoint')">Agregar salida</UButton>
    </div>

    <UPageList as="ul" divide class="mt-4">
      <li
        v-for="(point, pointIndex) in departurePoints"
        :key="`departure-${pointIndex}`"
        class="list-none py-4 first:pt-0 last:pb-0"
      >
        <div class="space-y-3">
          <div class="flex justify-between gap-3">
            <p class="text-sm font-medium text-muted">Salida {{ pointIndex + 1 }}</p>
            <UButton
              type="button"
              size="xs"
              color="error"
              variant="ghost"
              @click="$emit('removeDeparturePoint', pointIndex)"
            >
              Eliminar
            </UButton>
          </div>
          <div class="grid gap-2 md:grid-cols-2">
            <UFormField name="Nombre del punto de salida" label="Nombre del punto de salida">
              <UInput v-model="point.name" placeholder="Nombre de la salida" />
            </UFormField>
            <UFormField name="Ubicación del punto de salida" label="Ubicación del punto de salida">
              <UInput v-model="point.location" placeholder="Ubicación de la salida" />
            </UFormField>
          </div>
          <UFormField name="Fecha y hora del punto de salida" label="Fecha y hora del punto de salida">
            <UInput v-model="point.dateTime" class="w-full" type="datetime-local" />
          </UFormField>
          <UFormField name="Notas del punto de salida" label="Notas del punto de salida">
            <UTextarea v-model="point.notes" class="w-full" :rows="2" placeholder="Notas" />
          </UFormField>
        </div>
      </li>
    </UPageList>
  </UCard>
</template>
