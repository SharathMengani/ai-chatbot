
import mongoose, { Schema, models } from 'mongoose'

const UserSchema = new Schema(
  {
    name: String,
    email: {
      type: String,
      unique: true,
      required: true,
    },
    image: String,
  },
  {
    timestamps: true,
  }
)

const User =
  models.User || mongoose.model('User', UserSchema)

export default User