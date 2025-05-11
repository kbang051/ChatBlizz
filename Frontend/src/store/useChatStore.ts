import React from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore.ts";
import { useUserSearchStore } from "./useUserSearchStore.ts";
import NotificationToast from "../toasts/notification.tsx";

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

interface Notifications {
    sender_id: string,
    id: string, // messageId
    message: string,
    filename: string,
    created_at: string,
}

interface UnreadMessage {
    sender_id: string,
    unread_count: number
}

interface ChatState {
    messages: Message[],
    notifications: Notifications[],
    unreadMessage: UnreadMessage[],
    unreadInitialized: boolean,
    setUnreadInitializedTrue: () => void,
    scrolledMessages: Message[],
    getMessages: (timestamp?: string) => Promise<void>,
    setMessages: (newMessage: Message[]) => void,
    getUnreadMessages: (userId: string) => Promise<boolean>,
    filterUnreadMessage: (userId: string) => void,
    viewMessageOnScroll: (timestamp?: string, messageId?: string) => Promise<void>;
    users: Users[],
    getUsers: () => Promise<void>,
    setUsers: (id: string, username: string, email: string) => void;
    selectedUser: string | null,
    username: string | null,
    setSelectedUser: (searchId: string, username?: string) => void,
    isUsersLoading: boolean,
    isMessagesLoading: boolean, 
    openChat: boolean,
    openFileUploadSection: boolean,
    sendMessage: (content: string) => Promise<void>,
    subscribeToMessages: () => void,
    subscribeToQuickNotifications: () => void,
    unsubscribeFromMessages: () => void,
    setOpenChatTrue: () => void,
    setOpenChatFalse: () => void,
    setOpenFileUploadedSectionTrue: () => void,
    setOpenFileUploadedSectionFalse: () => void,
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    notifications: [],
    unreadMessage: [],
    unreadInitialized: false, // listen to notifications and then update unread messages after unread messages are properly initialized 
    scrolledMessages: [],
    users: [],
    selectedUser: null,
    username: null,
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
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/getAllUsers/${encodeURIComponent(userId)}`,
              {headers: { Authorization: `Bearer ${authenticationToken}` }}
            );
            set({ users: response.data});
            //toast.success("Users loaded successfully");
        } catch (error) {
            //toast.error("Failed to load users");
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
              `${import.meta.env.VITE_BASE_URL}/users/showConversation`,
              { 
                headers: { Authorization: `Bearer ${authenticationToken}` },
                params: { userId1: userId, userId2: searchId, timestamp: timestamp } 
              }
            );
            set({ messages: response.data });
        } catch (error) {
            //toast.error("Failed to load messages");
            console.error("Error loading messages:", error);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    getUnreadMessages: async (userId: string) => {
        console.log("Request sent to backend to fetch unread messages");
        try {
            const { authenticationToken } = useAuthStore.getState();
            if (userId === null || userId === undefined || userId === "") {
                return false;
            }
            const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/getUnreadMessages`, {
                headers: { Authorization: `Bearer ${authenticationToken}`},
                params: { userId: userId }
            })
            set({ unreadMessage: res.data });
            return true;
        } catch (error) {
            console.log("Error in getUnreadMessages: ", error);
            return false; // Ensure a boolean is always returned
        }
    },

    setUnreadInitializedTrue: () => {
        set({ unreadInitialized: true });
    },

    filterUnreadMessage: (userId: string) => {
        const array = get().unreadMessage;
        set({unreadMessage: array.filter((item) => item.sender_id !== userId)});
        console.log("Unread message after filtering: ", get().unreadMessage);
    },

    viewMessageOnScroll: async (timestamp?: string, messageId?: string) => {
        console.log("Request received at viewMessageOnScroll with timestamp: ", timestamp, "and messageId: ", messageId);
        const { isMessagesLoading } = get();
        if (isMessagesLoading)  // new request is sent to the backend only when the previous request has finished its execution
            return;
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
                `${import.meta.env.VITE_BASE_URL}/users/showConversation`,
                { 
                  headers: { Authorization: `Bearer ${authenticationToken}` },
                  params: { userId1: userId, userId2: searchId, timestamp: timestamp, messageId: messageId } 
                }
            );
            set({ scrolledMessages: [...response.data] }); // temporary - can be removed, just for clarity
            set({ messages: [...get().messages, ...get().scrolledMessages]}); // append previousMessages to originalMessages
        } catch (error) {
            //toast.error("Failed to load messages");
            console.error("Error loading messages:", error);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    setMessages: (newMessage: Message[]) => {
        console.log("Messages have been reset by setMessage method")
        //set({messages: [...get().messages, ...newMessage]});
        set({messages: [...newMessage, ...get().messages]});
    },

    setSelectedUser: (searchId: string, username?: string) => {
        //visit HomePage.tsx for more clarity related to component state rendering
        useUserSearchStore.getState().setSearchAllProfilesFalse();
        set({ 
            selectedUser: searchId,
            username: username,
            openChat: true,   
            openFileUploadSection: false,       
            messages: []             
        });         
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
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/saveMessage`,
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
                set({messages: [response.data, ...messages]});
                //set({messages: [...messages, response.data]}); original
                console.log("Message appended by sendMessage function")
            }
            console.log("Updated messages after sending new message:", get().messages);
        } catch (error: any) {
            //toast.error("Unable to send message", error.response.data.message);
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;
        const socket = useAuthStore.getState().socket;
        socket.on("receive_message", (newMessage: Message) => {
            const isMessageFromSelectedUser = newMessage.sender_id === selectedUser;
            if (!isMessageFromSelectedUser) 
                return;
            const alreadyExists = get().messages.some((message) => message.id === newMessage.id);
            if (!alreadyExists) {
                //set({messages: [...get().messages, newMessage]});
                set({messages: [newMessage, ...get().messages ]});
                console.log("Message appended by subscribeToMessages function")
            }
        })
    },

    subscribeToQuickNotifications: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) {
          console.log("SocketId not available for notifications: ", socket);
          return;
        }
      
        socket.off("receive_notification");
        socket.on("receive_notification", (notification: Notifications) => {
          console.log("New message received without set:", notification);
          if (!notification) return;
      
          const { selectedUser, unreadMessage, notifications, unreadInitialized } = get();
      
          set({ notifications: [notification, ...notifications] });
          toast(React.createElement(NotificationToast, { notification }));
      
          console.log(`Notification id - ${notification.sender_id} and selectedUser - ${selectedUser}`);
      
          if (unreadInitialized && notification.sender_id !== selectedUser) {
            const findPerson = unreadMessage.find((item) => String(item.sender_id) === String(notification.sender_id));
      
            if (!findPerson) {
              console.log(`Couldn't find any previous notification from sender - ${notification.sender_id} in unreadMessage`);
              set({ unreadMessage: [...unreadMessage, { sender_id: notification.sender_id, unread_count: 1 }]});
            } else {
              console.log(`Found previous notification from sender - ${notification.sender_id} in unreadMessage`);
              const updateUnread = unreadMessage.map((item) => String(item.sender_id) === String(notification.sender_id) ? { ...item, unread_count: item.unread_count + 1 } : item);
              set({ unreadMessage: updateUnread });
            }
      
            console.log("Updated unread messages: ", get().unreadMessage);
          }
        });
      },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("receive_message");
        console.log("Unsubscribed from socket")
    }
}));