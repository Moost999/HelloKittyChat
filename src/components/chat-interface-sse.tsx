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

  // Set up SSE connection
  useEffect(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource("/api/sse");
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const newMessages = JSON.parse(event.data);
        setMessages(newMessages);
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();

      setTimeout(() => {
        if (document.visibilityState === "visible") {
          eventSourceRef.current = new EventSource("/api/sse");
        }
      }, 5000);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && eventSourceRef.current) {
        eventSourceRef.current.close();
      } else if (document.visibilityState === "visible" && !eventSourceRef.current) {
        eventSourceRef.current = new EventSource("/api/sse");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkMode(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  useEffect(() => {
    const metaViewport = document.querySelector("meta[name=viewport]");
    if (!metaViewport) {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1, maximum-scale=1";
      document.head.appendChild(meta);
    } else {
      metaViewport.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1");
    }

    return () => {
      if (metaViewport) {
        metaViewport.setAttribute("content", "width=device-width, initial-scale=1");
      }
    };
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user) return;

    setIsLoading(true);
    const messageToSend = newMessage;
    setNewMessage("");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: messageToSend }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
    inputRef.current?.focus();
  };

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

      {/* Theme Toggle Button */}
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
                          : "bg-white dark:bg-gray-800 border border-pink-200 dark:border-pink-800 dark:text-gray-100 rounded-tl-none",
                      )}
                    >
                      {message.content}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        <div ref={messagesEndRef} className="h-1"></div>
      </Card>

      {/* Input and Send Button */}
      <div className="relative z-10 mt-2 sm:mt-4 p-2 sm:p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-md">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-4">
          <Input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow sm:w-[80%] rounded-full"
            placeholder="Type a message..."
          />
          <Button
            type="submit"
            disabled={isLoading || !newMessage.trim()}
            className="p-3 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-all duration-300"
            aria-label="Send message"
          >
            {isLoading ? "Sending..." : <SendIcon className="h-6 w-6" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
