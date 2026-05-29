
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

    if (!session?.user?.email) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const message: string = body.message

    if (!message) {
      return Response.json(
        { error: 'Message is required' },
        { status: 400 }
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

    const wantsImage = imageKeywords.some((word) =>
      lower.includes(word)
    )

    // ensure user doc exists
    await ChatHistory.findOneAndUpdate(
      { email: session.user.email },
      {
        $setOnInsert: {
          email: session.user.email,
          messages: [],
        },
      },
      { upsert: true }
    )

    // save USER message
    await ChatHistory.updateOne(
      { email: session.user.email },
      {
        $push: {
          messages: {
            role: 'user',
            type: 'text',
            content: message,
            createdAt: new Date(),
          },
        },
      }
    )

    // IMAGE FLOW
    if (wantsImage) {
      const imageReply =
        'Image generation is not enabled in this setup.'

      await ChatHistory.updateOne(
        { email: session.user.email },
        {
          $push: {
            messages: {
              role: 'assistant',
              type: 'text',
              content: imageReply,
              createdAt: new Date(),
            },
          },
        }
      )

      return Response.json({ reply: imageReply })
    }

    // AI RESPONSE
    const completion =
      await openai.chat.completions.create({
        model: 'gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant.',
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

    // save AI message
    await ChatHistory.updateOne(
      { email: session.user.email },
      {
        $push: {
          messages: {
            role: 'assistant',
            type: 'text',
            content: aiReply,
            createdAt: new Date(),
          },
        },
      }
    )

    return Response.json({ reply: aiReply })
  } catch (error: unknown) {
    let errorMessage = 'Something went wrong'

    if (error instanceof Error) {
      console.error('Error:', error.message)
      errorMessage = error.message
    }

    return Response.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
