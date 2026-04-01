<script setup lang="ts">
import type { Profile, ProfileUser } from '~~/types/profile'
import type { Tour } from '~~/types/tour'

const props = defineProps<{
  user: ProfileUser
  profile: Profile | null
  tours: Tour[]
  toursTitle?: string
}>()

const socialNetworks = computed(() => props.profile?.social ?? null)
</script>

<template>
  <section class="relative overflow-hidden bg-default">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute left-0 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div class="absolute right-0 top-16 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
    </div>

    <UContainer class="relative space-y-8 py-8 sm:py-10 lg:py-12">
      <div class="overflow-hidden rounded-[2rem] border border-default bg-default shadow-sm">
        <div
          v-if="profile?.banner"
          class="h-44 w-full bg-cover bg-center sm:h-56 lg:h-64"
          :style="{ backgroundImage: `linear-gradient(180deg, transparent, rgba(0,0,0,0.12)), url(/blob/${profile.banner})` }"
        />
        <div
          v-else
          class="flex h-44 items-end justify-end flex-col bg-gradient-to-br from-primary via-secondary to-primary p-6 text-inverted sm:h-56 lg:h-64"
        >
          <p class="text-xs uppercase tracking-[0.3em] text-inverted/80">Perfil del organizador</p>
          <h1 class="mt-3 text-3xl font-bold sm:text-4xl">{{ user?.name || 'Perfil' }}</h1>
        </div>

        <div class="px-5 pb-6 pt-5 sm:px-8 sm:pb-8">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div class="flex items-end gap-4">
              <div
                class="-mt-16 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-default bg-muted shadow-sm sm:-mt-20 sm:h-32 sm:w-32"
              >
                <NuxtImg
                  v-if="profile?.picture"
                  :src="`/blob/${profile.picture}`"
                  :alt="`${user?.name || 'Perfil'} foto`"
                  class="h-full w-full object-cover"
                />
                <UIcon v-else name="i-lucide-user-round" class="text-4xl text-muted" />
              </div>

              <div class="min-w-0">
                <h2 class="truncate text-3xl font-bold tracking-tight sm:text-4xl">{{ user?.name || 'Perfil' }}</h2>
                <p v-if="user?.username" class="mt-2 text-sm font-medium text-primary">@{{ user?.username }}</p>
                <p v-else class="mt-2 text-sm text-muted">Perfil público del organizador</p>
              </div>
            </div>

            <div class="flex flex-wrap gap-3">
              <slot name="actions" />
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_360px]">
        <UCard class="rounded-3xl" variant="soft">
          <div class="space-y-4">
            <div>
              <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Acerca de</p>
              <h3 class="mt-2 text-2xl font-semibold">Resumen del perfil</h3>
            </div>

            <p class="max-w-3xl text-base leading-7 text-muted">
              {{ profile?.bio || 'Este organizador aún no ha agregado una biografía pública.' }}
            </p>
          </div>
        </UCard>

        <UCard class="rounded-3xl" variant="soft">
          <div class="space-y-4">
            <div>
              <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Social</p>
              <h3 class="mt-2 text-2xl font-semibold">Mantente conectado</h3>
            </div>

            <SocialNetworks v-if="socialNetworks" :social-networks="socialNetworks" />
            <div v-else class="rounded-2xl border border-dashed border-default p-5 text-sm text-muted">
              Aún no se han agregado enlaces sociales.
            </div>
          </div>
        </UCard>
      </div>

      <div class="space-y-4">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Tours</p>
            <h3 class="text-2xl font-semibold">{{ toursTitle || 'Tours publicados' }}</h3>
          </div>
          <UBadge color="secondary" variant="soft">{{ tours.length }} en total</UBadge>
        </div>

        <UCarousel
          v-if="tours.length"
          :items="tours"
          arrows
          dots
          loop
          class="pb-10"
          :ui="{
            container: 'p-4',
            item: 'basis-full md:basis-1/2 xl:basis-1/3',
            prev: 'start-4 top-1/2',
            next: 'end-4 top-1/2',
            dots: 'relative inset-auto justify-center pt-4'
          }"
        >
          <template #default="{ item: tour }">
            <TourCard :tour="tour" />
          </template>
        </UCarousel>
        <UCard v-else class="rounded-3xl border-dashed" variant="soft">
          <p class="text-sm text-muted">Aún no se han publicado tours.</p>
        </UCard>
      </div>
    </UContainer>
  </section>
</template>
