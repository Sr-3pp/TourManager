import type { Tour, TourFormState, TourResponse, ToursByOrganizerResponse } from '~~/types/tour'

export const useTour = () => {
  const tour = useState<Tour | undefined>('tour', () => undefined)

  const isLoading = ref(false)
  const isSaving = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  const loadTour = async (id: string, options?: { force?: boolean }) => {
    const force = options?.force ?? false

    if (!id) {
      errorMessage.value = 'Tour id is required.'
      return null
    }

    if (!force && tour.value?._id === id) {
      return tour.value
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      const data = await $fetch<TourResponse>(`/api/tours/${encodeURIComponent(id)}`, {
        credentials: 'include',
      })

      tour.value = data?.tour
      return tour.value
    } catch (error) {
      console.error('Error loading tour:', error)
      errorMessage.value = 'Could not load tour.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const saveTour = async (
    form: TourFormState,
    files?: { imageFile?: File | null },
    options?: { id?: string },
  ) => {
    isSaving.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      const formData = new FormData()
      formData.append('name', form.name?.trim() ?? '')
      formData.append('description', form.description?.trim() ?? '')
      formData.append('location', form.location?.trim() ?? '')
      formData.append('date', form.date ?? '')
      formData.append('packages', JSON.stringify(form.packages ?? []))
      formData.append('departure_points', JSON.stringify(form.departure_points ?? []))

      if (files?.imageFile) {
        formData.append('imageFile', files.imageFile)
      }

      const hasId = Boolean(options?.id)
      const endpoint = hasId
        ? `/api/tours/${encodeURIComponent(String(options?.id || ''))}`
        : '/api/tours'

      const method = hasId ? 'PATCH' : 'POST'

      const data = await $fetch<TourResponse>(endpoint, {
        method,
        credentials: 'include',
        body: formData,
      })

      if (data?.tour) {
        tour.value = data.tour
      }

      successMessage.value = hasId ? 'Tour updated successfully.' : 'Tour created successfully.'
      return true
    } catch (error) {
      console.error('Error saving tour:', error)
      errorMessage.value = error instanceof Error ? error.message : 'Could not save tour.'
      return false
    } finally {
      isSaving.value = false
    }
  }

  const resetTourFormState = () => {
    tour.value = undefined
    isLoading.value = false
    isSaving.value = false
    errorMessage.value = null
    successMessage.value = null
  }

  const getToursByOrganizer = async (organizerId: string) => {
    try {
      const data = await $fetch<ToursByOrganizerResponse>(`/api/tours/organizer/${encodeURIComponent(organizerId)}`, {
        credentials: 'include',
      })
      return data.tours
    } catch (error) {
      console.error('Error fetching tours by organizer:', error)
      return []
    }
  }

  return {
    tour,
    isLoading,
    isSaving,
    errorMessage,
    successMessage,
    loadTour,
    saveTour,
    resetTourFormState,
    getToursByOrganizer,
  }
}
