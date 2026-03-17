<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { AdminUser } from '~~/types/user'

definePageMeta({
    middleware: ['admin'],
})

const { getUsers, deleteUser } = useUser()

const loadUsers = async (): Promise<AdminUser[]> => {
    return await getUsers()
}

const { data: users, error, status: usersStatus, refresh } = await useAsyncData<AdminUser[]>('users', () => loadUsers())
const usersList = computed<AdminUser[]>(() => users.value ?? [])
const isEditModalOpen = ref(false)
const deletingUserId = ref<string | null>(null)
const selectedUser = ref<AdminUser | null>(null)
const actionError = ref('')

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
        id: 'actions',
        header: 'Actions',
    },
]

function getUserId(user: AdminUser) {
    return user.id || user._id || ''
}

function openEditModal(user: AdminUser) {
    selectedUser.value = user
    actionError.value = ''
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

function getErrorMessage(error: unknown) {
    if (typeof error === 'object' && error && 'data' in error) {
        const data = (error as { data?: { statusMessage?: string; message?: string } }).data
        if (data?.statusMessage) {
            return data.statusMessage
        }
        if (data?.message) {
            return data.message
        }
    }

    if (typeof error === 'object' && error && 'statusMessage' in error) {
        const statusMessage = (error as { statusMessage?: string }).statusMessage
        if (statusMessage) {
            return statusMessage
        }
    }

    if (error instanceof Error && error.message) {
        return error.message
    }

    return 'Failed to delete user.'
}

async function removeUser(user: AdminUser) {
    const confirmed = window.confirm(`Delete ${user.name}? This action cannot be undone.`)

    if (!confirmed) {
        return
    }

    deletingUserId.value = getUserId(user)
    actionError.value = ''

    try {
        await deleteUser(getUserId(user))
        await refresh()
    } catch (error) {
        actionError.value = getErrorMessage(error)
    } finally {
        deletingUserId.value = null
    }
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

        <p v-if="actionError" class="mt-4 text-sm text-error">
            {{ actionError }}
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
