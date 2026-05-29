export default function ChatInput({
  input,
  setInput,
  sendMessage,
  loading,
  handleKeyDown,
  userColor
}: any) {
  return (
    <div className='fixed bottom-0 w-full p-5 bg-linear-to-t from-black to-transparent'>
      <div className='max-w-3xl mx-auto'>
        
        <div className='bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-4 shadow-xl focus-within:ring-2 focus-within:ring-blue-500/40'>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder='Message AI assistant...'
            className='w-full bg-transparent outline-none text-white resize-none text-[15px]'
          />

          <div className='flex justify-between items-center mt-3'>
            <div className='text-gray-500 text-[12px]'>
              Press Enter to send
            </div>

            <button
              onClick={sendMessage}
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                loading
                  ? 'bg-gray-700 cursor-not-allowed'
                  : `${userColor} hover:scale-[1.03]`
              }`}
            >
              {loading ? 'Thinking...' : 'Send'}
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}