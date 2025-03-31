import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'

interface Message {
    id: string,
    sender_id: string,
    message: string,
    created_at: string
}

const useInfiniteMessages = (userId1: string, userId2: string) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null); //A reference for detecting when the user reaches the bottom of the chat.
    const loadingRef = useRef<HTMLDivElement>(null); //A reference for the last message, so when it appears in the viewport, more messages are fetched.

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) 
            return;
        setLoading(true)
        try {
            const cursor = (messages.length > 0) ? messages[messages.length-1].created_at : undefined
            const res = await axios.get(
              "http://localhost:8000/api/v1/users/showConversation",
              { params: { userId1, userId2, cursor, limit: 20 } }
            );
            setMessages(prev => [...prev, ...res.data])
            setHasMore(res.data.length === 20)
        } catch (error) {
            console.log("An Error occured in the infinite scrolling custom hook:", error)
        }
        finally {
            setLoading(false)
        }
    }, [userId1, userId2, messages, loading, hasMore]) 

    useEffect(() => {
      console.log("Message component set in useInfiniteHook", messages)
    }, [messages])

    // Initialize observer for infinite scroll
    useEffect(() => {
      if (!loadingRef.current) 
        return;
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMore();
          }
        },
        { threshold: 0.1 }
      );
      observer.current.observe(loadingRef.current);
      return () => observer.current?.disconnect();
    }, [loadMore]);

    // Initial load
    useEffect(() => {
        setMessages([]);
        setHasMore(true);
        loadMore();
    }, [userId1, userId2]);

    return { messages, loading, hasMore, loadingRef };
}

export default useInfiniteMessages

