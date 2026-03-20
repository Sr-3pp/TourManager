export type AuthSessionUser = {
  name: string
  lastname?: string
  username?: string
  email: string
  level: number
}

export type AuthSessionResponse = {
  user: AuthSessionUser
  session: Record<string, unknown>
}
