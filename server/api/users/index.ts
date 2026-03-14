import '~~/server/models/Profile'
import { User } from '~~/server/models/User'

export default defineEventHandler(async () => {
  const users = await User.find().populate('profile')
  return users
})