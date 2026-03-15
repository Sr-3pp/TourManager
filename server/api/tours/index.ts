import { Tour } from '~~/server/models/Tour'

export default defineEventHandler(async () => {
  const tours = await Tour.find()
    .sort({ date: -1 })
    .populate('creator', 'name slug')
    .lean()

  return {
    tours,
  }
})
