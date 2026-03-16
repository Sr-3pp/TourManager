<script setup lang="ts">
import type { Tour } from '~~/types/tour';

defineProps<{
    tour: Tour
}>()
</script>

<template>
    <UCard>
        <template #header>
            <figure>
                <NuxtImg v-if="tour.image" :src="`/blob/${tour.image}`" alt="Tour Image" class="w-full h-48 object-cover rounded-t-lg" />
            </figure>
        </template>
        <h2 class="text-2xl font-bold mb-4">{{ tour.name }}</h2>
        <p class="text-gray-600">{{ tour.description }}</p>
        <template #footer>
            <NuxtLink :to="`/tour/${tour._id}`" class="text-blue-500 hover:underline">
                View Details
            </NuxtLink>
        </template>
    </UCard>
</template>