<script setup lang="ts">
const { state, closeConfirmation, confirmAction } = useConfirmation()
</script>

<template>
  <UModal :open="state.open" :title="state.title" @update:open="(open) => !open && closeConfirmation()">
    <template #body>
      <div class="space-y-4">
        <UAlert
          :color="state.color"
          variant="soft"
          :icon="state.icon"
          :title="state.title"
          :description="state.description"
        />

        <p v-if="state.error" class="text-sm text-error">
          {{ state.error }}
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton
          variant="ghost"
          :disabled="state.loading"
          @click="closeConfirmation"
        >
          {{ state.cancelLabel }}
        </UButton>
        <UButton
          :color="state.color"
          :loading="state.loading"
          icon="i-lucide-check"
          @click="confirmAction"
        >
          {{ state.confirmLabel }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
