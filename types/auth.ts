import type { Profile } from './profile'

export type AuthSessionUser = {
  id?: string
  createdAt?: Date
  updatedAt?: Date
  name: string
  lastname?: string
  username?: string
  email: string
  level: number
  emailVerified?: boolean
  image?: string | null
  profile?: Profile | unknown
  [key: string]: unknown
}

export type AuthSessionResponse = {
  user: AuthSessionUser
  session: Record<string, unknown>
}

export type ServerAuthSession = AuthSessionResponse
