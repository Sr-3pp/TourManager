<script setup lang="ts">
import type { TourPackage, TourSponsor } from '~~/types/tour'

const props = defineProps<{
  sponsors: TourSponsor[]
  packages: TourPackage[]
  sponsorCount: number
  isOwner?: boolean
}>()

defineEmits<{
  add: []
  remove: [index: number]
}>()

function packageLabelByLevel(level: string) {
  const match = props.packages.find(pkg => String(pkg.level) === String(level))
  return match?.name || level
}
</script>

<template>
  <UCard class="rounded-3xl" variant="soft">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Patrocinadores</p>
        <h2 class="mt-2 text-2xl font-semibold">Aliados</h2>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          v-if="isOwner"
          size="sm"
          variant="soft"
          icon="i-lucide-plus"
          @click="$emit('add')"
        >
          Agregar
        </UButton>
        <UBadge color="neutral" variant="soft">{{ sponsorCount }}</UBadge>
      </div>
    </div>

    <div v-if="sponsors.length" class="mt-6 space-y-3">
      <div
        v-for="(sponsor, sponsorIndex) in sponsors"
        :key="`${sponsor.name}-${sponsor.website}-${sponsorIndex}`"
        class="flex items-start justify-between gap-4 rounded-2xl border border-default p-4"
      >
        <div class="flex min-w-0 flex-1 items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="font-medium">{{ sponsor.name }}</p>
            <p class="text-sm text-muted">{{ packageLabelByLevel(sponsor.packageLevel) }}</p>
            <NuxtLink
              v-if="sponsor.website"
              :to="sponsor.website"
              target="_blank"
              class="mt-2 inline-flex text-sm text-primary hover:opacity-80"
            >
              Visitar sitio web
            </NuxtLink>
          </div>
          <UButton
            v-if="isOwner"
            size="xs"
            color="error"
            variant="ghost"
            icon="i-lucide-trash"
            @click="$emit('remove', sponsorIndex)"
          >
            Quitar
          </UButton>
        </div>
        <div v-if="sponsor.logo" class="h-12 w-12 overflow-hidden rounded-xl border border-default">
          <NuxtImg :src="`/blob/${sponsor.logo}`" :alt="`Logotipo de ${sponsor.name}`" class="h-full w-full object-cover" />
        </div>
      </div>
    </div>

    <div v-else class="mt-6 rounded-2xl border border-dashed border-default p-5 text-sm text-muted">
      Aún no se ha agregado la información de patrocinio.
    </div>
  </UCard>
</template>
