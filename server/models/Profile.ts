import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
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
    },
    picture: {
      type: String,
      default: null,
    },
    banner: {
      type: String,
      default: null,
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    }
  }
)

export const Profile =
    (mongoose.models.Profile as mongoose.Model<any>) || mongoose.model('Profile', ProfileSchema)
