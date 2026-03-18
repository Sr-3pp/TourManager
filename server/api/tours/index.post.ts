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
  const session = await getSessionWithProfile(event)

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const { body, imagePath: parsedImagePath } = await parseTourBody(event, session.user.id)
  let imagePath = parsedImagePath

  const name = normalizeString(body.name, 'name', { required: true })
  const description = normalizeString(body.description, 'description')
  const location = normalizeString(body.location, 'location')
  const date = normalizeDate(body.date, 'date')
  const featured = body.featured === undefined ? false : normalizeBoolean(body.featured, 'featured')
  const attendees = normalizeAttendees(body.attendees)
  const sponsors = normalizeSponsors(body.sponsors)
  const packages = normalizePackages(body.packages)
  const departurePoints = normalizeDeparturePoints(body.departure_points)

  if ('image' in body && body.image !== undefined) {
    imagePath = normalizeNullableString(body.image, 'image')
  }

  const created = await Tour.create({
    name,
    description,
    location,
    date,
    featured,
    image: imagePath ?? null,
    creator: session.user.id,
    attendees,
    sponsors,
    packages,
    departure_points: departurePoints,
  })

  const populatedTour = await Tour.findById(created._id)
    .populate('creator', 'name username')
    .lean()

  return {
    tour: populatedTour ?? created.toJSON(),
  }
})
