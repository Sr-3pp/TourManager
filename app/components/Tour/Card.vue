<script setup lang="ts">
import { formatTourDate, formatTourPrice, getTourOrganizerName } from '~~/app/utils/tour'
import type { Tour } from '~~/types/tour';

const props = defineProps<{
    tour: Tour
}>()

const formattedDate = computed(() => {
    return formatTourDate(props.tour.date)
})

const formattedPrice = computed(() => {
    return formatTourPrice(props.tour.price)
})

const organizerName = computed(() => {
    return getTourOrganizerName(props.tour)
})
</script>

<template>
    <UCard class="h-full rounded-3xl">
        <template #header>
            <figure class="overflow-hidden rounded-2xl">
                <NuxtImg v-if="tour.image" :src="`/blob/${tour.image}`" alt="Tour Image" class="h-48 w-full object-cover" />
                <div
                    v-else
                    class="flex h-48 w-full items-center justify-center bg-gradient-to-br from-primary via-secondary to-primary text-inverted"
                >
                    <div class="text-center">
                        <p class="text-xs uppercase tracking-[0.28em] text-inverted/70">Live Tour</p>
                        <p class="mt-2 text-lg font-semibold">{{ tour.name }}</p>
                    </div>
                </div>
            </figure>
        </template>

        <div class="flex h-full flex-col gap-4">
            <div class="flex flex-wrap gap-2">
                <UBadge color="secondary" variant="soft">{{ formattedDate }}</UBadge>
                <UBadge color="primary" variant="soft">{{ formattedPrice }}</UBadge>
            </div>

            <div>
                <h2 class="text-2xl font-bold tracking-tight">{{ tour.name }}</h2>
                <p class="mt-3 line-clamp-3 text-sm leading-6 text-muted">
                    {{ tour.description || 'Tour details are being prepared. Check the full page for the latest route, timing, and host updates.' }}
                </p>
            </div>

            <div class="grid gap-3 text-sm text-muted sm:grid-cols-2">
                <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-map-pinned" class="text-base text-primary" />
                    <span>{{ tour.location || 'Location to be announced' }}</span>
                </div>
                <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-user-round" class="text-base text-primary" />
                    <span>{{ organizerName }}</span>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex items-center justify-between gap-4">
                <span class="text-sm text-muted">Spots and route details available on the full page.</span>
                <UButton :to="`/tour/${tour._id}`" color="primary" variant="soft">
                    View details
                </UButton>
            </div>
        </template>
    </UCard>
</template>
