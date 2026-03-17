<script setup lang="ts">
import type { SocialNetworkKey, SocialNetworks } from '~~/types/social'

const props = defineProps<{
    socialNetworks: SocialNetworks
}>()

const iconMap: Record<SocialNetworkKey, { icon: string; urlPrefix: string }> = {
    whatsapp: {
        icon: 'i-simple-icons-whatsapp',
         urlPrefix: 'https://wa.me/',
    },
    instagram: {
        icon: 'i-simple-icons-instagram',
        urlPrefix: 'https://www.instagram.com/',
    },
    x: {
        icon: 'i-simple-icons-x',
        urlPrefix: 'https://x.com/',
    },
    tiktok: {
        icon: 'i-simple-icons-tiktok',
        urlPrefix: 'https://www.tiktok.com/@',
    }
}

const visibleNetworks = computed(() =>
    Object.entries(props.socialNetworks).filter(([, value]) => Boolean(value)) as Array<[SocialNetworkKey, string]>,
)
</script>

<template>
    <div>
        <ul class="flex flex-wrap gap-3">
            <li v-for="[network, url] in visibleNetworks" :key="network">
                <NuxtLink
                    :to="iconMap[network].urlPrefix + url"
                    target="_blank"
                    class="inline-flex items-center gap-2 rounded-full border border-default bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary transition hover:bg-secondary/15"
                >
                    <UIcon :name="iconMap[network].icon" class="text-base" />
                    <span class="capitalize">{{ network }}</span>
                </NuxtLink>
            </li>
        </ul>
    </div>
</template>
