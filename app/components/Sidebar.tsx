type Props = {
  conversations: any[]
  activeConversation: string
  setActiveConversation: (id: string) => void
  createConversation: () => void
  deleteConversation: (id: string) => void
}

export default function Sidebar({
  conversations,
  activeConversation,
  setActiveConversation,
  createConversation,
  deleteConversation,
}: Props) {
  return (
    <div className='w-[280px] border-r border-white/10 bg-black p-3 flex flex-col'>
      {/* NEW CHAT */}
      <button
        onClick={createConversation}
        className='w-full bg-white text-black rounded-xl py-3 font-semibold mb-4 hover:opacity-90 transition-all'
      >
        + New Chat
      </button>

      {/* CONVERSATIONS */}
      <div className='flex flex-col gap-2 overflow-y-auto'>
        {conversations.map((chat) => (
          <div
            key={chat?._id}
            className={`group flex items-center justify-between rounded-xl transition-all ${
              activeConversation === chat?._id
                ? 'bg-white/10'
                : 'hover:bg-white/5'
            }`}
          >
            {/* CHAT BUTTON */}
            <button
              onClick={() =>
                setActiveConversation(chat?._id)
              }
              className='flex-1 text-left px-4 py-3'
            >
              <p className='truncate text-sm font-semibold'>
                {chat?.title}
              </p>
            </button>

            {/* DELETE BUTTON */}
            <button
              onClick={() =>
                deleteConversation(chat?._id)
              }
              className='px-3 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-all'
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}