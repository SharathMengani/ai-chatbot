import { useState } from 'react'
import { FaUserCircle } from 'react-icons/fa'
import { LuBotMessageSquare } from 'react-icons/lu'
import { Icon } from '../utils'
import Image from 'next/image'

type Message = {
    role: 'user' | 'assistant'
    type: 'text' | 'image' | 'error'
    content: string
    variant?: string
}

export default function MessageBubble({
    msg,
    onChangeVariant,
    userColor,
    session
}: {
    msg: Message
    onChangeVariant?: (variant: Message['variant']) => void
    userColor: any
    session: any
}) {
    const [open, setOpen] = useState(false)



    return (
        <div
            className={`flex items-center gap-3 ${msg.role === 'user'
                ? 'justify-start flex-row-reverse'
                : 'justify-start'
                }`}
        >
            {msg.role !== 'user' ?
                <Icon className='w-8' /> :

                (session && session.user.image) && (
                    <img
                        src={session.user.image}
                        alt="User"
                        className="w-8 h-8 rounded-full border border-[#333]"
                    />
                )

            }
            <div className='relative max-w-[85%]'>

                <div
                    className={`
            rounded-2xl px-5 py-4 text-[15px]
           wrap-break-word 
            transition-all
            ${msg.role === 'user'
                            ? userColor
                            : 'dark:bg-white/5 bg-black/10 border border-white/10'
                        }
          `}
                >
                    {msg.content}
                </div>
            </div>
        </div>
    )
}