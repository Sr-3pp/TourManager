import { getSessionWithProfile } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const session = await getSessionWithProfile(event)

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  return session
})