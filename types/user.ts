export type AdminUserProfile = {
  bio?: string
  featured?: boolean
  social?: {
    instagram?: string
    x?: string
    tiktok?: string
  }
}

export type AdminUser = {
  id: string
  _id?: string
  name: string
  lastname?: string
  email: string
  username?: string
  level?: number
  profile?: AdminUserProfile
}

export type AdminUserUpdateBody = {
  name?: string
  lastname?: string
  email?: string
  level?: number
  password?: string
  profile?: AdminUserProfile
}

export type UserEditFormState = {
  name: string
  lastname: string
  email: string
  level: number
  password: string
  confirmPassword: string
  bio: string
  featured: boolean
  instagram: string
  x: string
  tiktok: string
}
