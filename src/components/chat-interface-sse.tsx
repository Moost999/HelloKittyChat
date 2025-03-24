"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { SendIcon, MoonIcon, SunIcon } from "lucide-react";
import type { Message } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ChatInterfaceProps {
  initialMessages: Message[];
}

export default function ChatInterface({ initialMessages }: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // SSE connection setup
  useEffect(() => {
    const setupSSE = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource("/api/sse");
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const newMessages = JSON.parse(event.data);
          setMessages(prev => [...prev, ...newMessages.filter((m: Message) => 
            !prev.some(pm => pm.id === m.id)
          )]);
        } catch (error) {
          console.error("Error parsing SSE data:", error);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setTimeout(setupSSE, 5000);
      };
    };

    setupSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Scroll handling
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, [messages]);

  // Dark mode detection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkMode(prefersDark);
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user) return;

    setIsLoading(true);
    const messageToSend = newMessage;
    setNewMessage("");

    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageToSend }),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] sm:h-[calc(100vh-120px)] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-pink-100/80 dark:bg-pink-950/40"></div>
        <Image
          src="/hello-kitty-backgroundv2.jpg"
          alt="Background"
          fill
          className="object-cover object-center opacity-60 dark:opacity-30"
          priority
        />
      </div>

      {/* Theme Toggle */}
      <div className="relative z-20 flex justify-end pt-2 pr-2 sm:pt-3 sm:pr-3">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md"
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
      <Card className="flex-grow overflow-y-auto p-2 sm:p-4 mb-2 sm:mb-4 border-pink-300 dark:border-pink-800 relative z-10 bg-transparent sm:backdrop-blur-sm shadow-lg">
        <AnimatePresence mode="popLayout" initial={false}>
          {messages.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <p className="text-gray-500 dark:text-gray-400 text-center bg-white/70 dark:bg-gray-800/70 p-3 rounded-lg shadow-sm">
                No messages yet. Start the conversation! 💕
              </p>
            </motion.div>
          ) : (
            messages.map((message) => (
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  mass: 0.5
                }}
                className={`flex ${message.user.email === session?.user?.email ? "justify-end" : "justify-start"} mb-2 sm:mb-3`}
              >
                <div className={`flex max-w-[85%] sm:max-w-[75%] ${message.user.email === session?.user?.email ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar
                    className={cn(
                      "h-6 w-6 sm:h-8 sm:w-8 border-2",
                      message.user.email === session?.user?.email
                        ? "ml-1 sm:ml-2 border-pink-300 dark:border-pink-700"
                        : "mr-1 sm:mr-2 border-blue-300 dark:border-blue-700"
                    )}
                  >
                    <div
                      className={cn(
                        "h-full w-full flex items-center justify-center text-xs sm:text-sm font-bold",
                        message.user.email === session?.user?.email
                          ? "bg-pink-200 text-pink-700 dark:bg-pink-800 dark:text-pink-200"
                          : "bg-blue-200 text-blue-700 dark:bg-blue-800 dark:text-blue-200"
                      )}
                    >
                      {message.user.name?.[0] || message.user.email?.[0] || "?"}
                    </div>
                  </Avatar>
                  <motion.div
                    layout
                    className={cn(
                      "rounded-lg p-2 sm:p-3 shadow-sm",
                      message.user.email === session?.user?.email
                        ? "bg-gradient-to-br from-pink-400 to-pink-500 dark:from-pink-600 dark:to-pink-800 text-white rounded-tr-none"
                        : "bg-white dark:bg-gray-800 border border-pink-200 dark:border-pink-800 dark:text-gray-100 rounded-tl-none"
                    )}
                  >
                    <p className="text-sm sm:text-base break-words">{message.content}</p>
                    <p className={cn(
                      "text-[10px] sm:text-xs mt-1",
                      message.user.email === session?.user?.email ? "opacity-70" : "opacity-50 dark:opacity-40"
                    )}>
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </Card>

      {/* Input Area */}
      <div className="flex flex-col space-y-1 relative z-10">
        <div className="flex space-x-2 mb-1 justify-center">
          {["❤️", "😊", "💖", "🍰", "🍓", "🎀"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => addEmoji(emoji)}
              className="text-sm p-1.5 bg-white/80 dark:bg-gray-800/80 hover:bg-pink-100 dark:hover:bg-pink-900/50 rounded-full shadow-sm transition-colors"
              aria-label={`${emoji} emoji`}
            >
              {emoji}
            </button>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow border-pink-300 dark:border-pink-700 bg-white/90 dark:bg-gray-800/90 dark:text-gray-100 shadow-sm"
            disabled={isLoading}
          />
          <Button
            type="submit"
            className={cn(
              "bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 dark:from-pink-600 dark:to-pink-500 dark:hover:from-pink-700 dark:hover:to-pink-600 shadow-md",
              isLoading && "opacity-70"
            )}
            disabled={isLoading || !newMessage.trim()}
          >
            {isLoading ? (
              <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <SendIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}