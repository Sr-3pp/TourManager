export const useUser = () => {
    const getUsers = () => {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

      return $fetch<Array<{
        _id: string
        name: string
        email: string
        level?: number
      }>>('/api/users', {
        credentials: 'include',
        headers,
      })
    }

    const deleteUser = async (userId: string) => {
      try {
        await $fetch(`/api/users/${userId}`, {
          method: 'DELETE',
          credentials: 'include',
        })
        return true
      } catch (error) {
        console.error('Error deleting user:', error)
        return false
      }
    }

    const updateUser = async (userId: string, data: { name?: string; email?: string; level?: number }) => {
      try {
        await $fetch(`/api/users/${userId}`, {
          method: 'PATCH',
          credentials: 'include',
          body: data,
        })
        return true
      } catch (error) {
        console.error('Error updating user:', error)
        return false
      }
    }

  return {
    getUsers,
    deleteUser,
    updateUser,
  }
}
