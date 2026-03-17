<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({
    middleware: ['admin'],
})

type PanelUser = {
    _id: string
    name: string
    email: string
    level?: number
}

const { getUsers } = useUser()

const loadUsers = async (): Promise<PanelUser[]> => {
    return await getUsers()
}

const { data: users, error, status: usersStatus } = await useAsyncData<PanelUser[]>('users', () => loadUsers())
const usersList = computed<PanelUser[]>(() => users.value ?? [])

const columns: TableColumn<PanelUser>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'level',
        header: 'Level',
        cell: ({ row }) => String(row.original.level ?? 1),
    },
]
</script>

<template>
    <UContainer class="p-4">
        <h1 class="text-2xl font-bold mb-4">Users</h1>
        <p class="mb-4 text-gray-600">This page displays the registered users.</p>

        <UTable
            :data="usersList"
            :columns="columns"
            :loading="usersStatus === 'pending'"
            sticky
            class="rounded-xl border border-default"
        />

        <p v-if="error" class="mt-4 text-sm text-error">
            Failed to load users.
        </p>
    </UContainer>
</template>
