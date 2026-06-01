'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import ThemeToggle from './components/ThemeToggle'
import { ColorDropdown } from './components/ColorDropdown'
import { Logo } from './utils'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { BiMenu } from 'react-icons/bi'
import { useUserColor } from './Hooks/useUserColor'
import Link from 'next/link'

export default function Navbar() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { userColor, setUserColor } = useUserColor();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  if (!mounted) return null;
  return (
    <header className="px-4 md:px-6 py-4 border-b sticky top-0 dark:border-white/10 border-black/10 backdrop-blur-xl z-10 flex justify-between items-center">

      {/* LOGO */}
      <Logo
        className="w-35 md:w-50"
        textColor={resolvedTheme === 'dark' ? '#fff' : '#000'}
        titleColor={resolvedTheme === 'dark' ? '#dadfe3' : '#b5b5b5'}
      />

      {/* DESKTOP MENU */}
      <div className="hidden md:flex items-center gap-4">
        <ThemeToggle />
        <ColorDropdown setUserColor={setUserColor} userColor={userColor} />

        {session?.user ? (
          <div className="flex items-center gap-3">
            {session.user.image && (
              <img
                src={session.user.image}
                alt="User"
                className="w-8 h-8 rounded-full border border-[#333]"
              />
            )}

            <span className="text-sm hidden md:block">
              {session.user.name}
            </span>

            <button
              onClick={() => signOut()}
              className={`text-sm ${userColor} px-4 py-2 rounded-lg transition-all`}
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
          // <Link
          //   href="/sign-in"
          //   className={`text-sm ${userColor} px-4 py-2 rounded-lg transition-all`}
          // >
          //   Sign in
          // </Link>
        )}
      </div>

      {/* MOBILE MENU BUTTON */}
      <button
        className="md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <FaTimes className='text-2xl' /> : <BiMenu className='text-2xl' />}
      </button>

      {/* MOBILE MENU */}
      {open && (
        <div className="absolute top-16 left-0 w-full bg-white dark:bg-black border-b dark:border-white/10 border-black/10 p-4 flex flex-col gap-4 md:hidden">

          <ThemeToggle />
          <ColorDropdown setUserColor={setUserColor} userColor={userColor} />

          {session?.user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt="User"
                    className="w-8 h-8 rounded-full border border-[#333]"
                  />
                )}
                <span className="text-sm">{session.user.name}</span>
              </div>

              <button
                onClick={() => {
                  signOut()
                  setOpen(false)
                }}
                className={`text-sm ${userColor} px-4 py-2 rounded-lg`}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                signIn('google')
                setOpen(false)
              }}
              className={`text-sm ${userColor} px-4 py-2 rounded-lg`}
            >
              Sign in
            </button>
          )}
        </div>
      )}
    </header>
  )
}