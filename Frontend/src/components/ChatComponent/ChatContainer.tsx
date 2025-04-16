import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useChatStore } from '../../store/useChatStore.ts'
import { useAuthStore } from '../../store/useAuthStore.ts'
import { formatDate, formatTime } from '../../utils/DataFormatFunctions.ts'
import FileUploadComponent from './FileUploadComponent.tsx'
//import useFileUpload from '../../hooks/useFileUpload.ts'

// const FileUploadSection = () => {
//   const fileInputRef = useRef<HTMLInputElement | null>(null);
//   return (
//     <>
//       <div className="flex-1 p-6 bg-gray-950 overflow-y-auto">
//         <div className="border-dashed border-2 border-gray-700 rounded-lg h-full flex flex-col items-center justify-center">
//           <h2 className="text-gray-400">File Upload Section</h2>
//           <p className="text-gray-400">
//             Drag and drop your files here or click to upload.
//           </p>
//           <button
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mt-4 cursor-pointer"
//             onClick={() => fileInputRef.current?.click()}
//           >
//             Upload File
//           </button>
//           <input type="file" className="hidden" ref={fileInputRef} />
//           {/* Hidden file input */}
//         </div>
//       </div>
//     </>
//   );
// };

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  //const fileInputRef = useRef<HTMLInputElement | null>(null);
  //const { handleFileChange, handleUpload, previewUrl, uploadProgress, uploadStatus } = useFileUpload();

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

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 500);
  };

  useEffect(() => {
    getMessages();
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="p-4 border-b text-amber-50"
        style={{ backgroundColor: "#202C33" }}
      >
        <h2 className="text-lg hover:cursor-pointer">{selectedUser}</h2>
      </div>
      
      {/* Chat Component */}
      {/* Messages Area */}
      {openChat && !openFileUploadSection && (
        <>
          <div className="flex-1 p-4 bg-gray-950 overflow-y-auto">
              <div className="flex flex-col">
                {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                  <React.Fragment key={date}>
                    {/* Date Separator */}
                    <div className="flex justify-center my-4">
                      <div className="bg-gray-700 text-amber-50 text-xs px-3 py-1 rounded-full">
                        {formatDate(date)}
                      </div>
                    </div>

                    {/* Messages for this date */}
                    {dateMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex mb-3 ${
                          message.sender_id === userId
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 ${
                            message.sender_id === userId
                              ? "bg-emerald-700 text-amber-50"
                              : "bg-gray-700 text-amber-50"
                          }`}
                        >
                          <div className="break-words">{message.message}</div>
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
                  // onClick={() => fileInputRef.current?.click()}
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

                  {/* Hidden file input */}
                  {/* <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                        handleUpload(); // optional: upload immediately or use a separate button
                      }
                    }}
                    style={{ display: "none" }}
                  /> */}
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
