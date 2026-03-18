import '~~/server/models/Profile'
import '~~/server/models/User'
import { Profile } from '~~/server/models/Profile'
import { Tour } from '~~/server/models/Tour'
import { dbConnect } from '~~/server/utils/db'
import { ensureUsername } from '~~/server/utils/username'
import mongoose from 'mongoose'

export default defineEventHandler(async () => {
  await dbConnect()

  const featuredProfiles = await Profile.find({ featured: true })
    .sort({ updatedAt: -1, _id: -1 })
    .populate('user', 'name username')
    .lean()

  const organizerIds = featuredProfiles
    .map(profile => String(profile.user?._id || profile.user || ''))
    .filter(Boolean)

  const counts = organizerIds.length
    ? await Tour.aggregate([
      {
        $match: {
          creator: {
            $in: organizerIds.map(id => new mongoose.Types.ObjectId(id)),
          },
        },
      },
      {
        $group: {
          _id: '$creator',
          total: { $sum: 1 },
        },
      },
    ])
    : []

  const countsByUserId = Object.fromEntries(
    counts.map(entry => [String(entry._id), Number(entry.total || 0)]),
  )

  const organizers = await Promise.all(
    featuredProfiles
      .filter(profile => profile.user && typeof profile.user === 'object')
      .map(async (profile) => {
        const user = profile.user as { _id?: string; name?: string; username?: string }
        const userId = String(user._id || '')
        const ensuredUsername = userId ? await ensureUsername(userId, user.name) : user.username

        return {
          profile: {
            ...profile,
            user: userId,
          },
          toursCount: countsByUserId[userId] ?? 0,
          user: {
            id: userId,
            name: user.name,
            username: ensuredUsername || user.username,
          },
        }
      }),
  )

  return {
    organizers,
  }
})
