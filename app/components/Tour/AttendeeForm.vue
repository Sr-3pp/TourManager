<script setup lang="ts">
import type { Tour, TourAttendee } from '~~/types/tour'
import { toEditableTourState } from '~~/app/utils/tour-form'

const props = defineProps<{
  tour: Tour
  tourId: string
}>()

const { saveTour, isSaving, errorMessage } = useTour()

const emit = defineEmits<{
  saved: []
  cancel: []
}>()

const draft = reactive<TourAttendee>({
  name: '',
  email: '',
  social: {
    instagram: '',
    x: '',
    tiktok: '',
  },
})

function resetDraft() {
  draft.name = ''
  draft.email = ''
  draft.social.instagram = ''
  draft.social.x = ''
  draft.social.tiktok = ''
}

async function submit() {
  if (!draft.name.trim() || !draft.email.trim()) {
    return
  }

  const form = toEditableTourState(props.tour)
  form.attendees.push({
    name: draft.name.trim(),
    email: draft.email.trim(),
    social: {
      instagram: draft.social.instagram.trim(),
      x: draft.social.x.trim(),
      tiktok: draft.social.tiktok.trim(),
    },
  })

  const ok = await saveTour(form, undefined, { id: props.tourId })

  if (ok) {
    resetDraft()
    emit('saved')
  }
}

defineExpose({
  resetDraft,
})
</script>

<template>
  <div class="space-y-4">
    <UAlert
      v-if="errorMessage"
      color="error"
      icon="i-lucide-alert-circle"
      :title="errorMessage"
    />
    <UFormField name="name" label="Nombre">
      <UInput v-model="draft.name" placeholder="Nombre del asistente" />
    </UFormField>
    <UFormField name="email" label="Correo">
      <UInput v-model="draft.email" type="email" placeholder="correo@ejemplo.com" />
    </UFormField>
    <div class="grid gap-3 md:grid-cols-3">
      <UFormField name="instagram" label="Instagram">
        <UInput v-model="draft.social.instagram" placeholder="@usuario" />
      </UFormField>
      <UFormField name="x" label="X">
        <UInput v-model="draft.social.x" placeholder="@usuario" />
      </UFormField>
      <UFormField name="tiktok" label="TikTok">
        <UInput v-model="draft.social.tiktok" placeholder="@usuario" />
      </UFormField>
    </div>
    <div class="flex justify-end gap-3">
      <UButton color="neutral" variant="soft" @click="emit('cancel')">Cancelar</UButton>
      <UButton :loading="isSaving" @click="submit">Guardar asistente</UButton>
    </div>
  </div>
</template>
