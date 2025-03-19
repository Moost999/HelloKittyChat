"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { SendIcon, MoonIcon, SunIcon } from "lucide-react"
import type { Message } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ChatInterfaceProps {
  initialMessages: Message[]
  onMessageSent?: () => void
}

export default function ChatInterface({ initialMessages, onMessageSent }: ChatInterfaceProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

  // Add this after your other useEffect hooks
  useEffect(() => {
    // Prevent iOS from zooming on input focus
    const metaViewport = document.querySelector("meta[name=viewport]")
    if (!metaViewport) {
      const meta = document.createElement("meta")
      meta.name = "viewport"
      meta.content = "width=device-width, initial-scale=1, maximum-scale=1"
      document.head.appendChild(meta)
    } else {
      metaViewport.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1")
    }

    // Prevent scroll to top on form submission
    const handleFormSubmit = (e: Event) => {
      e.preventDefault()
    }

    const form = document.querySelector("form")
    if (form) {
      form.addEventListener("submit", handleFormSubmit)
    }

    return () => {
      if (form) {
        form.removeEventListener("submit", handleFormSubmit)
      }
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !session?.user) return

    setIsLoading(true)
    const messageToSend = newMessage
    setNewMessage("")

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: messageToSend }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      if (onMessageSent) {
        onMessageSent()
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setIsLoading(false)

      // Focus the input field to keep the keyboard open on mobile
      setTimeout(() => {
        inputRef.current?.focus()
      }, 10)
    }
  }

  const addEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji)
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] sm:h-[calc(100vh-120px)] relative">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-pink-100/80 dark:bg-pink-950/40 transition-colors duration-300"></div>
       <Image
                 src="/hello-kitty-backgroundv2.jpg"
                 alt="Background"
                 fill
                 className="object-cover object-center opacity-60 dark:opacity-30 transition-opacity duration-300"
                 priority
               />
      </div>

      {/* Theme Toggle Button - Moved higher up for better mobile positioning */}
      <div className="relative z-20 flex justify-end pt-2 pr-2 sm:pt-3 sm:pr-3">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md hover:shadow-lg transition-all duration-300"
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <SunIcon className="h-5 w-5 text-yellow-400" />
          ) : (
            <MoonIcon className="h-5 w-5 text-gray-700" />
          )}
        </button>
      </div>

      {/* Chat Messages */}
      <Card className="flex-grow overflow-y-auto p-2 sm:p-4 mb-2 sm:mb-4 border-pink-300 dark:border-pink-800 relative z-10 bg-transparent sm:backdrop-blur-sm shadow-lg chat-scrollbar">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400 text-center bg-white/70 dark:bg-gray-800/70 p-3 rounded-lg shadow-sm">
              No messages yet. Start the conversation! 💕
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex ${message.user.email === session?.user?.email ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex max-w-[85%] sm:max-w-[75%] ${
                      message.user.email === session?.user?.email ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <Avatar
                      className={cn(
                        "h-6 w-6 sm:h-8 sm:w-8 border-2",
                        message.user.email === session?.user?.email
                          ? "ml-1 sm:ml-2 border-pink-300 dark:border-pink-700"
                          : "mr-1 sm:mr-2 border-blue-300 dark:border-blue-700",
                      )}
                    >
                      <div
                        className={cn(
                          "h-full w-full flex items-center justify-center text-xs sm:text-sm font-bold",
                          message.user.email === session?.user?.email
                            ? "bg-pink-200 text-pink-700 dark:bg-pink-800 dark:text-pink-200"
                            : "bg-blue-200 text-blue-700 dark:bg-blue-800 dark:text-blue-200",
                        )}
                      >
                        {message.user.name?.[0] || message.user.email?.[0] || "?"}
                      </div>
                    </Avatar>
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "rounded-lg p-2 sm:p-3 shadow-sm relative",
                        message.user.email === session?.user?.email
                          ? "bg-gradient-to-br from-pink-400 to-pink-500 dark:from-pink-600 dark:to-pink-800 text-white rounded-tr-none chat-bubble-right"
                          : "bg-white dark:bg-gray-800 border border-pink-200 dark:border-pink-800 dark:text-gray-100 rounded-tl-none chat-bubble-left",
                      )}
                    >
                      <p className="text-sm sm:text-base break-words">{message.content}</p>
                      <p
                        className={cn(
                          "text-[10px] sm:text-xs mt-1",
                          message.user.email === session?.user?.email ? "opacity-70" : "opacity-50 dark:opacity-40",
                        )}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </Card>

      {/* Emoji Buttons and Input */}
      <div className="flex flex-col space-y-1 relative z-10">
        <div className="flex space-x-2 mb-1 justify-center">
          {["❤️", "😊", "💖", "🍰", "🍓", "🎀"].map((emoji) => (
            <motion.button
              key={emoji}
              onClick={() => addEmoji(emoji)}
              className="text-sm p-1.5 bg-white/80 dark:bg-gray-800/80 hover:bg-pink-100 dark:hover:bg-pink-900/50 rounded-full shadow-sm emoji-btn transition-colors duration-200"
              aria-label={`${emoji} emoji`}
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              {emoji}
            </motion.button>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow border-pink-300 dark:border-pink-700 focus:border-pink-400 dark:focus:border-pink-500 focus:ring-pink-400 dark:focus:ring-pink-500 bg-white/90 dark:bg-gray-800/90 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm"
            disabled={isLoading}
            autoComplete="off"
            autoCorrect="on"
            spellCheck="true"
            enterKeyHint="send"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(e as unknown as React.FormEvent)
              }
            }}
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="submit"
              className={cn(
                "bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 dark:from-pink-600 dark:to-pink-500 dark:hover:from-pink-700 dark:hover:to-pink-600 shadow-md transition-all duration-300",
                isLoading && "opacity-70",
              )}
              disabled={isLoading || !newMessage.trim()}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <SendIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  )
}

