import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

const useInfiniteMessages = (userId1: string, userId2: string) => {
  const loadingRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined)

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) 
      return
    setLoading(true)
    try {
      const res = await axios.get("http://localhost:8000/api/v1/users/showConversation", { 
        params: { userId1, userId2, cursor, limit: 20 }
      })
      const newMessages = res.data 
      if (newMessages.length > 0) {
        setMessages(prev => [...prev, ...newMessages])
        setCursor(newMessages[newMessages.length - 1].created_at)
      }
      setHasMore(newMessages.length === 20)
    } catch (error) {
      console.error("An error occurred in the infinite scrolling hook:", error)
    } finally {
      setLoading(false)
    }
  }, [userId1, userId2, cursor, loading])

  useEffect(() => {
    const currentRef = loadingRef.current
    if (!currentRef) 
      return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore()
      }
    })
    observer.observe(currentRef)
    return () => observer.disconnect();
  }, [loadMore])

  useEffect(() => {
    setMessages([]);
    setCursor(undefined);
    setHasMore(true);
    loadMore();
  }, [userId1, userId2]);

  return { messages, loading, hasMore, loadingRef };
}

export default useInfiniteMessages




