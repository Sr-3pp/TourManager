import type { CalendarDateTime, DateValue } from '@internationalized/date'
import { parseDateTime, toCalendarDateTime } from '@internationalized/date'

type DateRangeLike = {
  start?: DateValue | null
  end?: DateValue | null
}

function isDateRangeLike(value: DateValue | DateRangeLike) : value is DateRangeLike {
  return typeof value === 'object' && value !== null && ('start' in value || 'end' in value)
}

function padDatePart(value: number) {
  return String(value).padStart(2, '0')
}

function normalizeDateInputValue(value: string) {
  return value.trim().slice(0, 16)
}

export function parseDateInputValue(value?: string | null): CalendarDateTime | undefined {
  if (!value) {
    return undefined
  }

  try {
    return parseDateTime(normalizeDateInputValue(value))
  } catch {
    return undefined
  }
}

export function formatDateInputValue(value?: DateValue | DateRangeLike | null) {
  if (!value) {
    return ''
  }

  const resolvedValue = isDateRangeLike(value) ? (value.start ?? value.end ?? null) : value

  if (!resolvedValue) {
    return ''
  }

  const dateTime = toCalendarDateTime(resolvedValue)

  return `${String(dateTime.year).padStart(4, '0')}-${padDatePart(dateTime.month)}-${padDatePart(dateTime.day)}T${padDatePart(dateTime.hour)}:${padDatePart(dateTime.minute)}`
}