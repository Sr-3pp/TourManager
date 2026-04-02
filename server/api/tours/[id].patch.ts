import { Tour } from '~~/server/models/Tour'
import { buildTourUpdateInput, parseTourBody } from '~~/server/services/tour'
import { getSessionWithProfile } from '~~/server/utils/auth'

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
  const update = buildTourUpdateInput(body, imagePath)

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
