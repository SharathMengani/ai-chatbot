import OpenAI from 'openai'

import { getServerSession } from 'next-auth'
import { connectDB } from '@/app/lib/mongodb'
import ChatHistory from '@/app/models/ChatHistory'

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL:
    'https://generativelanguage.googleapis.com/v1beta/openai/',
})

export async function POST(req: Request) {
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

    // BODY
    const body = await req.json()

    const message: string = body.message
    const conversationId: string =
      body.conversationId

    if (!message) {
      return Response.json(
        {
          error: 'Message is required',
        },
        {
          status: 400,
        }
      )
    }

    if (!conversationId) {
      return Response.json(
        {
          error: 'Conversation ID is required',
        },
        {
          status: 400,
        }
      )
    }

    const lower = message.toLowerCase()

    const imageKeywords = [
      'generate image',
      'create image',
      'draw',
      'make image',
      'image of',
    ]

    const wantsImage = imageKeywords.some(
      (word) => lower.includes(word)
    )

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

    // SAVE USER MESSAGE
    await ChatHistory.updateOne(
      {
        email: session.user.email,
        'conversations._id': conversationId,
      },
      {
        $push: {
          'conversations.$.messages': {
            role: 'user',
            type: 'text',
            content: message,
            createdAt: new Date(),
          },
        },
      }
    )
    // 👇 ADD HERE
    await ChatHistory.updateOne(
      {
        email: session.user.email,
        'conversations._id': conversationId,
        'conversations.title': 'New Chat',
      },
      {
        $set: {
          'conversations.$.title':
            message.slice(0, 40),
        },
      }
    )
    // IMAGE FLOW
    if (wantsImage) {
      const imageReply =
        'Image generation is not enabled in this setup.'

      // SAVE ASSISTANT MESSAGE
      await ChatHistory.updateOne(
        {
          email: session.user.email,
          'conversations._id': conversationId,
        },
        {
          $push: {
            'conversations.$.messages': {
              role: 'assistant',
              type: 'text',
              content: imageReply,
              createdAt: new Date(),
            },
          },
        }
      )

      return Response.json({
        reply: imageReply,
      })
    }

    // AI RESPONSE
    const completion =
      await openai.chat.completions.create({
        model: 'gemini-2.5-flash',

        messages: [
          {
            role: 'system',
            content:
              'You are a helpful AI assistant.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
      })

    const aiReply =
      completion.choices?.[0]?.message?.content ||
      'No response generated.'

    // SAVE AI MESSAGE
    await ChatHistory.updateOne(
      {
        email: session.user.email,
        'conversations._id': conversationId,
      },
      {
        $push: {
          'conversations.$.messages': {
            role: 'assistant',
            type: 'text',
            content: aiReply,
            createdAt: new Date(),
          },
        },
      }
    )

    return Response.json({
      reply: aiReply,
    })
  } catch (error: unknown) {
    let errorMessage = 'Something went wrong'

    if (error instanceof Error) {
      console.error('Chat API Error:', error.message)

      errorMessage = error.message
    }

    return Response.json(
      {
        error: errorMessage,
      },
      {
        status: 500,
      }
    )
  }
}