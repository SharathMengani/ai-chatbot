'use client'

import {
    signIn,
    signOut,
    useSession,
} from 'next-auth/react'
import ThemeToggle from './components/ThemeToggle'
import { ColorDropdown } from './components/ColorDropdown'
import { Logo } from './utils'
import { useTheme } from 'next-themes'

type NavbarProps = {
    userColor: string
    setUserColor: (color: string) => void
}

export default function Navbar({
    userColor,
    setUserColor,
}: NavbarProps) {
    const { data: session } = useSession()

    const { theme } = useTheme();
    const isDark = theme === "dark";
    return (
        <header className='px-6 py-4 border-b sticky top-0 dark:border-white/10 border-black/10  backdrop-blur-xl text-[20px] font-semibold z-10 flex justify-between items-center'>

            {/* LOGO */}
            <Logo className='w-50' textColor={isDark ? '#fff' : '#000'} titleColor={isDark ? '#dadfe3' : '#b5b5b5'} />

            {/* RIGHT SIDE */}
            <div className='flex items-center gap-4'>

                <ThemeToggle />
                <ColorDropdown setUserColor={setUserColor} userColor={userColor} />

                {/* AUTH */}
                {session?.user ? (
                    <div className='flex items-center gap-3'>

                        {/* USER IMAGE */}
                        {session.user.image && (
                            <img
                                src={session.user.image}
                                alt='User'
                                className='w-8 h-8 rounded-full border border-[#333]'
                            />
                        )}

                        {/* NAME */}
                        <span className='text-sm  hidden md:block'>
                            {session.user.name}
                        </span>

                        {/* LOGOUT */}
                        <button
                            onClick={() => signOut()}
                            className={`text-sm  ${userColor} px-4 py-2 rounded-lg transition-all`}
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

