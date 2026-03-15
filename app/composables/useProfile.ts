import type { MeResponse, OrganizerProfileFormState, Profile } from '~~/types/profile'

export const useProfile = () => {
    const profile = useState<Profile | undefined>('profile', () => undefined)

    const isLoading = ref(false)
    const isSaving = ref(false)
    const errorMessage = ref<string | null>(null)
    const successMessage = ref<string | null>(null)

    const loadProfile = async (options?: { force?: boolean }) => {
        const force = options?.force ?? false

        if (!force && profile.value) {
            return
        }

        isLoading.value = true
        errorMessage.value = null

        try {
            const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
            const data = await $fetch<MeResponse>('/api/users/me', {
                credentials: 'include',
                headers,
            })

            profile.value = data?.user?.profile
        } catch (error) {
            console.error('Error loading profile:', error)
            errorMessage.value = 'Could not load profile. Please sign in and try again.'
        } finally {
            isLoading.value = false
        }
    }

    const saveProfile = async (
        form: OrganizerProfileFormState,
        files?: { pictureFile?: File | null; bannerFile?: File | null },
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

            await $fetch('/api/users/me/profile', {
                method: 'PATCH',
                credentials: 'include',
                body: formData,
            })

            await loadProfile({ force: true })
            successMessage.value = 'Profile updated successfully.'
            return true
        } catch (error) {
            console.error('Error saving profile:', error)
            errorMessage.value =
                error instanceof Error ? error.message : 'Could not save profile. Please try again.'
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
