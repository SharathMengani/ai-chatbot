'use client'

import {
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
} from 'react'
import Navbar from './Navbar'
import ChatMessages from './components/ChatMessages'
import ChatInput from './components/ChatInput'
import { userColorClasses } from './utils'

type Message = {
  role: 'user' | 'assistant'
  type: 'text' | 'image' | 'error'
  content: string,
}

const defaultMessage: Message = {
  role: 'assistant',
  type: 'text',
  content: 'Hello 👋 How can I help you today?',
}


export default function Home() {
  const [input, setInput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [userColor, setUserColor] = useState<string>(userColorClasses['blue'])

  // LOAD FROM LOCAL STORAGE
  const [messages, setMessages] = useState<Message[]>([
    defaultMessage,
  ])

  const [mounted, setMounted] = useState(false)

  const bottomRef = useRef<HTMLDivElement | null>(null)

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])



  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      type: 'text',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])

    const currentInput = input

    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
        }),
      })

      // 🚨 Handle auth FIRST
      if (response.status === 401) {
        setMessages([defaultMessage])
        return
      }

      let data: any = {}

      try {
        data = await response.json()
      } catch {
        throw new Error('Invalid server response')
      }

      console.log('response', response)

      // ❌ other errors
      if (!response.ok) {
        throw new Error(data.error || 'Request failed')
      }

      // IMAGE RESPONSE
      if (data.image) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            type: 'image',
            content: data.image,
          },
        ])
      }

      // TEXT RESPONSE
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            type: 'text',
            content: data.reply,
          },
        ])
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          type: 'error',
          content:
            error instanceof Error
              ? error.message
              : 'Something went wrong',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (
    e: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }


  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/messages')
        if (res.status === 401) {
          setMessages([defaultMessage])
          return
        }

        if (!res.ok) {
          throw new Error('Failed to fetch messages')
        }
        const data = await res.json()

        if (Array.isArray(data) && data.length > 0) {
          setMessages(data)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setMounted(true)
      }
    }

    fetchMessages()
  }, [])

  return (
    <div className='flex flex-col min-h-screen bg-black text-white'>
      <Navbar userColor={userColor} setUserColor={setUserColor} />
      <ChatMessages
        messages={messages}
        loading={loading}
        bottomRef={bottomRef}
        userColor={userColor}

      />

      <ChatInput
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        loading={loading}
        handleKeyDown={handleKeyDown}
        userColor={userColor}
      />

    </div>
  )
}