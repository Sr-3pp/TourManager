<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { AdminUser } from '~~/types/user'

definePageMeta({
    middleware: ['admin'],
})

const { getUsers, deleteUser } = useUser()
const { openConfirmation } = useConfirmation()

const loadUsers = async (): Promise<AdminUser[]> => {
    return await getUsers()
}

const { data: users, error, status: usersStatus, refresh } = await useAsyncData<AdminUser[]>('users', () => loadUsers())
const usersList = computed<AdminUser[]>(() => users.value ?? [])
const isEditModalOpen = ref(false)
const deletingUserId = ref<string | null>(null)
const selectedUser = ref<AdminUser | null>(null)

const columns: TableColumn<AdminUser>[] = [
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
    {
        id: 'featured',
        header: 'Featured organizer',
        cell: ({ row }) => row.original.profile?.featured ? 'Yes' : 'No',
    },
    {
        id: 'actions',
        header: 'Actions',
    },
]

function getUserId(user: AdminUser) {
    return user.id || user._id || ''
}

function openEditModal(user: AdminUser) {
    selectedUser.value = user
    isEditModalOpen.value = true
}

async function handleUserSaved() {
    isEditModalOpen.value = false
    selectedUser.value = null
    await refresh()
}

watch(isEditModalOpen, (open) => {
    if (!open) {
        selectedUser.value = null
    }
})

async function removeUser(user: AdminUser) {
    const userId = getUserId(user)

    await openConfirmation({
        title: `Delete ${user.name}?`,
        description: 'This action cannot be undone. The user account, profile, session, and auth records will be removed.',
        confirmLabel: 'Delete User',
        color: 'error',
        icon: 'i-lucide-triangle-alert',
        onConfirm: async () => {
            deletingUserId.value = userId

            try {
                await deleteUser(userId)
                await refresh()
            } finally {
                deletingUserId.value = null
            }
        },
    })
}
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
        >
            <template #actions-cell="{ row }">
                <div class="flex items-center justify-end gap-2">
                    <UButton
                        size="sm"
                        variant="soft"
                        icon="i-lucide-pencil"
                        @click="openEditModal(row.original)"
                    >
                        Edit
                    </UButton>
                    <UButton
                        size="sm"
                        color="error"
                        variant="soft"
                        icon="i-lucide-trash"
                        :loading="deletingUserId === getUserId(row.original)"
                        @click="removeUser(row.original)"
                    >
                        Delete
                    </UButton>
                </div>
            </template>
        </UTable>

        <p v-if="error" class="mt-4 text-sm text-error">
            Failed to load users.
        </p>
    </UContainer>

    <UModal v-model:open="isEditModalOpen" title="Edit User">
        <template #body>
            <UserEditForm
                v-if="selectedUser"
                :user="selectedUser"
                @saved="handleUserSaved"
                @cancel="isEditModalOpen = false"
            />
        </template>
    </UModal>
</template>
