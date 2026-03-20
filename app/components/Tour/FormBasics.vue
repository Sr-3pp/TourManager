<script setup lang="ts">
import type { TourFormState } from '~~/types/tour'

defineProps<{
  draft: TourFormState
}>()
</script>

<template>
  <div class="contents">
    <UFormField name="name" label="Nombre del tour" class="col-span-2 md:col-span-1">
      <UInput v-model="draft.name" class="w-full" placeholder="Aventura increíble por los Andes" />
    </UFormField>

    <UFormField name="location" label="Ubicación" class="col-span-2 md:col-span-1">
      <UInput v-model="draft.location" class="w-full" placeholder="Cusco, Peru" />
    </UFormField>

    <UFormField name="description" label="Descripción" class="col-span-2">
      <UTextarea v-model="draft.description" class="w-full" :rows="4" placeholder="Describe la experiencia..." />
    </UFormField>

    <UFormField name="date" label="Fecha del tour" class="col-span-2 md:col-span-1">
      <UInput v-model="draft.date" class="w-full" type="datetime-local" />
    </UFormField>

    <UFormField name="price" label="Precio del tour" class="col-span-2 md:col-span-1">
      <UInput
        v-model.number="draft.price"
        class="w-full"
        type="number"
        min="0"
        step="0.01"
        placeholder="Precio"
      />
    </UFormField>
  </div>
</template>
