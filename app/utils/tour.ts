import type { Tour } from '~~/types/tour'

type TourDateFormatOptions = Intl.DateTimeFormatOptions

const DEFAULT_LOCALE = 'en-US'

export function formatTourPrice(value: number | null | undefined, options?: Intl.NumberFormatOptions) {
  const price = Number(value ?? 0)

  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    ...options,
  }).format(price)
}

export function formatTourDate(
  value: string | Date | null | undefined,
  fallback = 'Date to be announced',
  options?: TourDateFormatOptions,
) {
  if (!value) {
    return fallback
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(date)
}

export function getTourOrganizerName(tour: Pick<Tour, 'creator'> | null | undefined) {
  const creator = tour?.creator

  if (!creator) {
    return 'Organizer to be announced'
  }

  if (typeof creator === 'string') {
    return creator
  }

  return creator.name || creator.slug || 'Organizer to be announced'
}
