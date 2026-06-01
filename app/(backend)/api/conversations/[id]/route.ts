import { getServerSession } from 'next-auth'

import ChatHistory from '@/app/(backend)/models/ChatHistory'
import { connectDB } from '@/app/(backend)/lib/mongodb'

type Params = {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(
  req: Request,
  { params }: Params
) {
  try {
    await connectDB()

    const session = await getServerSession()

    // AUTH CHECK
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

    const { id } = await params

    // REMOVE CONVERSATION
    await ChatHistory.updateOne(
      {
        email: session.user.email,
      },
      {
        $pull: {
          conversations: {
            _id: id,
          },
        },
      }
    )

    return Response.json({
      success: true,
    })
  } catch (error) {
    console.error(error)

    return Response.json(
      {
        error:
          'Failed to delete conversation',
      },
      {
        status: 500,
      }
    )
  }
}