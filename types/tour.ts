export type Tour = {
  _id?: string
  name: string
  description: string
  date: string | Date
  location: string
  image: string | null
  featured?: boolean
  creator?: string | TourCreatorSummary
  price: number
  attendees: TourAttendee[]
  sponsors: TourSponsor[]
  packages: TourPackage[]
  departure_points: TourDeparturePoint[]
}

export type TourCreatorSummary = {
  _id?: string
  name?: string
  username?: string
}

export type TourSocial = {
  instagram: string
  x: string
  tiktok: string
}

export type TourAttendee = {
  name: string
  email: string
  social: TourSocial
}

export type TourSponsor = {
  packageLevel: string
  name: string
  logo: string | null
  website: string
  social: TourSocial
}

export type TourPackage = {
  level: number
  name: string
  description: string
  price: number
  benefits: string[]
}

export type TourDeparturePoint = {
  name: string
  location: string
  dateTime: string | Date
  notes: string
}

export type TourFormState = {
  name: string
  description: string
  location: string
  date: string
  packages: TourPackage[]
  departure_points: Array<Omit<TourDeparturePoint, 'dateTime'> & { dateTime: string }>
}

export type TourFormInitialValues = Partial<TourFormState> & {
  image?: string | null
}

export type TourResponse = {
  tour: Tour
}

export type TourListResponse = {
  tours: Tour[]
}

export type ToursByOrganizerResponse = {
  organizer: TourCreatorSummary
  tours: Tour[]
}

export type TourCreateBody = {
  name?: string
  description?: string
  date?: string
  location?: string
  image?: string | null
  featured?: boolean
  attendees?: unknown
  sponsors?: unknown
  packages?: unknown
  departure_points?: unknown
}

export type TourUpdateBody = TourCreateBody

export type NormalizeStringOptions = {
  required?: boolean
}

export type NestedFieldOptions = {
  requiredFields?: boolean
}
