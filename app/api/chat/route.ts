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

    // AUTH
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
    let conversationId: string =
      body.conversationId

    if (!message?.trim()) {
      return Response.json(
        {
          error: 'Message is required',
        },
        {
          status: 400,
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
        new: true,
      }
    )

    // AUTO CREATE CONVERSATION
    // AUTO CREATE CONVERSATION
    if (!conversationId) {
      // ✅ FIRST CHECK EMPTY CHAT EXISTS
      const existingUser =
        await ChatHistory.findOne({
          email: session.user.email,
        })

      const emptyConversation =
        existingUser?.conversations?.find(
          (c: any) =>
            !c.messages ||
            c.messages.length === 0
        )

      // ✅ REUSE EMPTY CHAT
      if (emptyConversation) {
        conversationId =
          emptyConversation._id.toString()
      } else {
        // ✅ CREATE NEW CHAT ONLY ONCE
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

        // GET NEW CHAT
        const updatedUser =
          await ChatHistory.findOne({
            email: session.user.email,
          })

        const latestConversation =
          updatedUser?.conversations?.[
          updatedUser.conversations.length -
          1
          ]

        conversationId =
          latestConversation?._id?.toString()
      }
    }

    // FINAL SAFETY CHECK
    if (!conversationId) {
      return Response.json(
        {
          error:
            'Failed to create conversation',
        },
        {
          status: 500,
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

    // SAVE USER MESSAGE
    await ChatHistory.updateOne(
      {
        email: session.user.email,
        'conversations._id':
          conversationId,
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

    // UPDATE TITLE IF "New Chat"
    await ChatHistory.updateOne(
      {
        email: session.user.email,
        'conversations._id':
          conversationId,
        'conversations.title':
          'New Chat',
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

      await ChatHistory.updateOne(
        {
          email: session.user.email,
          'conversations._id':
            conversationId,
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
        conversationId,
      })
    }

    // AI RESPONSE
    let aiReply = ''

    try {
      const completion =
        await openai.chat.completions.create(
          {
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
          }
        )

      aiReply =
        completion.choices?.[0]
          ?.message?.content || ''

      // EMPTY RESPONSE CHECK
      if (!aiReply.trim()) {
        throw new Error(
          'Empty response from AI'
        )
      }

      // SAVE AI MESSAGE
      await ChatHistory.updateOne(
        {
          email: session.user.email,
          'conversations._id':
            conversationId,
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
        conversationId,
      })
    } catch (error: any) {
      console.error(
        'OpenAI/Gemini Error:',
        error.message
      )

      // ❌ DO NOT SAVE ERROR MESSAGE IN DB
      return Response.json(
        {
          error:
            error?.message ||
            'AI request failed',
        },
        {
          status: 500,
        }
      )
    }
  } catch (error: unknown) {
    let errorMessage =
      'Something went wrong'

    if (error instanceof Error) {
      console.error(
        'Chat API Error:',
        error.message
      )

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