import type { AdminUser, AdminUserUpdateBody } from '~~/types/user'

export const useUser = () => {
    const getUsers = () => {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

      return $fetch<AdminUser[]>('/api/users', {
        credentials: 'include',
        headers,
      })
    }

    const deleteUser = async (userId: string) => {
      return await $fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
    }

    const updateUser = async (userId: string, data: AdminUserUpdateBody) => {
      return await $fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        body: data,
      })
    }

  return {
    getUsers,
    deleteUser,
    updateUser,
  }
}
