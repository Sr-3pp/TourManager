<script setup lang="ts">
definePageMeta({
    middleware: ['auth'],
})

const { session } = useAuth()

const { profile, loadProfile } = useProfile()
const { getToursByOrganizer } = useTour()

await loadProfile()

const profileModal = ref(false)
const tourModal = ref(false)
const organizerId = computed(() => profile.value?.user ?? '')

const tours = organizerId.value
    ? await getToursByOrganizer(organizerId.value).catch((err) => {
        console.error('Error al cargar tours del organizador:', err)
        return []
    })
    : []
</script>

<template>
    <ProfileShowcase :user="session?.user || null" :profile="profile ?? null" :tours="tours || []" tours-title="Tus tours">
        <template #actions>
            <UButton @click="profileModal = true">Editar perfil</UButton>
            <UButton color="secondary" variant="soft" @click="tourModal = true">Crear tour</UButton>
        </template>
    </ProfileShowcase>

    <UModal v-model:open="profileModal" title="Editar perfil">
        <template #body>
            <ProfileForm />
        </template>
    </UModal>

    <UModal v-model:open="tourModal" title="Crear tour">
        <template #body>
            <TourForm @saved="tourModal = false" />
        </template>
    </UModal>
</template>
