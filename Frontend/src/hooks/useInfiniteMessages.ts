import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

const useInfiniteMessages = (userId1: string, userId2: string, searchId?: string) => {
  const loadingRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);

  console.log("🔄 useInfiniteMessages Hook Triggered");
  console.log("userId1:", userId1, "userId2:", userId2, "searchId:", searchId, "cursor:", cursor);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) {
      console.log("⚠️ Skipping loadMore - hasMore:", hasMore, "loading:", loading);
      return;
    }

    setLoading(true);
    try {
      console.log("📡 Request sent to the backend to fetch conversations");
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/showConversation`, { 
        params: { userId1, userId2, cursor, limit: 20 }
      });
      const newMessages = res.data;
      console.log("✅ Messages received:", newMessages);

      if (newMessages.length > 0) {
        setMessages(prev => [...prev, ...newMessages]); // Directly append without filtering

        // 🚀 Ensure cursor is updated before the next request
        const newCursor = newMessages[newMessages.length - 1].created_at;
        if (newCursor !== cursor) {
          setCursor(newCursor);
        }
      }

      setHasMore(newMessages.length === 20);
    } catch (error) {
      console.error("❌ Error in loadMore():", error);
    } finally {
      setLoading(false);
    }
  }, [userId1, userId2, searchId, cursor, hasMore, loading]); 

  useEffect(() => {
    const currentRef = loadingRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        console.log("📜 Scrolling: Loading more messages...");
        loadMore();
      }
    });

    observer.observe(currentRef);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  useEffect(() => {
    console.log("🆕 Resetting messages due to user change.");
    setMessages([]);
    setCursor(null); // Ensure cursor resets
    setHasMore(true);
    loadMore();
  }, [userId1, userId2, searchId]);

  return { messages, loading, hasMore, loadingRef };
};

export default useInfiniteMessages;






