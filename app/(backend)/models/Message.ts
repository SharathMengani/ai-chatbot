
import mongoose, { Schema, models } from 'mongoose'

const MessageSchema = new Schema(
    {
        role: {
            type: String,
            required: true,
        },

        type: {
            type: String,
            required: true,
        },

        content: {
            type: String,
            required: true,
        },

        userEmail: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

const Message =
    models.Message ||
    mongoose.model('Message', MessageSchema)

export default Message