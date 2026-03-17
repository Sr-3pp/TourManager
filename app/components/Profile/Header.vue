<script setup lang="ts">
import type { Profile, ProfileUser } from '~~/types/profile'

defineProps<{
    user: ProfileUser | null
    profile: Profile | null
}>()
</script>

<template>
<section>
    <figure v-if="profile?.banner" class="w-full">
    <NuxtImg class="w-full object-cover h-100" :src="`/blob/${profile.banner}`" alt="Banner del perfil del organizador" />
</figure>
<UContainer>
    <div class="flex w-full justify-between">
        <div class="w-full flex justify-between items-center py-6">
            <h1 class="text-2xl font-bold mb-4">
                {{ user?.name }} <br>
                <small>{{ user?.slug }}</small>
            </h1>
        </div>
        <figure class="flex-shrink-0 h-32 w-32 rounded-full border object-cover -mt-16 overflow-hidden mb-4" v-if="profile?.picture">
            <NuxtImg
                :src="`/blob/${profile.picture}`"
                alt="Foto de perfil del organizador"
            />
        </figure>
    </div>
    <p class="text-muted">
        {{ profile?.bio }}
    </p>
</UContainer>
</section>
</template>
