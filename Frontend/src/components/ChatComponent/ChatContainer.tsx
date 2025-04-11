import React, { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../../store/useChatStore.ts'
import { useAuthStore } from '../../store/useAuthStore.ts'

const ChatContainer = () => {
    const { 
        messages, 
        getMessages, 
        isMessagesLoading, 
        selectedUser, 
        subscribeToMessages, 
        unsubscribeFromMessages,
        sendMessage
    } = useChatStore();
    
    const { userId } = useAuthStore();
    const [text, setText] = useState("");
    
    useEffect(() => {
        getMessages();
        subscribeToMessages();
        return () => unsubscribeFromMessages();
    }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages])

    const groupMessagesByDate = () => {
        const grouped: { [key: string]: typeof messages } = {};
        messages.forEach(message => {
            const date = new Date(message.created_at).toDateString();
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(message);
        });
        return grouped;
    };

    const groupedMessages = groupMessagesByDate();

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b text-amber-50" style = {{backgroundColor: "#202C33"}}>
                <h2 className="text-lg hover:cursor-pointer">{selectedUser}</h2>
            </div>

            {/* Message Area */}
            <div className='flex-1 p-4 bg-gray-950 overflow-y-auto'>
                <div className='flex flex-col'>
                    {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                        <React.Fragment key={date}>
                            {/* Date separator */}
                            <div className='flex justify-center my-2'>
                                <div className='bg-gray-700 text-amber-50 text-xs px-2 py-1 rounded-md'>
                                    {new Date(date).toLocaleDateString([], {
                                        weekday: 'long',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </div>
                            </div>
                            
                            {/* Messages for this date - in chronological order */}
                            {[...dateMessages].reverse().map((message) => (
                                <div 
                                    key={message.messageId}
                                    className={`flex mb-1 ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div 
                                        className={`max-w-[80%] rounded-lg px-3 py-2 ${message.sender_id === userId ? 'bg-emerald-700 text-amber-50' : 'bg-gray-700 text-amber-50'}`}
                                    >
                                        <div className='text-xs text-gray-300 mb-1'>
                                            {new Date(message.created_at).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                        <div className='break-words'>
                                            {message.message}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>     
                   
            {/* Input Area */}
            <div className='flex p-4' style = {{backgroundColor: "#202C33"}}>
                <div className='w-full flex' style = {{backgroundColor: "#2A3942"}}>
                    <input 
                        type="text" 
                        value={text}
                        placeholder="Type your message..." 
                        className="w-full p-2 text-amber-50 outline-0" 
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && text.trim() !== "") {
                                sendMessage(text);
                                setText("");
                            }
                        }}
                    />
                    <button 
                        className="bg-blue-500 text-white p-2 hover: cursor-pointer" 
                        onClick={() => {
                            sendMessage(text);
                            setText("");
                        }}> 
                        Send 
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChatContainer
