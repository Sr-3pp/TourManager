// server/utils/auth.ts
import { betterAuth, type BetterAuthOptions } from 'better-auth'
import { getHeaders, type H3Event } from 'h3'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import mongoose from 'mongoose'
import { Profile } from '~~/server/models/Profile'
import { User } from '~~/server/models/User'
import { ensureUserSlug } from '~~/server/utils/slug'
import { dbConnect } from './db'

let authInstance: ReturnType<typeof betterAuth> | null = null

export async function ensureProfileForUser(userId: string) {
  await dbConnect()

  return Profile.findOneAndUpdate(
    { user: userId },
    {
      $setOnInsert: {
        user: userId,
      },
    },
    {
      returnDocument: 'after',
      runValidators: true,
      setDefaultsOnInsert: true,
      upsert: true,
    }
  )
}

export async function getAuth() {
  if (authInstance) {
    return authInstance
  }

  // Ensure mongoose connection exists
  await dbConnect()

  const db = mongoose.connection.db
  if (!db) {
    throw new Error('Mongoose connection has no db instance')
  }

  const authOptions: BetterAuthOptions = {
    database: mongodbAdapter(db, {
      client: mongoose.connection.getClient(),
      usePlural: true,
    }),

    user: {
      additionalFields: {
        level: {
          type: 'number',
          required: false,
          defaultValue: 1,
          input: false,
        },
      },
    },

    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await ensureUserSlug(user.id, user.name)
            await ensureProfileForUser(user.id)
          },
        },
      },
    },

    emailAndPassword: {
      enabled: true,
    },

    session: {
      cookieCache: {
        enabled: true,
      },
    },
  }

  authInstance = betterAuth(authOptions)

  return authInstance
}

export async function getSessionWithProfile(event: H3Event) {
  const auth = await getAuth()
  const headers = new Headers(
    Object.entries(getHeaders(event)).flatMap(([key, value]) =>
      value === undefined ? [] : [[key, value] as [string, string]]
    )
  )

  const session = await auth.api.getSession({
    headers,
  })

  if (!session) {
    return null
  }

  await ensureUserSlug(session.user.id, session.user.name)
  await ensureProfileForUser(session.user.id)

  const user = await User.findById(session.user.id).populate('profile')

  return {
    ...session,
    user: user ? { ...session.user, ...user.toJSON() } : session.user,
  }
}

export async function requireUserLevel(event: H3Event, level: number) {
  const session = await getSessionWithProfile(event)

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  if (Number(session.user.level) !== level) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  }

  return session
}
