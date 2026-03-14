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
    // Optional for OAuth-only users; hashed automatically by mongoose-bcrypt.
    password: {
      type: String,
      bcrypt: true,
      select: false,
    },
    emailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    level: {
        type: Number,
        required: true,
        default: 1,
    }
  },
  {
    collection: 'users',
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        const { _id, password, ...clean } = ret
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