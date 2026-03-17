import { Tour } from '~~/server/models/Tour'
import { dbConnect } from '~~/server/utils/db'

export default defineEventHandler(async () => {
  await dbConnect()

  const tours = await Tour.find({ featured: true })
    .sort({ date: 1 })
    .populate('creator', 'name slug')
    .lean()

  return {
    tours,
  }
})
