<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { AdminUser } from '~~/types/user'

definePageMeta({
    middleware: ['admin'],
})

const seo = useSeo()
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
        header: 'Nombre',
    },
    {
        accessorKey: 'email',
        header: 'Correo electrónico',
    },
    {
        accessorKey: 'level',
        header: 'Nivel',
        cell: ({ row }) => String(row.original.level ?? 1),
    },
    {
        id: 'featured',
        header: 'Organizador destacado',
        cell: ({ row }) => row.original.profile?.featured ? 'Sí' : 'No',
    },
    {
        id: 'actions',
        header: 'Acciones',
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
        title: `¿Eliminar a ${user.name}?`,
        description: 'Esta acción no se puede deshacer. Se eliminarán la cuenta, el perfil, la sesión y los registros de autenticación del usuario.',
        confirmLabel: 'Eliminar usuario',
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

seo.noIndex()

useSeoMeta({
    title: `Usuarios | ${seo.siteName.value}`,
    description: 'Gestión administrativa de usuarios en Tour Manager.',
})
</script>

<template>
    <UContainer class="p-4">
        <h1 class="text-2xl font-bold mb-4">Usuarios</h1>
        <p class="mb-4 text-gray-600">Esta página muestra los usuarios registrados.</p>

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
                        Editar
                    </UButton>
                    <UButton
                        size="sm"
                        color="error"
                        variant="soft"
                        icon="i-lucide-trash"
                        :loading="deletingUserId === getUserId(row.original)"
                        @click="removeUser(row.original)"
                    >
                        Eliminar
                    </UButton>
                </div>
            </template>
        </UTable>

        <p v-if="error" class="mt-4 text-sm text-error">
            No se pudieron cargar los usuarios.
        </p>
    </UContainer>

    <UModal v-model:open="isEditModalOpen" title="Editar usuario">
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
