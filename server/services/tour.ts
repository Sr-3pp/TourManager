import type { H3Event } from 'h3'
import {
  compressProfileImageForUpload,
  MAX_PROFILE_UPLOAD_SOURCE_BYTES,
} from '~~/server/utils/image'
import { useHubBlob } from '~~/server/utils/r2'
import {
  normalizeBoolean,
  normalizeDate,
  normalizeNullableString,
  normalizeNumber,
  normalizeString,
  parseMultipartJson,
} from '~~/server/utils/validation'
import type {
  NestedFieldOptions,
  TourAttendee,
  TourCreateBody,
  TourDeparturePoint,
  TourPackage,
  TourSocial,
  TourSponsor,
} from '~~/types/tour'

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

export async function parseTourBody(event: H3Event, sessionUserId: string) {
  const hubBlob = useHubBlob()
  const contentType = String(getRequestHeader(event, 'content-type') || '').toLowerCase()
  const isMultipart = contentType.includes('multipart/form-data')

  let body: TourCreateBody = {}
  let imagePath: string | null | undefined

  if (isMultipart) {
    const formData = (await readMultipartFormData(event)) ?? []

    const field = (name: string) =>
      formData.find(part => part.name === name && !part.filename)?.data.toString('utf8')

    const imageFile = formData.find(part => part.name === 'imageFile' && part.filename)

    body = {
      name: field('name'),
      description: field('description'),
      location: field('location'),
      date: field('date'),
      price: field('price'),
      featured: field('featured') === undefined ? undefined : field('featured') === 'true',
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

export function buildTourCreateInput(body: TourCreateBody, parsedImagePath?: string | null) {
  let imagePath = parsedImagePath

  const name = normalizeString(body.name, 'name', { required: true })
  const description = normalizeString(body.description, 'description')
  const location = normalizeString(body.location, 'location')
  const date = normalizeDate(body.date, 'date')
  const price = normalizeNumber(body.price, 'price', { required: true, min: 0 })
  const featured = body.featured === undefined ? false : normalizeBoolean(body.featured, 'featured')
  const attendees = normalizeAttendees(body.attendees)
  const sponsors = normalizeSponsors(body.sponsors)
  const packages = normalizePackages(body.packages)
  const departurePoints = normalizeDeparturePoints(body.departure_points)

  if ('image' in body && body.image !== undefined) {
    imagePath = normalizeNullableString(body.image, 'image')
  }

  return {
    name,
    description,
    location,
    date,
    price,
    featured,
    image: imagePath ?? null,
    attendees,
    sponsors,
    packages,
    departure_points: departurePoints,
  }
}

export function buildTourUpdateInput(body: TourCreateBody, imagePath?: string | null) {
  const scalarFieldNormalizers = {
    name: (value: unknown) => normalizeString(value, 'name', { required: true }),
    description: (value: unknown) => normalizeString(value, 'description'),
    location: (value: unknown) => normalizeString(value, 'location'),
    date: (value: unknown) => normalizeDate(value, 'date'),
    price: (value: unknown) => normalizeNumber(value, 'price', { required: true, min: 0 }),
    featured: (value: unknown) => normalizeBoolean(value, 'featured'),
    image: (value: unknown) => normalizeNullableString(value, 'image'),
  } satisfies Record<string, (value: unknown) => unknown>

  const collectionFieldNormalizers = {
    attendees: (value: unknown) => normalizeAttendees(value, { requiredFields: true }),
    sponsors: (value: unknown) => normalizeSponsors(value, { requiredFields: true }),
    packages: (value: unknown) => normalizePackages(value, { requiredFields: true }),
    departure_points: (value: unknown) => normalizeDeparturePoints(value, { requiredFields: true }),
  } satisfies Record<string, (value: unknown) => unknown>

  const update: Record<string, unknown> = {}

  for (const [field, normalize] of Object.entries(scalarFieldNormalizers)) {
    const value = body[field as keyof typeof body]

    if (value !== undefined) {
      update[field] = normalize(value)
    }
  }

  for (const [field, normalize] of Object.entries(collectionFieldNormalizers)) {
    const value = body[field as keyof typeof body]

    if (value !== undefined) {
      update[field] = normalize(value)
    }
  }

  if (imagePath !== undefined) {
    update.image = imagePath
  }

  return update
}
