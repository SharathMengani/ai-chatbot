'use client'

import {
    signIn,
    signOut,
    useSession,
} from 'next-auth/react'
import { userColorClasses } from './utils'
import { useState } from 'react'

type NavbarProps = {
    userColor: string
    setUserColor: (color: string) => void
}

export default function Navbar({
    userColor,
    setUserColor,
}: NavbarProps) {
    const { data: session } = useSession()


    return (
        <header className='px-6 py-4 border-b sticky top-0 border-[#222] bg-black/80 backdrop-blur-xl text-[20px] font-semibold z-10 flex justify-between items-center'>

            {/* LOGO */}
            <h1 className='text-white'>\
                AI Assistant</h1>

            {/* RIGHT SIDE */}
            <div className='flex items-center gap-4'>

                {/* 🎨 THEME SWITCHER */}
                <ColorDropdown setUserColor={setUserColor} userColor={userColor} />

                {/* AUTH */}
                {session?.user ? (
                    <div className='flex items-center gap-3'>

                        {/* USER IMAGE */}
                        {session.user.image && (
                            <img
                                src={session.user.image}
                                alt='User'
                                className='w-9 h-9 rounded-full border border-[#333]'
                            />
                        )}

                        {/* NAME */}
                        <span className='text-sm text-gray-300 hidden md:block'>
                            {session.user.name}
                        </span>

                        {/* LOGOUT */}
                        <button
                            onClick={() => signOut()}
                            className='text-sm bg-[#222] hover:bg-[#333] px-4 py-2 rounded-lg transition-all'
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => signIn('google')}
                        className={`text-sm ${userColor} px-4 py-2 rounded-lg transition-all`}
                    >
                        Sign in
                    </button>
                )}
            </div>
        </header>
    )
}


function ColorDropdown({
    userColor,
    setUserColor,
}: {
    userColor: string
    setUserColor: (color: string) => void
}) {
    const [open, setOpen] = useState(false)

    return (
        <div className="relative inline-block text-left text-lg">

            {/* BUTTON */}
            <button
                onClick={() => setOpen(!open)}
                className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-white flex items-center gap-2"
            >
                <span
                    className={`w-2 h-2 block rounded-full ${userColor}`}
                />
                {userColor}
                <span className="ml-2 text-gray-400">▾</span>
            </button>

            {/* DROPDOWN */}
            {open && (
                <div className="absolute mt-2 w-full bg-[#111] border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">

                    {Object.entries(userColorClasses).map(
                        ([key, value]) => (
                            <button
                                key={key}
                                onClick={() => {
                                    setUserColor(value)
                                    setOpen(false)
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition"
                            >
                                <span
                                    className={`w-2 h-2 rounded-full ${value}`}
                                />
                                <span className="capitalize text-white">
                                    {key}
                                </span>
                            </button>
                        )
                    )}

                </div>
            )}
        </div>
    )
}