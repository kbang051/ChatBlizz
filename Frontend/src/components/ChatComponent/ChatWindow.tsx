import React, { useState, useEffect, useRef } from "react";
import useInfiniteMessages from "../../hooks/useInfiniteMessages.ts";

interface ChatWindowProps {
  currentUserId: string;
  otherUserId: string;
  setReceiverId: React.Dispatch<React.SetStateAction<string>>;
  onSendMessage: (content: string, targetReceiverId: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({currentUserId, otherUserId, setReceiverId, onSendMessage,}) => {
  const { messages, loading, hasMore, loadingRef } = useInfiniteMessages(currentUserId,otherUserId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageField, setMessageField] = useState("");

  const handleSendMessage = (receiverId: string) => {
    console.log("Message Field: ", messageField.trim());
    console.log("Request received at handleSendMessage and the receiver id is ", receiverId);
    if (messageField.trim() && receiverId.trim()) {
      setMessageField(""); // Clear local state
      setReceiverId(receiverId); // Update receiverId in parent
      onSendMessage(messageField.trim(), receiverId.trim()); // Delegate to parent
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Messages Container (reverse flex-col for newest first) */}
      <div className="flex-1 overflow-y-auto">
        {/* Loading indicator at top */}
        {loading && <div className="p-4 text-center">Loading...</div>}
        {/* Messages in reverse order */}
        <div className="p-4 space-y-4">
          {/* Infinite scroll trigger */}
          {hasMore && (
            <div ref={loadingRef} className="h-10 flex items-center justify-center">
              {!loading && "Load more messages"}
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${ msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg ${
                  msg.sender_id === currentUserId
                    ? " bg-green-400 text-white"
                    : "bg-blue-500"
                }`}
              >
                {msg.message}
                <div className="text-xs opacity-70 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {/* Empty space at bottom */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex gap-3 bg-gray-900 p-4 items-center">
        {/* Attachment/Add icon (optional) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6 hover:cursor-pointer text-blue-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>

        {/* Textarea + Send button container */}
        <div className="flex flex-1 items-center gap-2 border border-white rounded-lg">
          <textarea
            placeholder="Type a message"
            className="flex-1 px-3 py-2 outline-none resize-none"
            value={messageField}
            rows={1}
            onChange={(event) => {
              setMessageField(event.target.value);
              console.log(messageField);
            }}
          />

          {/* Send button (adjust size/icon as needed) */}
          <button className="p-2 text-gray-800 hover:text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-5"
              onClick={() => handleSendMessage(otherUserId)}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
