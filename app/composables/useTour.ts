import type { Tour, TourFormState, TourListResponse, TourResponse, ToursByOrganizerResponse } from '~~/types/tour'

export const useTour = () => {
  const toursById = useState<Record<string, Tour>>('tour-tours-by-id', () => ({}))
  const tours = useState<Tour[]>('tour-tours', () => [])
  const featuredTours = useState<Tour[]>('tour-featured-tours', () => [])
  const activeTourId = useState<string | null>('tour-active-id', () => null)
  const organizerTours = useState<Record<string, Tour[]>>('tour-organizer-tours', () => ({}))
  const tour = computed(() => {
    if (!activeTourId.value) {
      return undefined
    }

    return toursById.value[activeTourId.value]
  })
  const featuredTour = computed(() => featuredTours.value[0] ?? null)
  const secondaryFeaturedTours = computed(() => featuredTours.value.slice(1))

  const isLoading = ref(false)
  const isSaving = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  const loadTours = async (options?: { force?: boolean }) => {
    const force = options?.force ?? false

    if (!force && tours.value.length > 0) {
      return tours.value
    }

    try {
      const data = await $fetch<TourListResponse>('/api/tours', {
        credentials: 'include',
      })

      tours.value = data.tours

      for (const entry of data.tours) {
        if (entry._id) {
          toursById.value[entry._id] = entry
        }
      }

      return tours.value
    } catch (error) {
      console.error('Error al cargar tours:', error)
      errorMessage.value = 'No se pudieron cargar los tours.'
      throw error
    }
  }

  const loadFeaturedTours = async (options?: { force?: boolean }) => {
    const force = options?.force ?? false

    if (!force && featuredTours.value.length > 0) {
      return featuredTours.value
    }

    try {
      const data = await $fetch<TourListResponse>('/api/tours/featured', {
        credentials: 'include',
      })

      featuredTours.value = data.tours

      for (const entry of data.tours) {
        if (entry._id) {
          toursById.value[entry._id] = entry
        }
      }

      return featuredTours.value
    } catch (error) {
      console.error('Error al cargar tours destacados:', error)
      errorMessage.value = 'No se pudieron cargar los tours destacados.'
      throw error
    }
  }

  const loadTour = async (id: string, options?: { force?: boolean }) => {
    const force = options?.force ?? false

    if (!id) {
      errorMessage.value = 'El id del tour es obligatorio.'
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
      console.error('Error al cargar el tour:', error)
      errorMessage.value = 'No se pudo cargar el tour.'
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
      formData.append('price', String(form.price ?? 0))
      formData.append('attendees', JSON.stringify(form.attendees ?? []))
      formData.append('sponsors', JSON.stringify(form.sponsors ?? []))
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

      if (savedTour?._id) {
        const index = tours.value.findIndex(item => item._id === savedTour._id)

        if (index >= 0) {
          tours.value.splice(index, 1, savedTour)
        } else {
          tours.value.unshift(savedTour)
        }
      }

      if (savedTour?._id) {
        const featuredIndex = featuredTours.value.findIndex(item => item._id === savedTour._id)

        if (savedTour.featured) {
          if (featuredIndex >= 0) {
            featuredTours.value.splice(featuredIndex, 1, savedTour)
          } else {
            featuredTours.value.unshift(savedTour)
          }
        } else if (featuredIndex >= 0) {
          featuredTours.value.splice(featuredIndex, 1)
        }
      }

      const creator = savedTour?.creator
      const organizerKeys = creator && typeof creator === 'object'
        ? [
            ('_id' in creator && typeof creator._id === 'string' ? creator._id : null),
            ('username' in creator && typeof creator.username === 'string' ? creator.username : null),
          ].filter((value): value is string => Boolean(value))
        : []

      for (const organizerKey of organizerKeys) {
        const cachedTours = organizerTours.value[organizerKey]

        if (!cachedTours) {
          continue
        }

        const index = cachedTours.findIndex(item => item._id === savedTour._id)

        if (index >= 0) {
          cachedTours.splice(index, 1, savedTour)
        } else {
          cachedTours.unshift(savedTour)
        }
      }

      successMessage.value = hasId ? 'Tour actualizado correctamente.' : 'Tour creado correctamente.'
      return true
    } catch (error) {
      console.error('Error al guardar el tour:', error)
      errorMessage.value = error instanceof Error ? error.message : 'No se pudo guardar el tour.'
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
      console.error('Error al obtener los tours del organizador:', error)
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
    tours,
    tour,
    organizerTours,
    featuredTours,
    featuredTour,
    secondaryFeaturedTours,
    isLoading,
    isSaving,
    errorMessage,
    successMessage,
    loadTours,
    loadFeaturedTours,
    loadTour,
    saveTour,
    resetTourFormState,
    clearTourCache,
    getToursByOrganizer,
    clearOrganizerToursCache,
  }
}
