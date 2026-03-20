<script setup lang="ts">
import type { Tour } from '~~/types/tour'

defineProps<{
  tour?: Tour
  isOwner?: boolean
  organizerName: string
  organizerLink?: string | null
  attendeeCount: number
  sponsorCount: number
}>()

defineEmits<{
  addAttendee: []
  addSponsor: []
  removeAttendee: [index: number]
  removeSponsor: [index: number]
}>()
</script>

<template>
  <div class="space-y-8">
    <TourDetailSummaryCard
      :tour="tour"
      :organizer-name="organizerName"
      :organizer-link="organizerLink"
    />

    <div class="grid gap-6 xl:grid-cols-2">
      <TourDetailAttendeesCard
        :attendees="tour?.attendees ?? []"
        :attendee-count="attendeeCount"
        :is-owner="isOwner"
        @add="$emit('addAttendee')"
        @remove="$emit('removeAttendee', $event)"
      />

      <TourDetailSponsorsCard
        :sponsors="tour?.sponsors ?? []"
        :packages="tour?.packages ?? []"
        :sponsor-count="sponsorCount"
        :is-owner="isOwner"
        @add="$emit('addSponsor')"
        @remove="$emit('removeSponsor', $event)"
      />
    </div>
  </div>
</template>
