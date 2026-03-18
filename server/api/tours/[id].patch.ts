import { Tour } from '~~/server/models/Tour'
import { getSessionWithProfile } from '~~/server/utils/auth'
import {
  normalizeAttendees,
  normalizeBoolean,
  normalizeDate,
  normalizeDeparturePoints,
  normalizeNullableString,
  normalizeNumber,
  normalizePackages,
  normalizeSponsors,
  normalizeString,
  parseTourBody,
} from '~~/server/utils/tour'

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

export default defineEventHandler(async (event) => {
  const id = String(getRouterParam(event, 'id') || '').trim()

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tour id is required',
    })
  }

  const session = await getSessionWithProfile(event)

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const existingTour = await Tour.findOne({ _id: id }).select('creator')

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

  const { body, imagePath } = await parseTourBody(event, session.user.id)

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

  const updated = await Tour.findOneAndUpdate(
    { _id: id },
    {
      ...(Object.keys(update).length > 0 ? { $set: update } : {}),
    },
    {
      returnDocument: 'after',
      runValidators: true,
    },
  )
    .populate('creator', 'name username')
    .lean()

  return {
    tour: updated,
  }
})
