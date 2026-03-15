<script setup lang="ts">
defineProps<{
    socialNetworks: {
        whatsapp?: string
        instagram?: string
        x?: string
        tiktok?: string
    }
}>()

const iconMap = {
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
</script>

<template>
    <div>
        <h2 class="text-xl font-bold mb-4">Social Networks</h2>
        <ul class="flex gap-2">
            <li v-for="(url, network) in socialNetworks" :key="network">
                <NuxtLink :to="iconMap[network].urlPrefix + url" target="_blank">
                    <UIcon :name="iconMap[network].icon" class="text-2xl" />
                </NuxtLink>
            </li>
        </ul>
    </div>
</template>