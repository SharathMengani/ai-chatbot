import mongoose, { Schema, models } from 'mongoose'

const MessageSchema = new Schema(
  {
    role: String,
    type: String,
    content: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
)

const ChatHistorySchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    messages: [MessageSchema],
  },
  { timestamps: true }
)

const ChatHistory =
  models.ChatHistory ||
  mongoose.model('ChatHistory', ChatHistorySchema)

export default ChatHistory