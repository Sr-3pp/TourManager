<script setup lang="ts">
import type { ProfileSocial } from '~~/types/profile'

definePageMeta({
    middleware: ['auth'],
})

const { session } = useAuth()

const { profile, loadProfile } = useProfile()

await loadProfile()

const profileModal = ref(false)
const tourModal = ref(false)
</script>

<template>
    <div class="p-4">
        <ProfileHeader :user="session?.user" :profile="profile" />
        <UButton @click="profileModal = true" class="mb-4">Edit Profile</UButton>
        <UButton @click="tourModal = true" class="mb-4">Create Tour</UButton>
        <SocialNetworks :social-networks="(profile?.social as ProfileSocial)" />

        <UModal v-model:open="profileModal" title="Edit Profile">
            <template #body>
                <ProfileForm />
            </template>
        </UModal>

        <UModal v-model:open="tourModal" title="Create Tour">
            <template #body>
                <TourForm @saved="tourModal = false" />
            </template>
        </UModal>
    </div>
</template>