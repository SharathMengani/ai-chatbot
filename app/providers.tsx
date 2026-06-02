
'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import Navbar from './Navbar'
import { Toaster } from 'sonner'
import { UserColorProvider } from './context/UserColorContext'

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class" defaultTheme="dark" enableSystem
      >
        <UserColorProvider>
          <Toaster />
          <Navbar />
          {children}
        </UserColorProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
