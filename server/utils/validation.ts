import type { ValidationNumberOptions, ValidationStringOptions } from '~~/types/server'

export function requiredFieldError(field: string) {
  return createError({
    statusCode: 400,
    statusMessage: `${field} is required`,
  })
}

export function normalizeString(value: unknown, field: string, options?: ValidationStringOptions) {
  const required = options?.required ?? false

  if (value === undefined || value === null) {
    if (required) {
      throw requiredFieldError(field)
    }

    return ''
  }

  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: `${field} must be a string`,
    })
  }

  const normalized = value.trim()

  if (required && !normalized) {
    throw requiredFieldError(field)
  }

  return normalized
}

export function normalizeOptionalString(value: unknown, field: string) {
  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: `${field} must be a string`,
    })
  }

  return value.trim()
}

export function normalizeNullableString(value: unknown, field: string) {
  if (value === null) {
    return null
  }

  return normalizeString(value, field)
}

export function normalizeBoolean(value: unknown, field: string) {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()

    if (normalized === 'true') {
      return true
    }

    if (normalized === 'false') {
      return false
    }
  }

  throw createError({
    statusCode: 400,
    statusMessage: `${field} must be a boolean`,
  })
}

export function normalizeNumber(value: unknown, field: string, options?: ValidationNumberOptions) {
  const required = options?.required ?? false
  const min = options?.min

  if (value === undefined || value === null || value === '') {
    if (required) {
      throw requiredFieldError(field)
    }

    return 0
  }

  const number = Number(value)

  if (!Number.isFinite(number)) {
    throw createError({
      statusCode: 400,
      statusMessage: `${field} must be a number`,
    })
  }

  if (min !== undefined && number < min) {
    throw createError({
      statusCode: 400,
      statusMessage: `${field} must be at least ${min}`,
    })
  }

  return number
}

export function normalizeDate(value: unknown, field: string) {
  const dateString = normalizeString(value, field, { required: true })
  const parsed = new Date(dateString)

  if (Number.isNaN(parsed.getTime())) {
    throw createError({
      statusCode: 400,
      statusMessage: `${field} must be a valid date`,
    })
  }

  return parsed
}

export function parseMultipartJson(value: string | undefined, field: string) {
  if (value === undefined || value === '') {
    return undefined
  }

  try {
    return JSON.parse(value)
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: `${field} must be valid JSON`,
    })
  }
}
