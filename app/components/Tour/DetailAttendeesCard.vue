<script setup lang="ts">
import type { TourAttendee } from '~~/types/tour'

defineProps<{
  attendees: TourAttendee[]
  attendeeCount: number
  isOwner?: boolean
}>()

defineEmits<{
  add: []
  remove: [index: number]
}>()
</script>

<template>
  <UCard class="rounded-3xl">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Asistentes</p>
        <h2 class="mt-2 text-2xl font-semibold">Quiénes vienen</h2>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          v-if="isOwner"
          size="sm"
          variant="soft"
          icon="i-lucide-plus"
          @click="$emit('add')"
        >
          Agregar
        </UButton>
        <UBadge color="neutral" variant="soft">{{ attendeeCount }}</UBadge>
      </div>
    </div>

    <div v-if="attendees.length" class="mt-6 space-y-3">
      <div
        v-for="(attendee, attendeeIndex) in attendees"
        :key="`${attendee.email}-${attendeeIndex}`"
        class="flex items-start justify-between gap-4 rounded-2xl border border-default p-4"
      >
        <div class="min-w-0">
          <p class="font-medium">{{ attendee.name }}</p>
          <p class="text-sm text-muted">{{ attendee.email }}</p>
        </div>
        <div class="flex items-start gap-3">
          <div class="flex gap-2 text-muted">
            <UIcon v-if="attendee.social?.instagram" name="i-simple-icons-instagram" />
            <UIcon v-if="attendee.social?.x" name="i-simple-icons-x" />
            <UIcon v-if="attendee.social?.tiktok" name="i-simple-icons-tiktok" />
          </div>
          <UButton
            v-if="isOwner"
            size="xs"
            color="error"
            variant="ghost"
            icon="i-lucide-trash"
            @click="$emit('remove', attendeeIndex)"
          >
            Quitar
          </UButton>
        </div>
      </div>
    </div>

    <div v-else class="mt-6 rounded-2xl border border-dashed border-default p-5 text-sm text-muted">
      Aún no se han agregado asistentes.
    </div>
  </UCard>
</template>
