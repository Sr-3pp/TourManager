<script setup lang="ts">
const route = useRoute()
const { session, fetchSession, logoutUser } = useAuth()

await fetchSession()

const user = computed(() => session.value?.user || null)

const navItems = computed(() => {
  const items = [
    {
      label: 'Discover',
      to: '/',
      icon: 'i-lucide-compass',
      visible: true,
    },
    {
      label: 'Users',
      to: '/panel/users',
      icon: 'i-lucide-users',
      visible: Boolean(user.value),
    },
  ]

  return items.filter(item => item.visible)
})

const userMenuItems = computed(() => [
  [
    {
      label: 'Profile',
      icon: 'i-lucide-user-round',
      to: '/profile',
    },
  ],
  [
    {
      label: 'Logout',
      icon: 'i-lucide-log-out',
      color: 'error',
      onSelect: async () => {
        await logoutUser()
        await navigateTo('/auth/login')
      },
    },
  ],
])

function isActive(path: string) {
  if (path === '/') {
    return route.path === '/'
  }

  return route.path.startsWith(path)
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-default/80 bg-default/85 backdrop-blur supports-[backdrop-filter]:bg-default/70">
    <UContainer class="py-3">
      <nav class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center justify-between gap-4">
          <NuxtLink to="/" class="flex min-w-0 items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-inverted shadow-sm">
              <UIcon name="i-lucide-map-pinned" class="text-xl" />
            </div>

            <div class="min-w-0">
              <p class="truncate text-base font-semibold tracking-tight">Tour Manager</p>
              <p class="truncate text-xs uppercase tracking-[0.24em] text-muted">Plan. Publish. Host.</p>
            </div>
          </NuxtLink>

          <div
            class="hidden rounded-full border border-default bg-secondary/10 px-3 py-2 text-xs font-medium text-secondary sm:inline-flex"
          >
            {{ user ? `Signed in as ${user.name}` : 'Guest mode' }}
          </div>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
          <ul class="flex flex-wrap items-center gap-2">
            <li v-for="item in navItems" :key="item.to">
              <NuxtLink
                :to="item.to"
                class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition"
                :class="
                  isActive(item.to)
                    ? 'border-primary/20 bg-primary/10 text-primary'
                    : 'border-default bg-default text-muted hover:border-secondary/30 hover:bg-secondary/10 hover:text-secondary'
                "
              >
                <UIcon :name="item.icon" class="text-base" />
                <span>{{ item.label }}</span>
              </NuxtLink>
            </li>
          </ul>

          <div class="flex items-center gap-2">
            <template v-if="user">
              <UDropdownMenu :items="userMenuItems" :content="{ align: 'end' }">
                <button
                  type="button"
                  class="flex min-w-0 items-center gap-3 rounded-2xl border border-default bg-muted/40 px-3 py-2 text-left transition hover:border-secondary/30 hover:bg-secondary/10"
                >
                  <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <UIcon name="i-lucide-user-round" class="text-lg" />
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium">{{ user.name }}</p>
                    <p class="truncate text-xs text-muted">{{ user.email }}</p>
                  </div>
                  <UIcon name="i-lucide-chevron-down" class="text-base text-muted" />
                </button>
              </UDropdownMenu>
            </template>

            <template v-else>
              <UButton to="/auth/login" color="primary">Login</UButton>
              <UButton to="/auth/register" color="secondary" variant="soft">Register</UButton>
            </template>
          </div>
        </div>
      </nav>
    </UContainer>
  </header>
</template>
