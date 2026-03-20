import { Tour } from '~~/server/models/Tour'
import { getSessionWithProfile } from '~~/server/utils/auth'
import { buildTourCreateInput, parseTourBody } from '~~/server/services/tour'

export default defineEventHandler(async (event) => {
  const session = await getSessionWithProfile(event)

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const { body, imagePath } = await parseTourBody(event, session.user.id)
  const createInput = buildTourCreateInput(body, imagePath)

  const created = await Tour.create({
    ...createInput,
    creator: session.user.id,
  })

  const populatedTour = await Tour.findById(created._id)
    .populate('creator', 'name username')
    .lean()

  return {
    tour: populatedTour ?? created.toJSON(),
  }
})
