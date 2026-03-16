<script setup lang="ts">
import type { Tour } from '~~/types/tour';

defineProps<{
    tours: Tour[]
}>()
</script>

<template>
    <UContainer>
        <UPageGrid>
            <template v-for="tour in tours" :key="tour._id">
                <TourCard :tour="tour" />
            </template>
        </UPageGrid>
    </UContainer>
</template>