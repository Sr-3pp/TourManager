// server/utils/auth.ts
import { betterAuth, type BetterAuthOptions } from 'better-auth'
import { getHeaders, type H3Event } from 'h3'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import mongoose from 'mongoose'
import { Profile } from '~~/server/models/Profile'
import { User } from '~~/server/models/User'
import type { ServerAuthSession } from '~~/types/auth'
import { ensureUsername } from '~~/server/utils/username'
import { dbConnect } from './db'

let authInstance: ReturnType<typeof betterAuth> | null = null

function parseList(value: string | undefined) {
  return (value ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

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

  const runtimeConfig = useRuntimeConfig()
  const allowedHosts = parseList(runtimeConfig.betterAuthAllowedHosts)
  const trustedOrigins = parseList(runtimeConfig.betterAuthTrustedOrigins)

  // Ensure mongoose connection exists
  await dbConnect()

  const db = mongoose.connection.db
  if (!db) {
    throw new Error('Mongoose connection has no db instance')
  }

  const authOptions: BetterAuthOptions = {
    baseURL: allowedHosts.length > 0
      ? {
          allowedHosts,
          fallback: runtimeConfig.betterAuthUrl || undefined,
        }
      : runtimeConfig.betterAuthUrl || undefined,
    trustedOrigins,
    secret: runtimeConfig.betterAuthSecret,
    database: mongodbAdapter(db, {
      client: mongoose.connection.getClient(),
      usePlural: true,
    }),

    user: {
      additionalFields: {
        username: {
          type: 'string',
          required: false,
        },
        lastname: {
          type: 'string',
          required: false,
          defaultValue: '',
        },
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
            await ensureUsername(user.id, user.name)
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

export async function getSessionWithProfile(event: H3Event): Promise<ServerAuthSession | null> {
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

  await ensureUsername(session.user.id, session.user.name)
  await ensureProfileForUser(session.user.id)

  const user = await User.findById(session.user.id).populate('profile')
  const sessionUserRecord = session.user as Record<string, unknown>
  const resolvedUser = user
    ? { ...session.user, ...user.toJSON() }
    : { ...session.user, level: Number(sessionUserRecord.level ?? 1) }

  return {
    ...session,
    user: {
      ...resolvedUser,
      level: Number(resolvedUser.level ?? 1),
    },
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
