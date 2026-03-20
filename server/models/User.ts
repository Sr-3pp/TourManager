import mongoose from 'mongoose'
import type { UserDocument } from '~~/types/models'

const UserSchema = new mongoose.Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      default: '',
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
    username: {
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

export const User =
  (mongoose.models.User as mongoose.Model<UserDocument>) || mongoose.model<UserDocument>('User', UserSchema)
