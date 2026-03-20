<script setup lang="ts">
defineProps<{
  currentImageUrl?: string
  imagePreviewUrl?: string | null
}>()

defineEmits<{
  change: [event: Event]
}>()
</script>

<template>
  <UFormField name="image" label="Imagen del tour (máx. 10 MB)" class="col-span-2">
    <UInput class="w-full" type="file" accept="image/*" @change="(event) => $emit('change', event)" />
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
