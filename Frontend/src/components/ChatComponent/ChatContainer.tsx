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

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b text-amber-50" style = {{backgroundColor: "#202C33"}}>
                <h2 className="text-lg hover:cursor-pointer">{selectedUser}</h2>
            </div>

            {/* Message Area */}
            <div className='flex-1 p-4 bg-gray-950 overflow-y-auto'>
                <div className='flex flex-col'>
                    {messages.map((message) => (
                        <div 
                            key={message.id}
                            className={`flex mb-1 ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] rounded-lg px-3 py-2 ${message.sender_id === userId ? 'bg-emerald-700 text-amber-50' : 'bg-gray-700 text-amber-50'}`}>
                                <div className='break-words'>
                                    {message.message}
                                </div>
                            </div>
                        </div>
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
