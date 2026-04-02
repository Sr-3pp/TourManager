<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  badge?: string
  badgeColor?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
}>(), {
  description: undefined,
  badge: undefined,
  badgeColor: 'neutral',
})
</script>

<template>
  <div class="flex items-start justify-between gap-3">
    <div>
      <h3 class="text-sm font-semibold text-highlighted">{{ title }}</h3>
      <p v-if="description" class="mt-1 text-sm text-muted">{{ description }}</p>
    </div>

    <div v-if="badge || $slots.meta" class="flex shrink-0 items-center gap-2">
      <slot name="meta">
        <UBadge v-if="badge" :color="badgeColor" variant="soft">
          {{ badge }}
        </UBadge>
      </slot>
    </div>
  </div>
</template>