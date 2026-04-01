<script setup lang="ts">
definePageMeta({
    middleware: ['auth'],
})

const { session } = useAuth()
const seo = useSeo()

const { profile, loadProfile } = useProfile()
const { organizerTours, getToursByOrganizer } = useTour()

await loadProfile()

const profileModal = ref(false)
const tourModal = ref(false)
const organizerId = computed(() => profile.value?.user ?? '')

watchEffect(() => {
    if (!organizerId.value) {
        return
    }

    getToursByOrganizer(organizerId.value).catch((err) => {
        console.error('Error al cargar tours del organizador:', err)
        return []
    })
})

const tours = computed(() => organizerTours.value[organizerId.value] ?? [])

seo.noIndex()

useSeoMeta({
    title: `Tu perfil | ${seo.siteName.value}`,
    description: 'Administra tu perfil y tus tours en Tour Manager.',
})
</script>

<template>
    <ProfileShowcase :user="session?.user || null" :profile="profile ?? null" :tours="tours || []" tours-title="Tus tours">
        <template #actions>
            <UButton @click="profileModal = true">Editar perfil</UButton>
            <UButton color="secondary" variant="soft" @click="tourModal = true">Crear tour</UButton>
        </template>
    </ProfileShowcase>

    <UDrawer v-model:open="profileModal" title="Editar perfil" description="Actualiza los detalles públicos de tu perfil de organizador." direction="left">
        <template #body>
            <ProfileForm />
        </template>
    </UDrawer>

    <UDrawer v-model:open="tourModal" title="Crear tour" description="Crea o actualiza los detalles de tu tour." direction="bottom">
        <template #body>
            <TourForm @saved="tourModal = false" />
        </template>
    </UDrawer>
</template>
