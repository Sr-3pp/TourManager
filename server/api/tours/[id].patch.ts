import { Tour } from '~~/server/models/Tour'
import { getSessionWithProfile } from '~~/server/utils/auth'
import {
  compressProfileImageForUpload,
  MAX_PROFILE_UPLOAD_SOURCE_BYTES,
} from '~~/server/utils/image'
import { useHubBlob } from '~~/server/utils/r2'
import type { TourUpdateBody } from '~~/types/tour'

function normalizeString(value: unknown, field: string) {
  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: `${field} must be a string`,
    })
  }

  return value.trim()
}

function normalizeNullableString(value: unknown, field: string) {
  if (value === null) {
    return null
  }

  return normalizeString(value, field)
}

function normalizeDate(value: unknown, field: string) {
  const dateString = normalizeString(value, field)
  const parsed = new Date(dateString)

  if (Number.isNaN(parsed.getTime())) {
    throw createError({
      statusCode: 400,
      statusMessage: `${field} must be a valid date`,
    })
  }

  return parsed
}

function parseMultipartJson(value: string | undefined, field: string) {
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

function normalizeSocial(value: unknown, field: string) {
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

function normalizeAttendees(value: unknown) {
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
      name: normalizeString(attendee.name, `attendees[${index}].name`),
      email: normalizeString(attendee.email, `attendees[${index}].email`),
      social: normalizeSocial(attendee.social, `attendees[${index}].social`),
    }
  })
}

function normalizeSponsors(value: unknown) {
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
      packageLevel: normalizeString(sponsor.packageLevel, `sponsors[${index}].packageLevel`),
      name: normalizeString(sponsor.name, `sponsors[${index}].name`),
      logo: sponsor.logo === null ? null : normalizeString(sponsor.logo ?? '', `sponsors[${index}].logo`),
      website: normalizeString(sponsor.website ?? '', `sponsors[${index}].website`),
      social: normalizeSocial(sponsor.social, `sponsors[${index}].social`),
    }
  })
}

function normalizePackages(value: unknown) {
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

    const benefitsRaw = pkg.benefits
    if (!Array.isArray(benefitsRaw)) {
      throw createError({
        statusCode: 400,
        statusMessage: `packages[${index}].benefits must be an array`,
      })
    }

    return {
      level,
      name: normalizeString(pkg.name, `packages[${index}].name`),
      description: normalizeString(pkg.description ?? '', `packages[${index}].description`),
      price,
      benefits: benefitsRaw.map((benefit, benefitIndex) =>
        normalizeString(benefit, `packages[${index}].benefits[${benefitIndex}]`),
      ),
    }
  })
}

function normalizeDeparturePoints(value: unknown) {
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
      name: normalizeString(point.name, `departure_points[${index}].name`),
      location: normalizeString(point.location ?? '', `departure_points[${index}].location`),
      dateTime: normalizeDate(point.dateTime, `departure_points[${index}].dateTime`),
      notes: normalizeString(point.notes ?? '', `departure_points[${index}].notes`),
    }
  })
}

export default defineEventHandler(async (event) => {
  const id = String(getRouterParam(event, 'id') || '').trim()

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tour id is required',
    })
  }

  const session = await getSessionWithProfile(event)
  const hubBlob = useHubBlob()

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const existingTour = await Tour.findById(id).select('creator')

  if (!existingTour) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tour not found',
    })
  }

  if (String(existingTour.creator) !== session.user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  }

  const contentType = String(getRequestHeader(event, 'content-type') || '').toLowerCase()
  const isMultipart = contentType.includes('multipart/form-data')

  let body: TourUpdateBody = {}
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
          prefix: `tours/${session.user.id}`,
          contentType: compressedImage.contentType,
        },
      )
      imagePath = upload.pathname
    }
  } else {
    body = (await readBody<TourUpdateBody>(event)) ?? {}
  }

  const update: Record<string, unknown> = {}

  if ('name' in body && body.name !== undefined) {
    update.name = normalizeString(body.name, 'name')
  }

  if ('description' in body && body.description !== undefined) {
    update.description = normalizeString(body.description, 'description')
  }

  if ('location' in body && body.location !== undefined) {
    update.location = normalizeString(body.location, 'location')
  }

  if ('date' in body && body.date !== undefined) {
    update.date = normalizeDate(body.date, 'date')
  }

  if ('image' in body && body.image !== undefined) {
    update.image = normalizeNullableString(body.image, 'image')
  }

  if ('attendees' in body && body.attendees !== undefined) {
    update.attendees = normalizeAttendees(body.attendees)
  }

  if ('sponsors' in body && body.sponsors !== undefined) {
    update.sponsors = normalizeSponsors(body.sponsors)
  }

  if ('packages' in body && body.packages !== undefined) {
    update.packages = normalizePackages(body.packages)
  }

  if ('departure_points' in body && body.departure_points !== undefined) {
    update.departure_points = normalizeDeparturePoints(body.departure_points)
  }

  if (imagePath !== undefined) {
    update.image = imagePath
  }

  const updated = await Tour.findByIdAndUpdate(
    id,
    {
      ...(Object.keys(update).length > 0 ? { $set: update } : {}),
    },
    {
      new: true,
      runValidators: true,
    },
  ).lean()

  return {
    tour: updated,
  }
})
