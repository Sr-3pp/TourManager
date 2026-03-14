// server/utils/db.ts
import mongoose from 'mongoose'

declare global {
  // eslint-disable-next-line no-var
  var __mongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  } | undefined
}

const globalMongoose = global.__mongoose || {
  conn: null,
  promise: null,
}

global.__mongoose = globalMongoose

export async function dbConnect() {
  if (globalMongoose.conn) {
    return globalMongoose.conn
  }

  if (!globalMongoose.promise) {
    const config = useRuntimeConfig()
    const uri = config.mongoUri
    const dbName = String(config.mongoDbName || '').trim()

    if (!uri) {
      throw new Error('Missing mongoUri in runtime config')
    }

    globalMongoose.promise = mongoose.connect(uri, {
      bufferCommands: false,
      ...(dbName ? { dbName } : {}),
    })
  }

  globalMongoose.conn = await globalMongoose.promise
  return globalMongoose.conn
}