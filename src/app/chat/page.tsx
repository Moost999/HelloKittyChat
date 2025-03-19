"use client";

import { useEffect, useState } from "react";
import ChatInterface from "@/components/chat-interface-sse";
import type { Message } from "@/lib/types";
import { useSession } from "next-auth/react";

export default function ChatPage() {
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  // Fetch initial messages on page load
  useEffect(() => {
    async function fetchMessages() {
      if (session) {
        try {
          const response = await fetch("/api/messages");
          if (response.ok) {
            const data = await response.json();
            setInitialMessages(data);
          }
        } catch (error) {
          console.error("Error fetching initial messages:", error);
        } finally {
          setLoading(false);
        }
      }
    }

    if (session) {
      fetchMessages();
    } else {
      setLoading(false);
    }
  }, [session]);

  // Show loading state or chat interface
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return <ChatInterface initialMessages={initialMessages} />;
}