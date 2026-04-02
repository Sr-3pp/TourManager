<script setup lang="ts">
import type { TourFormState } from '~~/types/tour'
import { formatDateInputValue, parseDateInputValue } from '~~/app/utils/date-input'

defineProps<{
  draft: TourFormState
}>()
</script>

<template>
  <UCard class="h-full">
    <div class="space-y-5">
      <FormSectionHeader
        title="Detalles del tour"
        description="Completa la información principal que verán los viajeros."
        badge="General"
        badge-color="primary"
      />

      <div class="grid gap-4 md:grid-cols-2">
        <UFormField name="name" label="Nombre del tour" class="md:col-span-2">
          <UInput v-model="draft.name" class="w-full" placeholder="Aventura increíble por los Andes" />
        </UFormField>

        <UFormField name="location" label="Ubicación">
          <UInput v-model="draft.location" class="w-full" placeholder="Cusco, Peru" />
        </UFormField>

        <UFormField name="date" label="Fecha del tour">
          <UInputDate
            :model-value="parseDateInputValue(draft.date)"
            class="w-full"
            color="neutral"
            granularity="minute"
            :hour-cycle="24"
            icon="i-lucide-calendar-days"
            :fixed="true"
            @update:model-value="(value) => draft.date = formatDateInputValue(value)"
          />
        </UFormField>

        <UFormField name="price" label="Precio del tour">
          <UInput
            v-model.number="draft.price"
            class="w-full"
            type="number"
            min="0"
            step="0.01"
            placeholder="Precio"
          />
        </UFormField>

        <UFormField name="description" label="Descripción" class="md:col-span-2">
          <UTextarea v-model="draft.description" class="w-full" :rows="6" placeholder="Describe la experiencia..." />
        </UFormField>
      </div>
    </div>
  </UCard>
</template>
