'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { MdOutlineWbSunny } from 'react-icons/md'
import { LuSunMoon } from 'react-icons/lu'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <button aria-label='Theme Switcher'
      onClick={() =>
        setTheme(
          theme === 'dark'
            ? 'light'
            : 'dark'
        )
      }
      className=' text-black dark:text-white transition-all '
    >
      {theme === 'dark'
        ? <MdOutlineWbSunny className='text-2xl' />
        : <LuSunMoon className='text-2xl' />
      }
    </button>
  )
}