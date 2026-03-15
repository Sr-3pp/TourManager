import type { Tour, TourFormState, TourResponse, ToursByOrganizerResponse } from '~~/types/tour'

export const useTour = () => {
  const toursById = ref<Record<string, Tour>>({})
  const activeTourId = ref<string | null>(null)
  const organizerTours = ref<Record<string, Tour[]>>({})
  const tour = computed(() => {
    if (!activeTourId.value) {
      return undefined
    }

    return toursById.value[activeTourId.value]
  })

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

    activeTourId.value = id

    if (!force && toursById.value[id]) {
      return toursById.value[id]
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      const data = await $fetch<TourResponse>(`/api/tours/${encodeURIComponent(id)}`, {
        credentials: 'include',
      })

      toursById.value[id] = data.tour
      return toursById.value[id]
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

      const savedTour = data.tour
      if (savedTour?._id) {
        toursById.value[savedTour._id] = savedTour
        activeTourId.value = savedTour._id
      }

      const creator = savedTour?.creator
      const organizerSlug =
        creator && typeof creator === 'object' && 'slug' in creator && typeof creator.slug === 'string'
          ? creator.slug
          : null

      if (organizerSlug) {
        const { [organizerSlug]: _removed, ...rest } = organizerTours.value
        organizerTours.value = rest
      } else {
        organizerTours.value = {}
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
    activeTourId.value = null
    isLoading.value = false
    isSaving.value = false
    errorMessage.value = null
    successMessage.value = null
  }

  const clearTourCache = (id?: string) => {
    if (id) {
      if (activeTourId.value === id) {
        activeTourId.value = null
      }

      const { [id]: _removed, ...rest } = toursById.value
      toursById.value = rest
      return
    }

    toursById.value = {}
    activeTourId.value = null
  }

  const getToursByOrganizer = async (organizerId: string, options?: { force?: boolean }) => {
    const force = options?.force ?? false

    if (!organizerId) {
      return []
    }

    if (!force && organizerTours.value[organizerId]) {
      return organizerTours.value[organizerId]
    }

    try {
      const data = await $fetch<ToursByOrganizerResponse>(`/api/tours/organizer/${encodeURIComponent(organizerId)}`, {
        credentials: 'include',
      })
      organizerTours.value[organizerId] = data.tours

      for (const tour of data.tours) {
        if (tour._id) {
          toursById.value[tour._id] = tour
        }
      }

      return organizerTours.value[organizerId]
    } catch (error) {
      console.error('Error fetching tours by organizer:', error)
      return []
    }
  }

  const clearOrganizerToursCache = (organizerId?: string) => {
    if (organizerId) {
      const { [organizerId]: _removed, ...rest } = organizerTours.value
      organizerTours.value = rest
      return
    }

    organizerTours.value = {}
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
    clearTourCache,
    getToursByOrganizer,
    clearOrganizerToursCache,
  }
}
