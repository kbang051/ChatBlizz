import React, { useEffect, useRef } from 'react'
import useInfiniteMessages from '../../hooks/useInfiniteMessages.ts'

interface ChatWindowProps {
    currentUserId: string,
    otherUserId: string
}

const ChatWindow: React.FC<ChatWindowProps> = ({currentUserId, otherUserId}) => {
    const { messages, loading, hasMore, loadingRef } = useInfiniteMessages(currentUserId, otherUserId)
    console.log("Message Content", messages)
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-full overflow-hidden">        
            {/* Messages Container (reverse flex-col for newest first) */}
            <div className="flex-1 overflow-y-auto flex flex-col-reverse">
                {/* Loading indicator at top */}
                {loading && <div className="p-4 text-center">Loading...</div>}
                {/* Messages in reverse order */}
                <div className="p-4 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs p-3 rounded-lg ${msg.sender_id === currentUserId ? ' bg-green-400 text-white' : 'bg-blue-500'}`}>
                                {msg.message}
                                <div className="text-xs opacity-70 mt-1">
                                    {new Date(msg.created_at).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* Infinite scroll trigger */}
                    {hasMore && (
                        <div ref={loadingRef} className="h-10 flex items-center justify-center">
                            {!loading && 'Load more messages'}
                        </div>
                    )}
                    {/* Empty space at bottom */}
                    <div ref={messagesEndRef} />
                </div>
            </div>
        </div>
      );
};

export default ChatWindow
