import mongoose, { Schema } from 'mongoose'

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
  {
    _id: true,
  }
)

const ConversationSchema = new Schema(
  {
    title: {
      type: String,
      default: 'New Chat',
    },

    messages: [MessageSchema],

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
)

const ChatHistorySchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },

  conversations: [ConversationSchema],
})

export default mongoose.models.ChatHistory ||
  mongoose.model(
    'ChatHistory',
    ChatHistorySchema
  )