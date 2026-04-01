<script setup lang="ts">
import type { TourFormState } from '~~/types/tour'
import { formatDateInputValue, parseDateInputValue } from '~~/app/utils/date-input'

const departurePoints = defineModel<TourFormState['departure_points']>({ default: () => [] })

function addDeparturePoint() {
  departurePoints.value.push({
    name: '',
    location: '',
    dateTime: '',
    notes: '',
  })
}

function removeDeparturePoint(index: number) {
  departurePoints.value.splice(index, 1)
}
</script>

<template>
  <UCard class="h-full">
    <div class="space-y-5">
      <FormSectionHeader
        title="Puntos de salida"
        description="Agrega horarios y lugares desde donde parte el tour."
      >
        <template #meta>
          <UBadge color="neutral" variant="soft">{{ departurePoints.length }} salidas</UBadge>
        </template>
      </FormSectionHeader>

      <UButton type="button" size="sm" variant="soft" icon="i-lucide-plus" @click="addDeparturePoint">
        Agregar salida
      </UButton>

      <div v-if="!departurePoints.length" class="rounded-lg border border-dashed border-default px-4 py-8 text-center text-sm text-muted">
        Todavía no hay puntos de salida. Agrega al menos uno para indicar la logística del recorrido.
      </div>

      <div v-else class="space-y-4">
        <UCard
          v-for="(point, pointIndex) in departurePoints"
          :key="`departure-${pointIndex}`"
          variant="subtle"
        >
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-2">
                <UBadge color="secondary" variant="soft">Salida {{ pointIndex + 1 }}</UBadge>
                <p class="text-sm font-medium text-highlighted">{{ point.name || 'Nueva salida' }}</p>
              </div>
              <UButton
                type="button"
                size="xs"
                color="error"
                variant="ghost"
                icon="i-lucide-trash-2"
                @click="removeDeparturePoint(pointIndex)"
              >
                Eliminar
              </UButton>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <UFormField :name="`departure-name-${pointIndex}`" label="Nombre del punto de salida">
                <UInput v-model="point.name" placeholder="Terminal principal" />
              </UFormField>

              <UFormField :name="`departure-location-${pointIndex}`" label="Ubicación">
                <UInput v-model="point.location" placeholder="Plaza de Armas, Cusco" />
              </UFormField>

              <UFormField :name="`departure-datetime-${pointIndex}`" label="Fecha y hora" class="md:col-span-2">
                <UInputDate
                  :model-value="parseDateInputValue(point.dateTime)"
                  class="w-full"
                  color="neutral"
                  granularity="minute"
                  :hour-cycle="24"
                  icon="i-lucide-calendar-days"
                  :fixed="true"
                  @update:model-value="(value) => point.dateTime = formatDateInputValue(value)"
                />
              </UFormField>

              <UFormField :name="`departure-notes-${pointIndex}`" label="Notas" class="md:col-span-2">
                <UTextarea v-model="point.notes" class="w-full" :rows="3" placeholder="Indicaciones adicionales para los viajeros" />
              </UFormField>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UCard>
</template>
