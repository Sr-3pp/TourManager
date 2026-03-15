import mongoose from 'mongoose'

const TourSchema = new mongoose.Schema(
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
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
  mongoose.models.Tour || mongoose.model('Tour', TourSchema)