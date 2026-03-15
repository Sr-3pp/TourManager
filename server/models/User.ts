import mongoose from 'mongoose'
import mongooseBcrypt from 'mongoose-bcrypt'

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    emailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    slug: {
        type: String,
        unique: true,
        index: true,
      sparse: true,
        trim: true,
        lowercase: true,
    }
  },
  {
    collection: 'users',
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

UserSchema.virtual('profile', {
  ref: 'Profile',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
})

UserSchema.plugin(mongooseBcrypt)

export const User =
  (mongoose.models.User as mongoose.Model<any>) || mongoose.model('User', UserSchema)