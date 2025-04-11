import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuthStore } from "./useAuthStore.ts";

interface Users {
    id: string,
    username: string,
    email: string
}

interface Message {
    messageId: string;
    sender_id: string;
    receiver_id: string;
    message: string;
    delivered: boolean;
    created_at: string;
}

interface ChatState {
    messages: Message[],
    users: Users[],
    selectedUser: string | null,
    isUsersLoading: boolean,
    isMessagesLoading: boolean, 
    openChat: boolean,
    getUsers: () => Promise<void>,
    setSelectedUser: (searchId: string) => void,
    getMessages: () => Promise<void>,
    sendMessage: (content: string) => Promise<void>,
    subscribeToMessages: () => void,
    unsubscribeFromMessages: () => void,
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    openChat: false, // This state can be used to control the visibility of the chat interface and friend requests
    
    getUsers: async () => {
        const { userId } = useAuthStore.getState();
        set({ isUsersLoading: true });
        try {
            if (!userId) throw new Error("User ID is null or undefined");
            const response = await axios.get(`http://localhost:8000/api/v1/users/getAllUsers/${encodeURIComponent(userId)}`);
            set({ users: response.data});
            toast.success("Users loaded successfully");
        } catch (error) {
            toast.error("Failed to load users");
            console.error("Error loading users:", error);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async () => {
        set({ isMessagesLoading: true });
        try {
            const userId = useAuthStore.getState().userId;
            const searchId = get().selectedUser;
            const openChat = get().openChat;
            if (!userId || !searchId || !openChat) {
                console.log(`Unable to fetch user message because something amongst these are missing --- User ID: ${userId}, Search ID: ${searchId}, Open Chat: ${openChat}`);
                return;
            }
            const response = await axios.get(
              `http://localhost:8000/api/v1/users/showConversation`,
              { params: { userId1: userId, userId2: searchId, limit: 15 } }
            );
            set({ messages: response.data });
        } catch (error) {
            toast.error("Failed to load messages");
            console.error("Error loading messages:", error);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    setSelectedUser: (searchId: string) => {
        set({ 
            selectedUser: searchId,  
            openChat: true,          
            messages: []             
        });
        get().getMessages();         
    },

    // sendMessage: async (content: string) => {
    //     const { selectedUser, messages } = get()
    //     const userId = useAuthStore.getState().userId;
    //     if (!userId || !selectedUser || content.trim() === "" || !content)
    //         return;
    //     try {
    //         const response = await axios.post(
    //           "http://localhost:8000/api/v1/users/saveMessage",
    //           { sender_id: userId, receiver_id: selectedUser, content: content } 
    //         );
    //         console.log("Message sent:", response.data);
    //         set({messages: [...messages, response.data]});
    //     } catch (error: any) {
    //         toast.error("Unable to send message", error.response.data.message);
    //     }
    // },

    // subscribeToMessages: () => {
    //     const { selectedUser } = get();
    //     if (!selectedUser) return;
    //     const socket = useAuthStore.getState().socket;
    //     socket.on("receive_message", (newMessage: Message) => {
    //         console.log("New message received without set:", newMessage);
    //         const isMessageFromSelectedUser = newMessage.sender_id === selectedUser;
    //         if (!isMessageFromSelectedUser) return;
    //         set({messages: [...get().messages, newMessage]});
    //         console.log("New message received with set:", newMessage);
    //     })
    // },

    sendMessage: async (content: string) => {
        const { selectedUser, messages } = get()
        const userId = useAuthStore.getState().userId;
        if (!userId || !selectedUser || content.trim() === "" || !content)
            return;
        try {
            const response = await axios.post(
              "http://localhost:8000/api/v1/users/saveMessage",
              { sender_id: userId, receiver_id: selectedUser, content: content } 
            );
            
            // Instead of just appending, ensure the message format is consistent
            const newMessage: Message = {
                messageId: response.data.messageId,
                sender_id: userId,
                receiver_id: selectedUser,
                message: content,
                delivered: response.data.delivered || false,
                created_at: response.data.created_at || new Date().toISOString()
            };
            
            set({ messages: [...messages, newMessage] });
        } catch (error: any) {
            toast.error("Unable to send message", error.response?.data?.message || "Unknown error");
        }
    },

    // Modified message receiver function
    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;
        const socket = useAuthStore.getState().socket;
        
        socket.on("receive_message", (newMessage: Message) => {
            console.log("New message received:", newMessage);
            
            // Check if message is from or to the selected user
            const isRelevantMessage = 
                newMessage.sender_id === selectedUser || 
                (newMessage.receiver_id === selectedUser && newMessage.sender_id === useAuthStore.getState().userId);
                
            if (!isRelevantMessage) return;
            
            // Ensure the message has a consistent format with your existing messages
            const formattedMessage: Message = {
                ...newMessage,
                created_at: newMessage.created_at || new Date().toISOString()
            };
            
            set(state => ({
                messages: [...state.messages, formattedMessage]
            }));
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("receive_message");
        console.log("Unsubscribed from socket")
    }
}));