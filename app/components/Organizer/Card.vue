<script setup lang="ts">
import type { FeaturedOrganizer } from '~~/types/profile';

defineProps<{
  organizer: FeaturedOrganizer
}>()

function getOrganizerSocialLinksCount(social?: Record<string, string>) {
  return Object.values(social ?? {}).filter(Boolean).length
}
</script>

<template>
<UCard :ui="{ 
            root: 'h-full flex flex-col',
            header: 'p-0 sm:px-0',
            body: 'pt-0 sm:pt-0 flex flex-col gap-4 flex-grow', 
          }">
            <template #header>
              <figure>
                <NuxtImg 
                  :src="organizer.profile.banner ? `/blob/${organizer.profile.banner}` || 'https://picsum.photos/800/300?random=1' : 'https://picsum.photos/800/300?random=1'"
                  :alt="`${organizer.user.name || 'Organizador'} banner`"
                  class="h-44 w-full object-cover"
                />
              </figure>
            </template>
            <template #default>
              <figure class="flex h-18 w-18 items-center justify-center overflow-hidden rounded-3xl bg-muted relative z-10 -mt-8 border-2 border-muted">
                  <NuxtImg
                    v-if="organizer.profile.picture"
                    :src="`/blob/${organizer.profile.picture}`"
                    :alt="`${organizer.user.name || 'Organizador'} foto`"
                    class="h-full w-full object-cover"
                  />
                  <UIcon v-else name="i-lucide-user-round" class="text-3xl text-muted" />
              </figure>
              <div class="-mt-8 text-right pl-20">
                <h3 class="truncate text-3xl font-semibold">{{ organizer.user.name || 'Organizador' }}</h3>
                <p v-if="organizer.user.username" class="mt-1 text-sm text-muted">@{{ organizer.user.username }}</p>
              </div>
              <div class="flex flex-col gap-4">
                <p class="max-w-3xl text-sm leading-6 text-muted">
                  {{ organizer.profile.bio || 'Este organizador aseguró un espacio en la portada y aparecerá aquí mientras su perfil público sigue tomando forma.' }}
                </p>
              </div>
              <div class="space-y-3 mt-auto" v-if="getOrganizerSocialLinksCount(organizer.profile.social) > 0">
                <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  Redes sociales
                </p>
                <SocialNetworks
                  :social-networks="organizer.profile.social"
                  only-icons
                />
              </div>
            </template>
            <template #footer>
              <div class="flex">
                <UButton :to="`/organizer/${organizer.user.username || organizer.user.id}`" color="primary" class="mx-auto">
                  Ver perfil
                </UButton>
              </div>
            </template>
          </UCard>
</template>