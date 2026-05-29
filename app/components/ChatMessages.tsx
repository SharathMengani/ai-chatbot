import MessageBubble from './MessageBubble'

type Message = {
    role: 'user' | 'assistant'
    type: 'text' | 'image' | 'error'
    content: string,
}

export default function ChatMessages({
    messages,
    loading,
    bottomRef,
    userColor
}: {
    messages: Message[]
    loading: boolean
    bottomRef: React.RefObject<HTMLDivElement | null>
    userColor: any
}) {
    return (
        <div className='flex-1 overflow-y-auto px-4 pt-10 pb-40'>
            <div className='max-w-3xl mx-auto flex flex-col gap-6'>

                {messages.map((msg, index) => (
                    <MessageBubble key={index} msg={msg} userColor={userColor} />
                ))}

                {loading && (
                    <div className='flex justify-start'>
                        <div className='bg-white/5 border border-white/10 px-5 py-4 rounded-2xl text-gray-400 animate-pulse'>
                            Thinking...
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>
        </div>
    )
}