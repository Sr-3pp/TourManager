import mongoose from 'mongoose'
import { dbConnect } from '~~/server/utils/db'

const AUTH_COLLECTIONS = ['users', 'sessions', 'accounts', 'verifications'] as const

type CollectionHealth = {
  collection: string
  ok: boolean
  error?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const configuredDbName = String(config.mongoDbName || '').trim() || null

  await dbConnect()

  const db = mongoose.connection.db
  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Mongoose connection has no db instance',
    })
  }

  const checks: CollectionHealth[] = []

  for (const collection of AUTH_COLLECTIONS) {
    try {
      // A minimal read operation to confirm collection-level permission.
      await db.collection(collection).findOne({}, { projection: { _id: 1 } })
      checks.push({ collection, ok: true })
    } catch (error) {
      checks.push({
        collection,
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  const ok = checks.every((check) => check.ok)
  if (!ok) {
    setResponseStatus(event, 503)
  }

  return {
    ok,
    configuredDatabase: configuredDbName,
    database: db.databaseName,
    databaseMatchesConfig: configuredDbName ? db.databaseName === configuredDbName : null,
    checkedAt: new Date().toISOString(),
    collections: checks,
  }
})
