
import OpenAI from 'openai'
import { getServerSession } from 'next-auth'

import { connectDB } from '@/app/lib/mongodb'
import ChatHistory from '@/app/(backend)/models/ChatHistory'

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL:
    'https://generativelanguage.googleapis.com/v1beta/openai/',
})

export async function POST(req: Request) {
  try {
    await connectDB()

    const session = await getServerSession()

    // =================================================
    // AUTH CHECK
    // =================================================

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

    // =================================================
    // REQUEST BODY
    // =================================================

    const body = await req.json()

    const message: string =
      body.message?.trim()

    let conversationId: string =
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

    // =================================================
    // ENSURE USER EXISTS
    // =================================================

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

    // =================================================
    // CREATE / REUSE CONVERSATION
    // =================================================

    if (!conversationId) {
      const existingUser =
        await ChatHistory.findOne({
          email: session.user.email,
        })

      // REUSE EMPTY CHAT
      const emptyConversation =
        existingUser?.conversations?.find(
          (conversation: any) =>
            !conversation.messages ||
            conversation.messages.length === 0
        )

      if (emptyConversation) {
        conversationId =
          emptyConversation._id.toString()
      } else {
        // CREATE NEW CHAT
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

        const newConversation =
          updatedUser?.conversations?.[
            updatedUser.conversations.length - 1
          ]

        conversationId =
          newConversation?._id?.toString()
      }
    }

    // =================================================
    // FINAL SAFETY CHECK
    // =================================================

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

    // =================================================
    // IMAGE DETECTION
    // =================================================

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

    // =================================================
    // IMAGE FLOW
    // =================================================

    if (wantsImage) {
      const imageReply =
        'Image generation is not enabled in this setup.'

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

      // UPDATE TITLE
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

      // SAVE ASSISTANT MESSAGE
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

    // =================================================
    // AI RESPONSE
    // =================================================

    try {
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
        completion.choices?.[0]
          ?.message?.content?.trim()

      // EMPTY RESPONSE
      if (!aiReply) {
        return Response.json(
          {
            error:
              'Empty response from AI',
          },
          {
            status: 500,
          }
        )
      }

      // =================================================
      // SAVE USER MESSAGE
      // =================================================

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

      // =================================================
      // UPDATE TITLE
      // =================================================

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

      // =================================================
      // SAVE AI MESSAGE
      // =================================================

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
        'AI ERROR:',
        error?.message
      )

      // DO NOT SAVE MESSAGES ON FAILURE
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
    console.error(
      'CHAT API ERROR:',
      error
    )

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
