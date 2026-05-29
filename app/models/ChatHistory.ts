import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({
  role: String,
  type: String,
  content: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const ConversationSchema =
  new mongoose.Schema({
    title: {
      type: String,
      default: 'New Chat',
    },

    messages: [MessageSchema],

    createdAt: {
      type: Date,
      default: Date.now,
    },
  })

const ChatHistorySchema =
  new mongoose.Schema({
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