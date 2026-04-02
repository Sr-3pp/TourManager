import type { MeResponse, OrganizerProfileFormState, Profile } from '~~/types/profile'
import { apiFetch, getApiErrorMessage } from '~~/app/utils/api'

export const useProfile = () => {
  const profile = useState<Profile | undefined>('profile', () => undefined)

  const isLoading = ref(false)
  const isSaving = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  const loadProfile = async (options?: { force?: boolean }) => {
    const force = options?.force ?? false

    if (!force && profile.value) {
      return profile.value
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      const data = await apiFetch<MeResponse>('/api/users/me')
      profile.value = data?.user?.profile
      return profile.value
    } catch (error) {
      console.error('Error al cargar el perfil:', error)
      errorMessage.value = 'No se pudo cargar el perfil. Inicia sesión e inténtalo de nuevo.'
      return undefined
    } finally {
      isLoading.value = false
    }
  }

  const saveProfile = async (
    form: OrganizerProfileFormState,
    files?: { pictureFile?: File | null, bannerFile?: File | null },
  ) => {
    isSaving.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      const formData = new FormData()
      formData.append('bio', form.bio?.trim() ?? '')
      formData.append('instagram', form.instagram?.trim() ?? '')
      formData.append('tiktok', form.tiktok?.trim() ?? '')
      formData.append('x', form.x?.trim() ?? '')

      if (files?.pictureFile) {
        formData.append('pictureFile', files.pictureFile)
      }

      if (files?.bannerFile) {
        formData.append('bannerFile', files.bannerFile)
      }

      await apiFetch('/api/users/me/profile', {
        method: 'PATCH',
        body: formData,
      })

      await loadProfile({ force: true })
      successMessage.value = 'Perfil actualizado correctamente.'
      return true
    } catch (error) {
      console.error('Error al guardar el perfil:', error)
      errorMessage.value = getApiErrorMessage(
        error,
        'No se pudo guardar el perfil. Inténtalo de nuevo.',
      )
      return false
    } finally {
      isSaving.value = false
    }
  }

  return {
    profile,
    isLoading,
    isSaving,
    errorMessage,
    successMessage,
    loadProfile,
    saveProfile,
  }
}
