<script setup lang="ts">
const imageFile = defineModel<File | null>({ default: null })

defineProps<{
  currentImageUrl?: string
  imagePreviewUrl?: string | null
}>()
</script>

<template>
  <UCard class="h-full">
    <div class="space-y-5">
      <FormSectionHeader
        title="Portada del tour"
        description="Sube una imagen clara y horizontal para destacar la experiencia."
      >
        <template #meta>
          <UBadge color="secondary" variant="soft">
            {{ imagePreviewUrl ? 'Nueva imagen' : currentImageUrl ? 'Imagen actual' : 'Sin imagen' }}
          </UBadge>
        </template>
      </FormSectionHeader>

      <UFormField name="image" label="Imagen del tour (máx. 10 MB)">
        <UFileUpload
          v-model="imageFile"
          class="w-full"
          accept="image/*"
          :preview="false"
          label="Selecciona una imagen"
          description="PNG, JPG o WEBP de hasta 10 MB"
          :ui="{ base: 'bg-gradient-to-t from-[var(--ui-bg-elevated)] to-transparent' }"
        />
      </UFormField>

      <USeparator />

      <div class="space-y-2">
        <p class="text-sm font-medium text-highlighted">Vista previa</p>
        <div class="overflow-hidden rounded-lg border border-default bg-muted">
          <img
            v-if="imagePreviewUrl"
            :src="imagePreviewUrl"
            alt="Vista previa de la nueva imagen del tour"
            class="h-48 w-full object-cover"
          >
          <img
            v-else-if="currentImageUrl"
            :src="currentImageUrl"
            alt="Imagen actual del tour"
            class="h-48 w-full object-cover"
          >
          <div
            v-else
            class="flex h-48 items-center justify-center px-4 text-center text-sm text-muted"
          >
            Sube una imagen para ver la vista previa del tour.
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
