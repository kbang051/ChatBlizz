import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useInView } from "react-intersection-observer";
import { useChatStore } from '../../store/useChatStore.ts'
import { useAuthStore } from '../../store/useAuthStore.ts'
import { formatDate, formatTime } from '../../utils/DataFormatFunctions.ts'
import FileUploadComponent from './FileUploadComponent.tsx'

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    scrolledMessages,
    viewMessageOnScroll,
    isMessagesLoading,
    selectedUser, // main attribute and it is basically the id, if any bug arises in future, look for selectedUser instead of username
    username,
    subscribeToMessages,
    unsubscribeFromMessages,
    sendMessage,
    openChat,
    openFileUploadSection,
    setOpenFileUploadedSectionFalse,
    setOpenFileUploadedSectionTrue
  } = useChatStore();

  const { userId } = useAuthStore();
  const [text, setText] = useState("");
  const [isInViewActive, setIsInViewActive] = useState(false);
  const [counterMessageSent, setCounterMessageSent] = useState(0); // Used to track if a msg is sent by the user or not. If yes, scroll down happens. 
  const messagesEndRef = useRef<HTMLDivElement>(null);

  //Group messages by date
  const groupedMessages = useMemo(() => {
      return messages.reduce((acc, message) => {
        console.log("GroupedMessage is getting rendered")
        const date = new Date(message.created_at).toDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(message);
        return acc;
      }, {} as Record<string, typeof messages>);
  }, [messages])

  useEffect(() => {
    console.log("Grouped Messages: ", groupedMessages);
  }, [groupedMessages])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 500);
  };

  const { ref: inViewRef, inView } = useInView({
    triggerOnce: false,
    threshold: 0.8,
    onChange: async (inView) => {
      if (inView) {
        //const msg = formattedGroupedMessage[Object.keys(formattedGroupedMessage).reverse()[0]][0];
        console.log("Messages: ", messages);
        const msg = messages[messages.length-1];
        console.log("The element is inView.");
        console.log("Message: ", msg.fileName ? msg.fileName : msg.message);
        console.log("MessageID: ", msg.id);
        console.log("MessageCreatedAt: ", msg.created_at);
        await viewMessageOnScroll(msg.created_at, msg.id);
      }
    }
  });
  
  useEffect(() => {
    console.log("Scroll to bottom has been called");
    scrollToBottom();
  }, [selectedUser, counterMessageSent])

  useEffect(() => {
    setIsInViewActive(false); // First: immediately deactivate view tracking
    console.log("User switched → isInViewActive set to false");
    getMessages();  // Second: fetch messages & subscribe 
    subscribeToMessages();
    const timeout = setTimeout(() => { // Third: reactivate after 2 seconds
      setIsInViewActive(true);
      console.log("2s passed → isInViewActive set to true");
    }, 2000);
    // Cleanup
    return () => {
      clearTimeout(timeout);
      unsubscribeFromMessages();
    }
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="p-4 border-b text-amber-50"
        style={{ backgroundColor: "#202C33" }}
      >
        <h2 className="text-lg hover:cursor-pointer">{username}</h2>
      </div>
      
      {/* Chat Component */}
      {/* Messages Area */}
      {openChat && !openFileUploadSection && (
        <>
          <div className="flex-1 p-4 bg-gray-950 overflow-y-auto ">
              <div className="flex flex-col">
                {Object.entries(groupedMessages).reverse().map(([date, dateMessages], groupIndex) => (
                  <React.Fragment key={date}>
                    {/* Date Separator */}
                    <div className="flex justify-center my-4">
                      <div className="bg-gray-700 text-amber-50 text-xs px-3 py-1 rounded-full">
                        {formatDate(date)}
                      </div>
                    </div>
                    {/* Messages for this date */}
                    {[...dateMessages].reverse().map((message, messageIndex) => (
                      <div
                        key={ message.id }
                        className={ `flex mb-3 ${ message.sender_id === userId ? "justify-end" : "justify-start"}` }
                        // Tracker
                        ref = {groupIndex == 0 && messageIndex == 0 && isInViewActive ? inViewRef : null}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 ${
                            message.sender_id === userId
                              ? "bg-emerald-700 text-amber-50"
                              : "bg-gray-700 text-amber-50"
                          }`}
                        >
                          <div className="break-words">
                            { message.fileName ? (
                              <a href = {message.message} target='_blank' rel="noopener noreferrer" className="text-blue-200 underline">
                                {message.fileName}
                              </a>
                            ) : message.message }
                          </div>
                          <div
                            className={`text-xs mt-1 text-right ${
                              message.sender_id === userId
                                ? "text-emerald-200"
                                : "text-gray-300"
                            }`}
                          >
                            {formatTime(message.created_at)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="flex p-4" style={{ backgroundColor: "#202C33" }}>
              <div
                className="w-full flex items-center gap-2 px-3 py-2 rounded"
                style={{ backgroundColor: "#2A3942" }}
              >
                {/* + Icon */}
                <div
                  className="p-2 rounded hover:bg-gray-900 cursor-pointer flex items-center justify-center"
                  onClick={() => setOpenFileUploadedSectionTrue()} // OpenChat remains same, openFileUploadSection controls the display between file upload and chat area.
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </div>

                {/* Message Input */}
                <input
                  type="text"
                  value={text}
                  placeholder="Type your message..."
                  className="flex-1 p-2 text-amber-50 outline-0 bg-transparent"
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && text.trim() !== "") {
                      sendMessage(text);
                      setText("");
                      setCounterMessageSent((prev) => prev+1);
                    }
                  }}
                />

                {/* Send Button */}
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  onClick={() => {
                    if (text.trim() !== "") {
                      sendMessage(text);
                      setText("");
                      setCounterMessageSent((prev) => prev+1);
                    }
                  }}
                >
                  Send
                </button>
              </div>
            </div>
        </>
      )}

      {openChat && openFileUploadSection && <FileUploadComponent/>}
    </div>
  );
};

export default ChatContainer
