'use client'

import {
    useEffect,
    useRef,
    useState,
    KeyboardEvent,
} from 'react'

import { FiMenu, FiX } from 'react-icons/fi'
import { useSession } from 'next-auth/react'
import { userColorClasses } from '../utils'
import ChatInput from './ChatInput'
import ChatMessages from './ChatMessages'
import Sidebar from './Sidebar'
import { useUserColor } from '../context/UserColorContext'

type Message = {
    role: 'user' | 'assistant'
    type: 'text' | 'image' | 'error'
    content: string
}

type Conversation = {
    _id: string
    title: string
    messages: Message[]
}

const defaultMessage: Message = {
    role: 'assistant',
    type: 'text',
    content: 'Hello 👋 How can I help you today?',
}

export default function MainPage() {
    const { data: session, status } = useSession();
    const [input, setInput] = useState('')
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [mounted, setMounted] = useState(false)

    const { userColor } = useUserColor();
    const [conversations, setConversations] =
        useState<Conversation[]>([])

    const [activeConversation, setActiveConversation] =
        useState('')

    const [messages, setMessages] = useState<Message[]>([
        defaultMessage,
    ])

    const bottomRef = useRef<HTMLDivElement | null>(
        null
    )


    // AUTO SCROLL
    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: 'smooth',
        })
    }, [messages])

    // FETCH CONVERSATIONS
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await fetch('/api/messages')

                // NOT LOGGED IN
                if (res.status === 401) {
                    setMessages([defaultMessage])
                    return
                }

                if (!res.ok) {
                    throw new Error(
                        'Failed to fetch conversations'
                    )
                }

                const data = await res.json()

                // NO CONVERSATIONS
                if (
                    !data?.conversations ||
                    data.conversations.length === 0
                ) {
                    const createRes = await fetch(
                        '/api/conversations',
                        {
                            method: 'POST',
                        }
                    )

                    const createData =
                        await createRes.json()
                    const newConversation =
                        createData.conversation

                    setConversations([newConversation])

                    setActiveConversation(
                        newConversation?._id
                    )

                    setMessages([defaultMessage])

                    return
                }

                // EXISTING CONVERSATIONS
                setConversations(data.conversations)

                const firstConversation =
                    data.conversations[0]

                setActiveConversation(
                    firstConversation._id
                )

                setMessages(
                    firstConversation.messages.length > 0
                        ? firstConversation.messages
                        : [defaultMessage]
                )
            } catch (error) {
                console.error(error)
            } finally {
                setMounted(true)
            }
        }

        fetchConversations()
    }, [])

    // SWITCH CONVERSATION
    const handleConversationChange = (
        conversationId: string
    ) => {
        setActiveConversation(conversationId)

        const selectedConversation =
            conversations.find(
                (conversation) =>
                    conversation._id === conversationId
            )

        if (!selectedConversation) return

        setMessages(
            selectedConversation.messages.length > 0
                ? selectedConversation.messages
                : [defaultMessage]
        )
    }

    const createConversation = async () => {
        try {
            const res = await fetch('/api/conversations', {
                method: 'POST',
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error)
            }

            const newConversation = {
                ...data.conversation,
                title: 'New Chat',
                messages: [],
            }

            // ADD TO SIDEBAR
            setConversations((prev) => [
                newConversation,
                ...prev,
            ])

            // IMPORTANT
            setActiveConversation(newConversation._id)

            // RESET CHAT WINDOW
            setMessages([defaultMessage])
        } catch (error) {
            console.error(error)
        }
    }

    const sendMessage = async () => {
        if (!input.trim() || loading) return

        const currentInput = input.trim()

        let currentConversationId =
            activeConversation

        setLoading(true)

        try {
            // ✅ AUTO CREATE CONVERSATION
            if (!currentConversationId) {
                const createRes = await fetch(
                    '/api/conversations',
                    {
                        method: 'POST',
                    }
                )

                const createData =
                    await createRes.json()

                if (!createRes.ok) {
                    throw new Error(
                        createData.error ||
                        'Failed to create chat'
                    )
                }

                const newConversation = {
                    ...createData.conversation,
                    title:
                        currentInput.slice(0, 40),
                    messages: [],
                }

                // UPDATE SIDEBAR
                setConversations((prev) => [
                    newConversation,
                    ...prev,
                ])

                // SET ACTIVE CHAT
                setActiveConversation(
                    newConversation._id
                )

                currentConversationId =
                    newConversation._id
            }

            const userMessage: Message = {
                role: 'user',
                type: 'text',
                content: currentInput,
            }

            // ADD USER MESSAGE
            setMessages((prevMessages) => [
                ...prevMessages,
                userMessage,
            ])

            // CLEAR INPUT
            setInput('')

            // SEND MESSAGE
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/json',
                },
                body: JSON.stringify({
                    message: currentInput,
                    conversationId:
                        currentConversationId,
                }),
            })

            // AUTH ERROR
            if (response.status === 401) {
                setMessages([defaultMessage])
                return
            }

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.error || 'Request failed'
                )
            }

            // ASSISTANT MESSAGE
            const assistantMessage: Message =
                data.image
                    ? {
                        role: 'assistant',
                        type: 'image',
                        content: data.image,
                    }
                    : {
                        role: 'assistant',
                        type: 'text',
                        content:
                            data.reply ||
                            'No response generated',
                    }

            // ADD AI MESSAGE
            setMessages((prevMessages) => [
                ...prevMessages,
                assistantMessage,
            ])

            // UPDATE CONVERSATIONS
            setConversations((prev) =>
                prev.map((conversation) => {
                    if (
                        conversation._id !==
                        currentConversationId
                    ) {
                        return conversation
                    }

                    return {
                        ...conversation,

                        title:
                            conversation.title ===
                                'New Chat'
                                ? currentInput.slice(
                                    0,
                                    40
                                )
                                : conversation.title,

                        messages: [
                            ...conversation.messages,
                            userMessage,
                            assistantMessage,
                        ],
                    }
                })
            )
        } catch (error) {
            const errorMessage: Message = {
                role: 'assistant',
                type: 'error',
                content:
                    error instanceof Error
                        ? error.message
                        : 'Something went wrong',
            }

            setMessages((prevMessages) => [
                ...prevMessages,
                errorMessage,
            ])
        } finally {
            setLoading(false)
        }
    }
    const deleteConversation = async (
        conversationId: string
    ) => {
        try {
            const res = await fetch(
                `/api/conversations/${conversationId}`,
                {
                    method: 'DELETE',
                }
            )

            if (!res.ok) {
                throw new Error(
                    'Failed to delete conversation'
                )
            }

            const updatedConversations =
                conversations.filter(
                    (conversation) =>
                        conversation._id !==
                        conversationId
                )

            setConversations(
                updatedConversations
            )

            // SWITCH TO FIRST CHAT
            if (
                activeConversation ===
                conversationId
            ) {
                if (
                    updatedConversations.length > 0
                ) {
                    const first =
                        updatedConversations[0]

                    setActiveConversation(first._id)

                    setMessages(
                        first.messages.length > 0
                            ? first.messages
                            : [defaultMessage]
                    )
                } else {
                    setActiveConversation('')

                    setMessages([
                        defaultMessage,
                    ])
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    // ENTER KEY
    const handleKeyDown = (
        e: KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (
            e.key === 'Enter' &&
            !e.shiftKey
        ) {
            e.preventDefault()
            sendMessage()
        }
    }

    if (status === "loading") {
        return (
            <div className="h-screen flex flex-col gap-4 p-4">
                <img src="" alt="" />
                <div className="h-10 w-40 bg-black animate-pulse rounded" />
                <div className="flex-1 bg-black animate-pulse rounded" />
                <div className="h-12 bg-black animate-pulse rounded" />
            </div>
        )
    }
    if (!mounted) return null

    return (
        <div className="flex overflow-hidden relative h-[90vh]">

            {/* SIDEBAR */}
            <div
                className={`
      fixed md:static top-0 left-0 h-full z-50 dark:bg-[#0f0f0f]
      transition-transform duration-300
      w-70

      ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
    `}
            >
                {/* CLOSE BUTTON */}
                <button
                    className={`md:hidden absolute -translate-y-1/2 top-24 -right-8.5 text-sm p-2 rounded-r-2xl ${userColor}`}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
                </button>

                <Sidebar
                    conversations={conversations}
                    activeConversation={activeConversation}
                    setActiveConversation={handleConversationChange}
                    createConversation={createConversation}
                    deleteConversation={deleteConversation}
                    userColor={userColor}
                />
            </div>

            {/* MAIN */}
            <div className="flex flex-col flex-1 min-w-0">


                <ChatMessages
                    messages={messages}
                    loading={loading}
                    bottomRef={bottomRef}
                    userColor={userColor}
                    session={session}
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

            {/* BACKDROP (mobile only) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 md:hidden z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}


        </div>
    )
}