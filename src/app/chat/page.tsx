"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import ChatInterface from "@/components/chat-interface-sse"
import type { Message } from "@/lib/types"
import { HeartIcon, MoonIcon, SunIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ChatPage() {
  const { data: session, status } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/")
    }
  }, [status])

  useEffect(() => {
    if (status === "authenticated") {
      fetchMessages()
    }
  }, [status])

  // Check system preference for dark mode on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDarkMode(prefersDark)
      if (prefersDark) {
        document.documentElement.classList.add("dark")
      }
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages")

      if (!response.ok) {
        throw new Error("Failed to fetch messages")
      }

      const data = await response.json()
      setMessages(data)
    } catch (err) {
      console.error("Error fetching messages:", err)
      setError("Failed to load messages. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen relative">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-pink-100/80 dark:bg-pink-950/40 transition-colors duration-300"></div>
          <img
            src="/hello-kitty-backgroundv2.jpg"
            alt="Background"
            className="w-full h-full object-cover object-center opacity-60 dark:opacity-30 transition-opacity duration-300"
          />
        </div>

        <div className="flex flex-col items-center bg-white/90 dark:bg-gray-800/90 p-6 rounded-lg shadow-md border border-pink-200 dark:border-pink-800 z-10">
          <HeartIcon className="h-12 w-12 text-pink-500 dark:text-pink-400 animate-pulse" />
          <p className="mt-4 text-pink-600 dark:text-pink-300 font-medium">Loading your messages...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen relative">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-pink-100/80 dark:bg-pink-950/40 transition-colors duration-300"></div>
          <img
            src="/hello-kitty-backgroundv2.jpg"
            alt="Background"
            className="w-full h-full object-cover object-center opacity-60 dark:opacity-30 transition-opacity duration-300"
          />
        </div>

        <div className="flex flex-col items-center p-6 text-center bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-md border border-pink-200 dark:border-pink-800 z-10">
          <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchMessages}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 dark:from-pink-600 dark:to-pink-500 dark:hover:from-pink-700 dark:hover:to-pink-600 text-white rounded-md shadow-sm transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-pink-100/80 dark:bg-pink-950/40 transition-colors duration-300"></div>
        <img
          src="/hello-kitty-backgroundv2.jpg"
          alt="Background"
          className="w-full h-full object-cover object-center opacity-60 dark:opacity-30 transition-opacity duration-300"
        />
      </div>

      <header className="bg-white/90 dark:bg-gray-800/90 border-b border-pink-300 dark:border-pink-800 p-3 sm:p-4 shadow-sm relative z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-pink-600 dark:text-pink-400 flex items-center">
            <img
              src="/madoka-icon.jpg"
              alt="Hello Kitty"
              className="w-8 h-8 sm:w-10 sm:h-10 mr-2 rounded-full border-2 border-pink-300 dark:border-pink-700"
            />
            <span className="hidden sm:inline">Hello Kitty Chat</span>
            <span className="sm:hidden">Cute Chat</span>
          </h1>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-white/80 dark:bg-gray-700/80 shadow-sm hover:shadow-md transition-all duration-300 mr-2"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <SunIcon className="h-4 w-4 text-yellow-400" />
              ) : (
                <MoonIcon className="h-4 w-4 text-gray-700" />
              )}
            </button>

            <div
              className={cn(
                "text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none px-2 py-1 rounded-full",
                "bg-white/80 text-gray-600 dark:bg-gray-700/80 dark:text-gray-300",
                "border border-pink-200 dark:border-pink-800",
              )}
            >
              {session?.user?.name || session?.user?.email}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-2 sm:p-4 relative z-10">
        <ChatInterface initialMessages={messages} />
      </main>
    </div>
  )
}

