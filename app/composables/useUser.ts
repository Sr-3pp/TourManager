import type { FeaturedOrganizer, FeaturedOrganizerListResponse } from '~~/types/profile'
import type { AdminUser, AdminUserUpdateBody } from '~~/types/user'
import { apiFetch } from '~~/app/utils/api'

export const useUser = () => {
  const featuredOrganizers = useState<FeaturedOrganizer[]>('user-featured-organizers', () => [])

  const getUsers = () => apiFetch<AdminUser[]>('/api/users')

  const deleteUser = async (userId: string) => {
    return await apiFetch(`/api/users/${userId}`, {
      method: 'DELETE',
    })
  }

  const updateUser = async (userId: string, data: AdminUserUpdateBody) => {
    return await apiFetch(`/api/users/${userId}`, {
      method: 'PATCH',
      body: data,
    })
  }

  const loadFeaturedOrganizers = async (options?: { force?: boolean }) => {
    const force = options?.force ?? false

    if (!force && featuredOrganizers.value.length > 0) {
      return featuredOrganizers.value
    }

    const data = await apiFetch<FeaturedOrganizerListResponse>('/api/users/featured-organizers')

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
