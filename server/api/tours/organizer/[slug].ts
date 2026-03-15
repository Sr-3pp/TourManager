import { Tour } from '~~/server/models/Tour'
import { User } from '~~/server/models/User'
import { dbConnect } from '~~/server/utils/db'
import { ensureUserSlug } from '~~/server/utils/slug'

function isObjectIdLike(value: string) {
    return /^[a-f0-9]{24}$/i.test(value)
}

export default defineEventHandler(async (event) => {
    await dbConnect()

    const slug = String(getRouterParam(event, 'slug') || '').trim().toLowerCase()

    if (!slug) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Organizer slug is required',
        })
    }

    const organizer = isObjectIdLike(slug)
        ? await User.findById(slug).select('_id slug name')
        : await User.findOne({ slug }).select('_id slug name')

    if (!organizer) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Organizer not found',
        })
    }

    if (!organizer.slug?.trim()) {
        const ensuredSlug = await ensureUserSlug(String(organizer._id), organizer.name)
        if (ensuredSlug) {
            organizer.slug = ensuredSlug
        }
    }

    const tours = await Tour.find({ creator: organizer._id })
        .sort({ date: -1 })
        .populate('creator', 'name slug')
        .lean()

    return {
        organizer,
        tours,
    }
})
