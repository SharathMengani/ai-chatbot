import { getServerSession } from 'next-auth'


import ChatHistory from '@/app/(backend)/models/ChatHistory'
import { connectDB } from '../../lib/mongodb'

export async function GET() {
  try {
    // CONNECT DB
    await connectDB()

    // GET SESSION
    const session = await getServerSession()

    // AUTH CHECK
    if (!session?.user?.email) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // FIND USER CHAT HISTORY
    const data = await ChatHistory.findOne({
      email: session.user.email,
    })

    // IF NO USER YET
    if (!data) {
      return Response.json({
        conversations: [],
      })
    }

    // RETURN CONVERSATIONS
    return Response.json({
      conversations:
        data.conversations || [],
    })
  } catch (error) {
    console.error(
      'MESSAGES API ERROR:',
      error
    )

    return Response.json(
      {
        error:
          'Failed to fetch conversations',
      },
      {
        status: 500,
      }
    )
  }
}