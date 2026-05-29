import { getServerSession } from 'next-auth'
import { connectDB } from '@/app/lib/mongodb'
import ChatHistory from '@/app/models/ChatHistory'

export async function POST() {
  await connectDB()

  const session = await getServerSession()

  if (!session?.user?.email) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const newConversation = {
    title: 'New Chat',
    messages: [],
    createdAt: new Date(),
  }

  const updated = await ChatHistory.findOneAndUpdate(
    {
      email: session.user.email,
    },
    {
      $push: {
        conversations: newConversation,
      },
    },
    {
      upsert: true,
      new: true,
    }
  )

  const conversation =
    updated.conversations[
      updated.conversations.length - 1
    ]

  return Response.json(conversation)
}