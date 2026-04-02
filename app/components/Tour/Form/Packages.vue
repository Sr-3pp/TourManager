<script setup lang="ts">
import type { TourFormState } from '~~/types/tour'

const packages = defineModel<TourFormState['packages']>({ default: () => [] })

function getNextPackageLevel() {
  const levels = packages.value
    .map(pkg => Number(pkg.level))
    .filter(level => Number.isFinite(level) && level >= 1)

  return levels.length ? Math.max(...levels) + 1 : 1
}

function addPackage() {
  packages.value.push({
    level: getNextPackageLevel(),
    name: '',
    description: '',
    price: 0,
    benefits: [],
  })
}

function removePackage(index: number) {
  packages.value.splice(index, 1)
}
</script>

<template>
  <UCard class="h-full">
    <div class="space-y-5">
      <FormSectionHeader
        title="Paquetes"
        description="Define niveles, precio y beneficios sin salir de la misma sección."
      >
        <template #meta>
          <UBadge color="neutral" variant="soft">{{ packages.length }} opciones</UBadge>
        </template>
      </FormSectionHeader>

      <UButton type="button" size="sm" variant="soft" icon="i-lucide-plus" @click="addPackage">
        Agregar paquete
      </UButton>

      <div v-if="!packages.length" class="rounded-lg border border-dashed border-default px-4 py-8 text-center text-sm text-muted">
        Aún no hay paquetes creados. Agrega uno para ofrecer distintos niveles de experiencia.
      </div>

      <div v-else class="space-y-4">
        <UCard
          v-for="(pkg, packageIndex) in packages"
          :key="`package-${packageIndex}`"
          variant="subtle"
        >
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-2">
                <UBadge color="primary" variant="soft">Nivel {{ pkg.level }}</UBadge>
                <p class="text-sm font-medium text-highlighted">Paquete {{ packageIndex + 1 }}</p>
              </div>
              <UButton
                type="button"
                size="xs"
                color="error"
                variant="ghost"
                icon="i-lucide-trash-2"
                @click="removePackage(packageIndex)"
              >
                Eliminar
              </UButton>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <UFormField :name="`package-name-${packageIndex}`" label="Nombre del paquete">
                <UInput v-model="pkg.name" placeholder="Bronce" />
              </UFormField>

              <UFormField :name="`package-price-${packageIndex}`" label="Precio del paquete">
                <UInput v-model.number="pkg.price" type="number" min="0" step="0.01" placeholder="Precio" />
              </UFormField>

              <UFormField :name="`package-description-${packageIndex}`" label="Descripción" class="md:col-span-2">
                <UTextarea v-model="pkg.description" class="w-full" :rows="3" placeholder="Qué incluye este paquete" />
              </UFormField>

              <UFormField :name="`package-benefits-${packageIndex}`" label="Beneficios" class="md:col-span-2">
                <UInputTags
                  v-model="pkg.benefits"
                  class="w-full"
                  placeholder="Escribe un beneficio y presiona Enter"
                />
              </UFormField>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UCard>
</template>
