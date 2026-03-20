<script setup lang="ts">
import type { TourFormState } from '~~/types/tour'

defineProps<{
  packages: TourFormState['packages']
}>()

defineEmits<{
  addPackage: []
  removePackage: [index: number]
  addBenefit: [packageIndex: number]
  removeBenefit: [packageIndex: number, benefitIndex: number]
}>()
</script>

<template>
  <UCard class="col-span-2">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold">Paquetes</h3>
      <UButton type="button" size="sm" variant="soft" @click="$emit('addPackage')">Agregar paquete</UButton>
    </div>

    <UPageList as="ul" divide class="mt-4">
      <li
        v-for="(pkg, packageIndex) in packages"
        :key="`package-${packageIndex}`"
        class="list-none py-4 first:pt-0 last:pb-0"
      >
        <div class="space-y-3">
          <div class="flex justify-between gap-3">
            <p class="text-sm font-medium text-muted">Paquete {{ packageIndex + 1 }}</p>
            <UButton
              type="button"
              size="xs"
              color="error"
              variant="ghost"
              @click="$emit('removePackage', packageIndex)"
            >
              Eliminar
            </UButton>
          </div>
          <div class="grid gap-2 md:grid-cols-2">
            <UFormField name="Nombre del paquete" label="Nombre del paquete">
              <UInput v-model="pkg.name" placeholder="Bronce" />
            </UFormField>
            <UFormField name="Precio del paquete" label="Precio del paquete">
              <UInput v-model.number="pkg.price" type="number" min="0" step="0.01" placeholder="Precio" />
            </UFormField>
            <UFormField name="Descripción del paquete" label="Descripción del paquete" class="col-span-2">
              <UTextarea v-model="pkg.description" class="w-full" :rows="2" placeholder="Descripción del paquete" />
            </UFormField>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-xs font-medium">Beneficios</p>
              <UButton type="button" size="xs" variant="soft" @click="$emit('addBenefit', packageIndex)">
                Agregar beneficio
              </UButton>
            </div>
            <div
              v-for="(_benefit, benefitIndex) in pkg.benefits"
              :key="`benefit-${packageIndex}-${benefitIndex}`"
              class="flex gap-2"
            >
              <UFormField :name="`Beneficio ${benefitIndex + 1}`" :label="`Beneficio ${benefitIndex + 1}`" class="flex-1">
                <UInput v-model="pkg.benefits[benefitIndex]" placeholder="Beneficio" />
              </UFormField>
              <UButton
                type="button"
                size="xs"
                color="error"
                variant="ghost"
                @click="$emit('removeBenefit', packageIndex, benefitIndex)"
              >
                Eliminar
              </UButton>
            </div>
          </div>
        </div>
      </li>
    </UPageList>
  </UCard>
</template>
