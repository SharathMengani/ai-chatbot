
import { getServerSession } from 'next-auth'

import { connectDB } from '@/app/lib/mongodb'
import ChatHistory from '@/app/models/ChatHistory'

export async function POST() {
  try {
    await connectDB()

    const session = await getServerSession()

    if (!session?.user?.email) {
      return Response.json(
        {
          error: 'Unauthorized',
        },
        {
          status: 401,
        }
      )
    }

    // ENSURE USER EXISTS
    await ChatHistory.findOneAndUpdate(
      {
        email: session.user.email,
      },
      {
        $setOnInsert: {
          email: session.user.email,
          conversations: [],
        },
      },
      {
        upsert: true,
      }
    )

    // CREATE CONVERSATION
    await ChatHistory.updateOne(
      {
        email: session.user.email,
      },
      {
        $push: {
          conversations: {
            title: 'New Chat',
            messages: [],
            createdAt: new Date(),
          },
        },
      }
    )

    // GET UPDATED USER
    const updatedUser =
      await ChatHistory.findOne({
        email: session.user.email,
      })

    // LAST CREATED CONVERSATION
    const conversation =
      updatedUser?.conversations?.[
        updatedUser.conversations.length - 1
      ]

    return Response.json({
      conversation,
    })
  } catch (error) {
    console.error(error)

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Something went wrong',
      },
      {
        status: 500,
      }
    )
  }
}
