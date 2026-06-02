'use client'

import { useSession } from "next-auth/react"
import MainPage from "./components/Mainpage"
import Link from "next/link"
import { useUserColor } from "./context/UserColorContext";


export default function Home() {
  const { data: session } = useSession();
  const { userColor } = useUserColor();
  if (session) {
    return (
      <>

        <MainPage />
      </>
    )
  } else {
    return (
      <div className="flex items-center flex-col gap-4 justify-center h-screen">
        <h1 className="text-2xl font-bold">Please sign in to access the chatbot.</h1>
        <Link href="/sign-in" className={userColor + " ml-4 px-4 py-2 rounded-lg text-sm transition-all"}>
          Sign In
        </Link>
      </div>
    )
  }
}