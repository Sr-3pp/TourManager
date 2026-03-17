import '~~/server/models/Profile'
import { User } from '~~/server/models/User'
import { requireUserLevel } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireUserLevel(event, 3)

  const users = await User.find().populate('profile')
  return users
})
