import {
  compressProfileImageForUpload,
  MAX_PROFILE_UPLOAD_SOURCE_BYTES,
} from '~~/server/utils/image'
import { useHubBlob } from '~~/server/utils/r2'
import type {
  TourAttendee,
  TourCreateBody,
  TourDeparturePoint,
  TourPackage,
  TourSponsor,
  TourSocial,
} from '~~/types/tour'

type NormalizeStringOptions = {
  required?: boolean
}

type NestedFieldOptions = {
  requiredFields?: boolean
}

export function normalizeString(value: unknown, field: string, options?: NormalizeStringOptions) {
  const required = options?.required ?? false

  if (value === undefined || value === null) {
    if (required) {
      throw createError({
        statusCode: 400,
        statusMessage: `${field} is required`,
      })
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
    throw createError({
      statusCode: 400,
      statusMessage: `${field} is required`,
    })
  }

  return normalized
}

export function normalizeNullableString(value: unknown, field: string) {
  if (value === null) {
    return null
  }

  return normalizeString(value, field)
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

export function normalizeSocial(value: unknown, field: string): TourSocial {
  if (value === undefined || value === null) {
    return {
      instagram: '',
      x: '',
      tiktok: '',
    }
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw createError({
      statusCode: 400,
      statusMessage: `${field} must be an object`,
    })
  }

  const social = value as Record<string, unknown>

  return {
    instagram: normalizeString(social.instagram ?? '', `${field}.instagram`),
    x: normalizeString(social.x ?? '', `${field}.x`),
    tiktok: normalizeString(social.tiktok ?? '', `${field}.tiktok`),
  }
}

export function normalizeAttendees(value: unknown, options?: NestedFieldOptions): TourAttendee[] {
  const requiredFields = options?.requiredFields ?? true

  if (value === undefined || value === null) {
    return []
  }

  if (!Array.isArray(value)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'attendees must be an array',
    })
  }

  return value.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw createError({
        statusCode: 400,
        statusMessage: `attendees[${index}] must be an object`,
      })
    }

    const attendee = item as Record<string, unknown>

    return {
      name: normalizeString(attendee.name, `attendees[${index}].name`, { required: requiredFields }),
      email: normalizeString(attendee.email, `attendees[${index}].email`, { required: requiredFields }),
      social: normalizeSocial(attendee.social, `attendees[${index}].social`),
    }
  })
}

export function normalizeSponsors(value: unknown, options?: NestedFieldOptions): TourSponsor[] {
  const requiredFields = options?.requiredFields ?? true

  if (value === undefined || value === null) {
    return []
  }

  if (!Array.isArray(value)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'sponsors must be an array',
    })
  }

  return value.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw createError({
        statusCode: 400,
        statusMessage: `sponsors[${index}] must be an object`,
      })
    }

    const sponsor = item as Record<string, unknown>

    return {
      packageLevel: normalizeString(sponsor.packageLevel, `sponsors[${index}].packageLevel`, { required: requiredFields }),
      name: normalizeString(sponsor.name, `sponsors[${index}].name`, { required: requiredFields }),
      logo: sponsor.logo === null ? null : normalizeString(sponsor.logo ?? '', `sponsors[${index}].logo`),
      website: normalizeString(sponsor.website ?? '', `sponsors[${index}].website`),
      social: normalizeSocial(sponsor.social, `sponsors[${index}].social`),
    }
  })
}

