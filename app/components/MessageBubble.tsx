import { useState } from 'react'

type Message = {
    role: 'user' | 'assistant'
    type: 'text' | 'image' | 'error'
    content: string
    variant?: string
}

export default function MessageBubble({
    msg,
    onChangeVariant,
    userColor
}: {
    msg: Message
    onChangeVariant?: (variant: Message['variant']) => void
    userColor: any
}) {
    const [open, setOpen] = useState(false)



    return (
        <div
            className={`flex ${msg.role === 'user'
                ? 'justify-end'
                : 'justify-start'
                }`}
        >
            <div className='relative max-w-[85%]'>

                <div
                    className={`
            rounded-2xl px-5 py-4 text-[15px]
           wrap-break-word text-white
            transition-all
            ${msg.role === 'user'
                            ? userColor
                            : 'bg-white/5 border border-white/10'
                        }
          `}
                >
                    {msg.content}
                </div>
            </div>
        </div>
    )
}