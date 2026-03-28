import type mongoose from 'mongoose'

export type UserDocument = {
  name: string
  lastname: string
  email: string
  emailVerified: boolean
  username?: string
  level: number
}

export type ProfileDocument = {
  user: mongoose.Types.ObjectId
  bio: string
  featured: boolean
  social: {
    instagram: string
    x: string
    tiktok: string
  }
  picture: string | null
  banner: string | null
}

export type TourSocialDocument = {
  instagram: string
  x: string
  tiktok: string
}

export type TourAttendeeDocument = {
  name: string
  email: string
  social: TourSocialDocument
}

export type TourSponsorDocument = {
  packageLevel: string
  name: string
  logo: string | null
  website: string
  social: TourSocialDocument
}

export type TourPackageDocument = {
  level: number
  name: string
  description: string
  price: number
  benefits: string[]
}

export type TourDeparturePointDocument = {
  name: string
  location: string
  dateTime: Date
  notes: string
}

export type TourDocument = {
  name: string
  description: string
  date: Date
  location: string
  image: string | null
  featured: boolean
  creator: mongoose.Types.ObjectId
  price: number
  attendees: TourAttendeeDocument[]
  sponsors: TourSponsorDocument[]
  packages: TourPackageDocument[]
  departure_points: TourDeparturePointDocument[]
}