export function normalizePackages(value: unknown, options?: NestedFieldOptions): TourPackage[] {
  const requiredFields = options?.requiredFields ?? true

  if (value === undefined || value === null) {
    return []
  }

  if (!Array.isArray(value)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'packages must be an array',
    })
  }

  return value.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw createError({
        statusCode: 400,
        statusMessage: `packages[${index}] must be an object`,
      })
    }

    const pkg = item as Record<string, unknown>
    const level = Number(pkg.level)
    const price = Number(pkg.price)

    if (!Number.isFinite(level)) {
      throw createError({
        statusCode: 400,
        statusMessage: `packages[${index}].level must be a number`,
      })
    }

    if (!Number.isFinite(price)) {
      throw createError({
        statusCode: 400,
        statusMessage: `packages[${index}].price must be a number`,
      })
    }

    if (requiredFields && level < 1) {
      throw createError({
        statusCode: 400,
        statusMessage: `packages[${index}].level must be at least 1`,
      })
    }

    if (price < 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `packages[${index}].price must be at least 0`,
      })
    }

    const benefitsRaw = pkg.benefits
    if (!Array.isArray(benefitsRaw)) {
      throw createError({
        statusCode: 400,
        statusMessage: `packages[${index}].benefits must be an array`,
      })
    }

    return {
      level,
      name: normalizeString(pkg.name, `packages[${index}].name`, { required: requiredFields }),
      description: normalizeString(pkg.description ?? '', `packages[${index}].description`),
      price,
      benefits: benefitsRaw.map((benefit, benefitIndex) =>
        normalizeString(benefit, `packages[${index}].benefits[${benefitIndex}]`, { required: requiredFields }),
      ),
    }
  })
}

export function normalizeDeparturePoints(value: unknown, options?: NestedFieldOptions): TourDeparturePoint[] {
  const requiredFields = options?.requiredFields ?? true

  if (value === undefined || value === null) {
    return []
  }

  if (!Array.isArray(value)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'departure_points must be an array',
    })
  }

  return value.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw createError({
        statusCode: 400,
        statusMessage: `departure_points[${index}] must be an object`,
      })
    }

    const point = item as Record<string, unknown>

    return {
      name: normalizeString(point.name, `departure_points[${index}].name`, { required: requiredFields }),
      location: normalizeString(point.location ?? '', `departure_points[${index}].location`),
      dateTime: normalizeDate(point.dateTime, `departure_points[${index}].dateTime`),
      notes: normalizeString(point.notes ?? '', `departure_points[${index}].notes`),
    }
  })
}

export async function parseTourBody(event: Parameters<typeof defineEventHandler>[0], sessionUserId: string) {
  const hubBlob = useHubBlob()
  const contentType = String(getRequestHeader(event, 'content-type') || '').toLowerCase()
  const isMultipart = contentType.includes('multipart/form-data')

  let body: TourCreateBody = {}
  let imagePath: string | null | undefined

  if (isMultipart) {
    const formData = (await readMultipartFormData(event)) ?? []

    const field = (name: string) =>
      formData.find((part) => part.name === name && !part.filename)?.data.toString('utf8')

    const imageFile = formData.find((part) => part.name === 'imageFile' && part.filename)

    body = {
      name: field('name'),
      description: field('description'),
      location: field('location'),
      date: field('date'),
      attendees: parseMultipartJson(field('attendees'), 'attendees'),
      sponsors: parseMultipartJson(field('sponsors'), 'sponsors'),
      packages: parseMultipartJson(field('packages'), 'packages'),
      departure_points: parseMultipartJson(field('departure_points'), 'departure_points'),
    }

    if (imageFile?.data?.length) {
      if (imageFile.data.length > MAX_PROFILE_UPLOAD_SOURCE_BYTES) {
        throw createError({
          statusCode: 400,
          statusMessage: 'imageFile must be less than 10MB',
        })
      }

      const imageMimeType = String(imageFile.type || '')
      if (!imageMimeType.startsWith('image/')) {
        throw createError({
          statusCode: 400,
          statusMessage: 'imageFile must be an image',
        })
      }

      const compressedImage = await compressProfileImageForUpload(imageFile.data, 'banner')
      const upload = await hubBlob.put(
        `cover-${Date.now()}.${compressedImage.extension}`,
        compressedImage.body,
        {
          prefix: `tours/${sessionUserId}`,
          contentType: compressedImage.contentType,
        },
      )
      imagePath = upload.pathname
    }
  } else {
    body = (await readBody<TourCreateBody>(event)) ?? {}
  }

  return {
    body,
    imagePath,
  }
}
