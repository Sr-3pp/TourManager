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
    <UCard class="h-full rounded-xl" :ui="{
        root: 'flex flex-col',
        header: 'p-0 sm:px-0',
        body: 'p-4 sm:p-6 flex-grow',
    }">
        <template #header>
            <figure class="overflow-hidden rounded-t-2xl relative">
                <NuxtImg v-if="tour.image" :src="`/blob/${tour.image}`" alt="Imagen del tour" class="h-48 w-full object-cover" />
                <div
                    v-else
                    class="flex h-48 w-full items-center justify-center bg-gradient-to-br from-primary via-secondary to-primary text-inverted"
                >
                    <div class="text-center">
                        <p class="text-xs uppercase tracking-[0.28em] text-inverted/70">Tour en vivo</p>
                        <p class="mt-2 text-lg font-semibold">{{ tour.name }}</p>
                    </div>
                </div>
                <figcaption class="absolute bottom-0 left-0 w-full h-full p-4 z-10 flex items-end bg-gradient-to-t from-black/80 to-transparent text-inverted">
                    <div class="flex flex-wrap gap-2">
                        <UBadge color="secondary" variant="soft" class="font-bold">{{ formattedDate }}</UBadge>
                        <UBadge color="primary" variant="soft" class="font-bold">{{ formattedPrice }}</UBadge>
                    </div>
                </figcaption>
            </figure>
        </template>

        <div class="flex h-full flex-col gap-4">
            <div>
                <h2 class="text-2xl font-bold tracking-tight">{{ tour.name }}</h2>
                <p class="mt-3 line-clamp-3 text-sm leading-6 text-muted">
                    {{ tour.description || 'Se están preparando los detalles del tour. Revisa la página completa para ver las últimas actualizaciones de ruta, horarios y organizador.' }}
                </p>
            </div>

            <div class="flex justify-between text-muted sm:grid-cols-2 mt-auto">
                <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-map-pinned" class="text-base text-primary" />
                    <span class="text-xs">{{ tour.location || 'Ubicación por confirmar' }}</span>
                </div>
                <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-user-round" class="text-base text-primary" />
                    <span class="text-xs">{{ organizerName }}</span>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex items-center justify-between gap-4">
                <UButton :to="`/tour/${tour._id}`" color="primary" variant="soft" class="mx-auto flex-shrink-0 justify-center">
                    Ver detalles
                </UButton>
            </div>
        </template>
    </UCard>
</template>
