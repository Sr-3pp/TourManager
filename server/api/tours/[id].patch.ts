import { Tour } from '~~/server/models/Tour'
import { getSessionWithProfile } from '~~/server/utils/auth'
import {
  normalizeAttendees,
  normalizeBoolean,
  normalizeDate,
  normalizeDeparturePoints,
  normalizeNullableString,
  normalizePackages,
  normalizeSponsors,
  normalizeString,
  parseTourBody,
} from '~~/server/utils/tour'

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

  if ('name' in body && body.name !== undefined) {
    update.name = normalizeString(body.name, 'name', { required: true })
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

  if ('featured' in body && body.featured !== undefined) {
    update.featured = normalizeBoolean(body.featured, 'featured')
  }

  if ('image' in body && body.image !== undefined) {
    update.image = normalizeNullableString(body.image, 'image')
  }

  if ('attendees' in body && body.attendees !== undefined) {
    update.attendees = normalizeAttendees(body.attendees, { requiredFields: true })
  }

  if ('sponsors' in body && body.sponsors !== undefined) {
    update.sponsors = normalizeSponsors(body.sponsors, { requiredFields: true })
  }

  if ('packages' in body && body.packages !== undefined) {
    update.packages = normalizePackages(body.packages, { requiredFields: true })
  }

  if ('departure_points' in body && body.departure_points !== undefined) {
    update.departure_points = normalizeDeparturePoints(body.departure_points, { requiredFields: true })
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
      new: true,
      runValidators: true,
    },
  )
    .populate('creator', 'name slug')
    .lean()

  return {
    tour: updated,
  }
})
