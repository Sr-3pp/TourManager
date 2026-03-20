<script setup lang="ts">
import type { TourPackage } from '~~/types/tour'
import { formatTourPrice } from '~~/app/utils/tour'

defineProps<{
  packages: TourPackage[]
  packageCount: number
}>()
</script>

<template>
  <UCard class="rounded-3xl">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-sm font-medium uppercase tracking-[0.18em] text-primary">Paquetes</p>
        <h2 class="mt-2 text-2xl font-semibold">Qué incluye</h2>
      </div>
      <UBadge color="neutral" variant="soft">{{ packageCount }} opciones</UBadge>
    </div>

    <div v-if="packages.length" class="mt-6 space-y-4">
      <div
        v-for="pkg in packages"
        :key="`${pkg.level}-${pkg.name}`"
        class="rounded-2xl border border-default p-4"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-lg font-semibold">{{ pkg.name }}</p>
            <p class="text-sm text-muted">{{ pkg.description }}</p>
          </div>
          <UBadge color="primary" variant="soft">
            {{ formatTourPrice(pkg.price) }}
          </UBadge>
        </div>

        <ul v-if="pkg.benefits?.length" class="mt-4 space-y-2 text-sm text-muted">
          <li v-for="benefit in pkg.benefits" :key="benefit" class="flex items-start gap-2">
            <UIcon name="i-lucide-check" class="mt-0.5 text-base text-primary" />
            <span>{{ benefit }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div v-else class="mt-6 rounded-2xl border border-dashed border-default p-5 text-sm text-muted">
      Los detalles de los paquetes aún no se han publicado.
    </div>
  </UCard>
</template>
