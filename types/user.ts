export type AdminUserProfile = {
  bio?: string
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
  email: string
  level?: number
  profile?: AdminUserProfile
}

export type AdminUserUpdateBody = {
  name?: string
  email?: string
  level?: number
  password?: string
  profile?: AdminUserProfile
}

export type UserEditFormState = {
  name: string
  email: string
  level: number
  password: string
  confirmPassword: string
  bio: string
  instagram: string
  x: string
  tiktok: string
}
