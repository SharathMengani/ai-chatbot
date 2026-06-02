'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import ThemeToggle from './components/ThemeToggle'
import { ColorDropdown } from './components/ColorDropdown'
import { Logo } from './utils'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { FaTimes, FaUserCircle } from 'react-icons/fa'
import { BiMenu } from 'react-icons/bi'
import Link from 'next/link'
import { useUserColor } from './context/UserColorContext'

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
      <Link href="/" className='flex items-center gap-2'>
        <Logo
          className="w-35 md:w-50"
          textColor={resolvedTheme === 'dark' ? '#fff' : '#000'}
          titleColor={resolvedTheme === 'dark' ? '#dadfe3' : '#b5b5b5'}
          eyesColor={'#fff'}
        />
      </Link>

      {/* DESKTOP MENU */}
      <div className="hidden md:flex items-center gap-4">
        <ThemeToggle />
        <ColorDropdown setUserColor={setUserColor} userColor={userColor} />

        {session?.user ? (
          <div className="flex items-center gap-3">
            <Link href="/profile" className="flex items-center gap-2">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt="User"
                  className="w-8 h-8 rounded-full border border-[#333]"
                />
              ) : (
                <FaUserCircle className='w-8 h-8 dark:text-white' />
              )}

              <span className="text-sm hidden md:block">
                {session.user.name}
              </span>
            </Link>

            <button
              onClick={async () => {
                await signOut({
                  redirect: true,
                  callbackUrl: "/sign-in",
                });
              }}
              className={`text-sm ${userColor} px-4 py-2 rounded-lg transition-all`}
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/sign-in"
            className={`text-sm ${userColor} px-4 py-2 rounded-lg transition-all`}
          >
            Sign in
          </Link>
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
                onClick={async () => {
                  await signOut({
                    callbackUrl: "/",
                  });
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