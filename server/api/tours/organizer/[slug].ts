import type { H3Event } from 'h3'
import { Tour } from '~~/server/models/Tour'
import mongoose from 'mongoose'
import { User } from '~~/server/models/User'
import { dbConnect } from '~~/server/utils/db'
import { ensureUserSlug } from '~~/server/utils/slug'

function isObjectIdLike(value: string) {
    return /^[a-f0-9]{24}$/i.test(value)
}

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getSlugFromRequest(event: H3Event) {
    const routeSlug = getRouterParam(event, 'slug')

    if (routeSlug) {
        return String(routeSlug).trim().toLowerCase()
    }

    const pathname = getRequestURL(event).pathname
    const segments = pathname.split('/').filter(Boolean)
    const lastSegment = segments.at(-1)

    return String(lastSegment || '').trim().toLowerCase()
}

async function findOrganizerBySlugOrName(slug: string) {
    const bySlug = await User.findOne({ slug }).select('_id slug name')

    if (bySlug) {
        return bySlug
    }

    const normalizedPattern = escapeRegex(slug).replace(/-/g, '[\\s-]+')
    return User.findOne({
        name: {
            $regex: new RegExp(`^${normalizedPattern}$`, 'i'),
        },
    }).select('_id slug name')
}

async function findOrganizerBySlugOrNameRaw(slug: string) {
    const db = mongoose.connection.db

    if (!db) {
        return null
    }

    const normalizedPattern = escapeRegex(slug).replace(/-/g, '[\\s-]+')
    const doc = await db.collection('users').findOne({
        $or: [
            { slug },
            {
                name: {
                    $regex: new RegExp(`^${normalizedPattern}$`, 'i'),
                },
            },
        ],
    })

    if (!doc?._id) {
        return null
    }

    return User.findById(doc._id).select('_id slug name')
}

export default defineEventHandler(async (event) => {
    await dbConnect()

    const slug = getSlugFromRequest(event)

    if (!slug) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Organizer slug is required',
        })
    }

    const organizer = isObjectIdLike(slug)
        ? await User.findById(slug).select('_id slug name')
        : (await findOrganizerBySlugOrName(slug)) || (await findOrganizerBySlugOrNameRaw(slug))

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
