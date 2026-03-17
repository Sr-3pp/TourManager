import type { FeaturedOrganizer, FeaturedOrganizerListResponse } from '~~/types/profile'
import type { AdminUser, AdminUserUpdateBody } from '~~/types/user'

export const useUser = () => {
    const featuredOrganizers = useState<FeaturedOrganizer[]>('user-featured-organizers', () => [])

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

    const loadFeaturedOrganizers = async (options?: { force?: boolean }) => {
      const force = options?.force ?? false

      if (!force && featuredOrganizers.value.length > 0) {
        return featuredOrganizers.value
      }

      const data = await $fetch<FeaturedOrganizerListResponse>('/api/users/featured-organizers', {
        credentials: 'include',
      })

      featuredOrganizers.value = data.organizers
      return featuredOrganizers.value
    }

  return {
    featuredOrganizers,
    getUsers,
    deleteUser,
    loadFeaturedOrganizers,
    updateUser,
  }
}
