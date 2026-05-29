import { IoCreate, IoCreateOutline, IoCreateSharp } from "react-icons/io5"
import { VscNewFolder } from "react-icons/vsc"

type Props = {
  conversations: any[]
  activeConversation: string
  setActiveConversation: (id: string) => void
  createConversation: () => void
  deleteConversation: (id: string) => void
  userColor : string
}

export default function Sidebar({
  conversations,
  activeConversation,
  setActiveConversation,
  createConversation,
  deleteConversation,
  userColor
}: Props) {
  return (
    <div className='w-70 lg:w-120 md:w-100 border-l dark:border-white/10 border-black/10 p-3 h-screen items-center justify-between flex flex-col '>
      {/* NEW CHAT */}
      

      {/* CONVERSATIONS */}
      <div className='flex flex-col gap-2 overflow-y-auto w-full mt-2'>
        {conversations.map((chat) => (
          <div
            key={chat?._id}
            className={`group flex items-center justify-between rounded-xl transition-all ${
              activeConversation === chat?._id
                ? 'dark:bg-white/10 bg-black/10'
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
      <button
        onClick={createConversation}
        className={`w-full ${userColor} flex items-center gap-2 justify-center rounded-xl py-3 font-semibold mb-4 hover:opacity-90 transition-all`}
      >
        New Chat <VscNewFolder className="text-xl" />
      </button>
    </div>
  )
}