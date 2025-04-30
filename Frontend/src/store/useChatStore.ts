import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuthStore } from "./useAuthStore.ts";
import { useUserSearchStore } from "./useUserSearchStore.ts";

interface Users {
    id: string,
    username: string,
    email: string
}

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    message: string;
    message_type: string | null; //alwaus use "file" to distinguish between files and text messages
    fileName: string | null; //always present with "file" but not with text messages
    delivered: boolean;
    created_at: string;
}

interface ChatState {
    messages: Message[],
    getMessages: (timestamp?: string) => Promise<void>,
    setMessages: (newMessage: Message[]) => void,
    viewMessageOnScroll: (timestamp?: string) => void;
    users: Users[],
    getUsers: () => Promise<void>,
    setUsers: (id: string, username: string, email: string) => void;
    selectedUser: string | null,
    setSelectedUser: (searchId: string) => void,
    isUsersLoading: boolean,
    isMessagesLoading: boolean, 
    openChat: boolean,
    openFileUploadSection: boolean,
    sendMessage: (content: string) => Promise<void>,
    subscribeToMessages: () => void,
    unsubscribeFromMessages: () => void,
    setOpenChatTrue: () => void,
    setOpenChatFalse: () => void,
    setOpenFileUploadedSectionTrue: () => void,
    setOpenFileUploadedSectionFalse: () => void,
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    openChat: false, // This state can be used to control the visibility of the chat interface and friend requests
    openFileUploadSection: false,

    getUsers: async () => {
        console.log("getUsers got called!!");
        const { userId, authenticationToken } = useAuthStore.getState();
        set({ isUsersLoading: true });
        try {
            if (!userId) throw new Error("User ID is null or undefined");
            const response = await axios.get(`http://localhost:8000/api/v1/users/getAllUsers/${encodeURIComponent(userId)}`,
              {headers: { Authorization: `Bearer ${authenticationToken}` }}
            );
            set({ users: response.data});
            toast.success("Users loaded successfully");
        } catch (error) {
            toast.error("Failed to load users");
            console.error("Error loading users:", error);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    setUsers: (id: string, username: string, email: string) => {
        set({users: [...get().users, { id, username, email }]});
    },

    getMessages: async (timestamp?: string) => {
        console.log("TimeStamp; ", timestamp);
        console.log("getMessage is getting rendered")
        set({ isMessagesLoading: true });
        try {
            const { userId, authenticationToken } = useAuthStore.getState();
            const searchId = get().selectedUser;
            const openChat = get().openChat;
            if (!userId || !searchId || !openChat) {
                console.log(`Unable to fetch user message because something amongst these are missing --- User ID: ${userId}, Search ID: ${searchId}, Open Chat: ${openChat}`);
                return;
            }
            const response = await axios.get(
              `http://localhost:8000/api/v1/users/showConversation`,
              { 
                headers: { Authorization: `Bearer ${authenticationToken}` },
                params: { userId1: userId, userId2: searchId, timestamp: timestamp } 
              }
            );
            set({ messages: response.data });
        } catch (error) {
            toast.error("Failed to load messages");
            console.error("Error loading messages:", error);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    viewMessageOnScroll: async (timestamp?: string) => {
        console.log("Request received at viewMessageOnScroll with timestamp: ", timestamp);
        set({ isMessagesLoading: true });
        try {
            const { userId, authenticationToken } = useAuthStore.getState();
            const searchId = get().selectedUser;
            const openChat = get().openChat;
            if (!userId || !searchId || !openChat) {
                console.log(`Unable to fetch user message because something amongst these are missing --- User ID: ${userId}, Search ID: ${searchId}, Open Chat: ${openChat}`);
                return;
            }
            const response = await axios.get(
                `http://localhost:8000/api/v1/users/showConversation`,
                { 
                  headers: { Authorization: `Bearer ${authenticationToken}` },
                  params: { userId1: userId, userId2: searchId, timestamp: timestamp } 
                }
            );
            set({ messages: [...response.data, ...get().messages] })
        } catch (error) {
            toast.error("Failed to load messages");
            console.error("Error loading messages:", error);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    setMessages: (newMessage: Message[]) => {
        console.log("Messages have been reset by setMessage method")
        set({messages: [...get().messages, ...newMessage]});
    },

    setSelectedUser: (searchId: string) => {
        //visit HomePage.tsx for more clarity related to component state rendering
        useUserSearchStore.getState().setSearchAllProfilesFalse();
        set({ 
            selectedUser: searchId,
            openChat: true,   
            openFileUploadSection: false,       
            messages: []             
        });
        //get().getMessages();         
    },

    setOpenFileUploadedSectionTrue: () => {
        set({ openFileUploadSection: true });
    },

    setOpenFileUploadedSectionFalse: () => {
        set({ openFileUploadSection: false });
    },

    setOpenChatTrue: () => {
        set({openChat: true});
    },

    setOpenChatFalse: () => {
        set({openChat: false});
    },

    sendMessage: async (content: string) => {
        const { selectedUser, messages } = get()
        const { userId, authenticationToken } = useAuthStore.getState();
        if (!userId || !selectedUser || content.trim() === "" || !content)
            return;
        try {
            const response = await axios.post("http://localhost:8000/api/v1/users/saveMessage",
              {
                sender_id: userId,
                receiver_id: selectedUser,
                content: content,
              },
              {
                headers: { Authorization: `Bearer ${authenticationToken}` },
              }
            );
            console.log("Message sent:", response.data);
            const alreadyExists = messages.some((message) => message.id === response.data.id)
            if (!alreadyExists) {
                console.log("Data received from sendMessage function:", response.data);
                set({messages: [...messages, response.data]});
                console.log("Message appended by sendMessage function")
            }
            console.log("Updated messages after sending new message:", get().messages);
        } catch (error: any) {
            toast.error("Unable to send message", error.response.data.message);
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;
        const socket = useAuthStore.getState().socket;
        socket.on("receive_message", (newMessage: Message) => {
            console.log("New message received without set:", newMessage);
            const isMessageFromSelectedUser = newMessage.sender_id === selectedUser;
            if (!isMessageFromSelectedUser) 
                return;
            const alreadyExists = get().messages.some((message) => message.id === newMessage.id);
            if (!alreadyExists) {
                set({messages: [...get().messages, newMessage]});
                console.log("Message appended by subscribeToMessages function")
            }
            console.log("New message received with set:", newMessage);
        })
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("receive_message");
        console.log("Unsubscribed from socket")
    }
}));