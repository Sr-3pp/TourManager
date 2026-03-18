<script setup lang="ts">
import type { Tour, TourAttendee, TourFormState, TourSocial, TourSponsor } from '~~/types/tour'

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

function cloneSocial(social?: Partial<TourSocial> | null): TourSocial {
  return {
    instagram: social?.instagram ?? '',
    x: social?.x ?? '',
    tiktok: social?.tiktok ?? '',
  }
}

function toEditableTourState(source: Tour): TourFormState {
  return {
    name: source.name ?? '',
    description: source.description ?? '',
    location: source.location ?? '',
    date: source.date ? new Date(source.date).toISOString().slice(0, 16) : '',
    price: source.price ?? 0,
    attendees: (source.attendees ?? []).map(attendee => ({
      name: attendee.name ?? '',
      email: attendee.email ?? '',
      social: cloneSocial(attendee.social),
    })),
    sponsors: (source.sponsors ?? []).map((sponsor: TourSponsor) => ({
      packageLevel: sponsor.packageLevel ?? '',
      name: sponsor.name ?? '',
      logo: sponsor.logo ?? null,
      website: sponsor.website ?? '',
      social: cloneSocial(sponsor.social),
    })),
    packages: (source.packages ?? []).map(pkg => ({
      level: Number(pkg.level) || 1,
      name: pkg.name ?? '',
      description: pkg.description ?? '',
      price: Number(pkg.price) || 0,
      benefits: [...(pkg.benefits ?? [])],
    })),
    departure_points: (source.departure_points ?? []).map(point => ({
      name: point.name ?? '',
      location: point.location ?? '',
      dateTime: point?.dateTime ? new Date(point.dateTime).toISOString().slice(0, 16) : '',
      notes: point.notes ?? '',
    })),
  }
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
