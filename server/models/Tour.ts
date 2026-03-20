import mongoose from 'mongoose'

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

const TourSchema = new mongoose.Schema<TourDocument>(
  {
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
        trim: true,
    },
    date: {
        type: Date,
        required: true,
    },
    location: {
        type: String,
        default: '',
        trim: true,
    },
    image: {
        type: String,
        default: null,
    },
    featured: {
        type: Boolean,
        default: false,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
     attendees: [{
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        social: {
            instagram: {
                type: String,
                default: '',
                trim: true,
            },
            x: {
                type: String,
                default: '',
                trim: true,
            },
            tiktok: {
                type: String,
                default: '',
                trim: true,
            }
        }
    }],
    sponsors: [{
        packageLevel: {
            type: String,
            required: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        logo: {
            type: String,
            default: null,
        },
        website: {
            type: String,
            default: '',
            trim: true,
        },
        social: {
            instagram: {
                type: String,
                default: '',
                trim: true,
            },
            x: {
                type: String,
                default: '',
                trim: true,
            },
            tiktok: {
                type: String,
                default: '',
                trim: true,
            }
        }
    }],
    packages: [{
        level: {
            type: Number,
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: '',
            trim: true,
        },
        price: {
            type: Number,
            required: true,
        },
        benefits: [{
            type: String,
            required: true,
            trim: true,
        }],
    }],
    departure_points: [{
        name: {
            type: String,
            required: true,
            trim: true,
        },
        location: {
            type: String,
            default: '',
            trim: true,
        },
        dateTime: {
            type: Date,
            required: true,
        },
        notes: {
            type: String,
            default: '',
            trim: true,
        }
    }]
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        const { _id, ...clean } = ret
        return clean
      },
    },
    toObject: {
      virtuals: true,
    },
  }
)

export const Tour =
  (mongoose.models.Tour as mongoose.Model<TourDocument>) || mongoose.model<TourDocument>('Tour', TourSchema)
