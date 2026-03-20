<script setup lang="ts">
import type { Tour, TourSponsor } from '~~/types/tour'
import { toEditableTourState } from '~~/app/utils/tour-form'

const props = defineProps<{
  tour: Tour
  tourId: string
  packageOptions: Array<{ label: string, value: string }>
}>()

const { saveTour, isSaving, errorMessage } = useTour()

const emit = defineEmits<{
  saved: []
  cancel: []
}>()

const draft = reactive<TourSponsor>({
  packageLevel: '',
  name: '',
  logo: null,
  website: '',
  social: {
    instagram: '',
    x: '',
    tiktok: '',
  },
})

function resetDraft() {
  draft.packageLevel = props.packageOptions[0]?.value ?? ''
  draft.name = ''
  draft.logo = null
  draft.website = ''
  draft.social.instagram = ''
  draft.social.x = ''
  draft.social.tiktok = ''
}

watch(
  () => props.packageOptions,
  () => {
    if (!draft.packageLevel) {
      draft.packageLevel = props.packageOptions[0]?.value ?? ''
    }
  },
  { immediate: true },
)

async function submit() {
  if (!draft.name.trim() || !draft.packageLevel) {
    return
  }

  const form = toEditableTourState(props.tour)
  form.sponsors.push({
    packageLevel: draft.packageLevel,
    name: draft.name.trim(),
    logo: null,
    website: draft.website.trim(),
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
      <UInput v-model="draft.name" placeholder="Nombre del patrocinador" />
    </UFormField>
    <UFormField name="packageLevel" label="Paquete">
      <USelect
        v-model="draft.packageLevel"
        :items="props.packageOptions"
        value-key="value"
        placeholder="Selecciona un paquete"
      />
    </UFormField>
    <UFormField name="website" label="Sitio web">
      <UInput v-model="draft.website" placeholder="https://ejemplo.com" />
    </UFormField>
    <div class="grid gap-3 md:grid-cols-3">
      <UFormField name="instagram" label="Instagram">
        <UInput v-model="draft.social.instagram" placeholder="@marca" />
      </UFormField>
      <UFormField name="x" label="X">
        <UInput v-model="draft.social.x" placeholder="@marca" />
      </UFormField>
      <UFormField name="tiktok" label="TikTok">
        <UInput v-model="draft.social.tiktok" placeholder="@marca" />
      </UFormField>
    </div>
    <div class="flex justify-end gap-3">
      <UButton color="neutral" variant="soft" @click="emit('cancel')">Cancelar</UButton>
      <UButton :loading="isSaving" @click="submit">Guardar patrocinador</UButton>
    </div>
  </div>
</template>
