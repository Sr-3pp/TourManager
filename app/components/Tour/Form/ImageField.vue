<script setup lang="ts">
const imageFile = defineModel<File | null>({ default: null })

defineProps<{
  currentImageUrl?: string
  imagePreviewUrl?: string | null
}>()
</script>

<template>
  <UFormField name="image" label="Imagen del tour (máx. 10 MB)" class="col-span-2">
    <UFileUpload
      v-model="imageFile"
      class="w-full"
      accept="image/*"
      :preview="false"
      label="Selecciona una imagen"
      description="PNG, JPG o WEBP de hasta 10 MB"
    />
    <div class="mt-2">
      <img
        v-if="imagePreviewUrl"
        :src="imagePreviewUrl"
        alt="Vista previa de la nueva imagen del tour"
        class="h-24 w-full rounded-md border object-cover"
      >
      <img
        v-else-if="currentImageUrl"
        :src="currentImageUrl"
        alt="Imagen actual del tour"
        class="h-24 w-full rounded-md border object-cover"
      >
    </div>
  </UFormField>
</template>
