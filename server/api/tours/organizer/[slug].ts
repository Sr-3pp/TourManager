import type { H3Event } from 'h3'
import { Tour } from '~~/server/models/Tour'
import mongoose from 'mongoose'
import { User } from '~~/server/models/User'
import { dbConnect } from '~~/server/utils/db'
import { ensureUsername } from '~~/server/utils/username'

function isObjectIdLike(value: string) {
    return /^[a-f0-9]{24}$/i.test(value)
}

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getUsernameFromRequest(event: H3Event) {
    const routeSlug = getRouterParam(event, 'slug')

    if (routeSlug) {
        return String(routeSlug).trim().toLowerCase()
    }

    const pathname = getRequestURL(event).pathname
    const segments = pathname.split('/').filter(Boolean)
    const lastSegment = segments.at(-1)

    return String(lastSegment || '').trim().toLowerCase()
}

async function findOrganizerByUsernameOrName(username: string) {
    const byUsername = await User.findOne({ username }).select('_id username name')

    if (byUsername) {
        return byUsername
    }

    const normalizedPattern = escapeRegex(username).replace(/-/g, '[\\s-]+')
    return User.findOne({
        name: {
            $regex: new RegExp(`^${normalizedPattern}$`, 'i'),
        },
    }).select('_id username name')
}

async function findOrganizerByUsernameOrNameRaw(username: string) {
    const db = mongoose.connection.db

    if (!db) {
        return null
    }

    const normalizedPattern = escapeRegex(username).replace(/-/g, '[\\s-]+')
    const doc = await db.collection('users').findOne({
        $or: [
            { username },
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

    return User.findById(doc._id).select('_id username name')
}

export default defineEventHandler(async (event) => {
    await dbConnect()

    const username = getUsernameFromRequest(event)

    if (!username) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Organizer username is required',
        })
    }

    const organizer = isObjectIdLike(username)
        ? await User.findById(username).select('_id username name')
        : (await findOrganizerByUsernameOrName(username)) || (await findOrganizerByUsernameOrNameRaw(username))

    if (!organizer) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Organizer not found',
        })
    }

    if (!organizer.username?.trim()) {
        const ensuredUsername = await ensureUsername(String(organizer._id), organizer.name)
        if (ensuredUsername) {
            organizer.username = ensuredUsername
        }
    }

    const tours = await Tour.find({ creator: organizer._id })
        .sort({ date: -1 })
        .populate('creator', 'name username')
        .lean()

    return {
        organizer,
        tours,
    }
})
