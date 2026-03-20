import type {
  Tour,
  TourFormInitialValues,
  TourFormState,
  TourPackage,
  TourSocial,
  TourSponsor,
} from '~~/types/tour'

export const TOUR_MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024

export function cloneTourSocial(social?: Partial<TourSocial> | null): TourSocial {
  return {
    instagram: social?.instagram ?? '',
    x: social?.x ?? '',
    tiktok: social?.tiktok ?? '',
  }
}

export function createEmptyTourFormState(): TourFormState {
  return {
    name: '',
    description: '',
    location: '',
    date: '',
    price: 0,
    attendees: [],
    sponsors: [],
    packages: [],
    departure_points: [],
  }
}

export function normalizePackageDrafts(packages: TourFormState['packages'] = []) {
  const usedLevels = new Set<number>()

  return packages.map((pkg) => {
    const parsedLevel = Number(pkg.level)
    const hasValidLevel
      = Number.isInteger(parsedLevel)
        && parsedLevel >= 1
        && !usedLevels.has(parsedLevel)

    const level = hasValidLevel
      ? parsedLevel
      : (() => {
          let nextLevel = 1

          while (usedLevels.has(nextLevel)) {
            nextLevel += 1
          }

          return nextLevel
        })()

    usedLevels.add(level)

    return {
      ...pkg,
      level,
    }
  })
}

export function toTourFormInitialValues(value?: Tour): TourFormInitialValues {
  return {
    name: value?.name,
    description: value?.description,
    location: value?.location,
    date: value?.date ? new Date(value.date).toISOString().slice(0, 16) : '',
    price: value?.price ?? 0,
    attendees: value?.attendees ?? [],
    sponsors: value?.sponsors ?? [],
    image: value?.image ?? null,
    packages: value?.packages ?? [],
    departure_points:
      value?.departure_points?.map(point => ({
        ...point,
        dateTime: point?.dateTime ? new Date(point.dateTime).toISOString().slice(0, 16) : '',
      })) ?? [],
  }
}

export function mapInitialValuesToTourDraft(
  draft: TourFormState,
  values: TourFormInitialValues = {},
) {
  draft.name = values.name ?? ''
  draft.description = values.description ?? ''
  draft.location = values.location ?? ''
  draft.date = values.date ?? ''
  draft.price = values.price ?? 0
  draft.attendees = (values.attendees ?? []).map(attendee => ({
    name: attendee.name ?? '',
    email: attendee.email ?? '',
    social: cloneTourSocial(attendee.social),
  }))
  draft.sponsors = (values.sponsors ?? []).map((sponsor: TourSponsor) => ({
    packageLevel: sponsor.packageLevel ?? '',
    name: sponsor.name ?? '',
    logo: sponsor.logo ?? null,
    website: sponsor.website ?? '',
    social: cloneTourSocial(sponsor.social),
  }))
  draft.packages = normalizePackageDrafts((values.packages ?? []).map((pkg: TourPackage) => ({
    level: Number(pkg.level) || 1,
    name: pkg.name ?? '',
    description: pkg.description ?? '',
    price: Number(pkg.price) || 0,
    benefits: [...(pkg.benefits ?? [])],
  })))
  draft.departure_points = (values.departure_points ?? []).map(point => ({
    name: point.name ?? '',
    location: point.location ?? '',
    dateTime: point.dateTime ?? '',
    notes: point.notes ?? '',
  }))
}

export function toEditableTourState(source: Tour): TourFormState {
  const draft = createEmptyTourFormState()
  mapInitialValuesToTourDraft(draft, toTourFormInitialValues(source))
  return {
    ...draft,
    attendees: draft.attendees.map(attendee => ({
      ...attendee,
      social: cloneTourSocial(attendee.social),
    })),
    sponsors: draft.sponsors.map(sponsor => ({
      ...sponsor,
      social: cloneTourSocial(sponsor.social),
    })),
    packages: draft.packages.map(pkg => ({
      ...pkg,
      benefits: [...pkg.benefits],
    })),
    departure_points: draft.departure_points.map(point => ({ ...point })),
  }
}

export function buildTourFormData(form: TourFormState, imageFile?: File | null) {
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

  if (imageFile) {
    formData.append('imageFile', imageFile)
  }

  return formData
}
