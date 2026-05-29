import ChatHistory from '@/app/models/ChatHistory'
import { getServerSession } from 'next-auth'

export async function GET() {
  try {
    const session = await getServerSession()

    // 1. NO SESSION
    if (!session?.user?.email) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. FIND USER CHAT HISTORY
    const data = await ChatHistory.findOne({
      email: session.user.email,
    })

    // 3. NO DOCUMENT FOUND
    if (!data) {
      return Response.json([])
    }

    // 4. NO MESSAGES ARRAY OR EMPTY
    if (!data.messages || data.messages.length === 0) {
      return Response.json([])
    }

    // 5. RETURN MESSAGES
    return Response.json(data.messages)
  } catch (error: unknown) {
    let message = 'Something went wrong'

    if (error instanceof Error) {
      message = error.message
    }

    return Response.json(
      { error: message },
      { status: 500 }
    )
  }
}