import { create } from "zustand"
import { auth } from "../firebase.ts";
import { signInWithEmailAndPassword, User } from "firebase/auth";
import { io } from "socket.io-client";

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    socket: any;
    authenticated: boolean;
    onlineUsers: string[]; // Array of online user IDs --- pending
    userId: string | null;
    authenticationToken: string | null;
    login: (email: string, password: string) => Promise<void>;
    connectSocket: () => void;
    disconnectSocket: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isLoading: false,
    error: null,
    onlineUsers: [], 
    socket: null, 
    authenticated: false,
    userId: null,
    authenticationToken: null, //used in axios requests for user request validation

    login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            set({ 
                user: userCredential.user, 
                isLoading: false, 
                authenticated: true, 
                userId: userCredential.user.uid,
                authenticationToken: await auth.currentUser?.getIdToken(),
            });
            // localStorage.setItem("user_id", userCredential.user.uid)
            get().connectSocket();
        } catch (error: any) {
            console.log("Error logging in:", error.message);
            set({ error: error.message });
        } finally {
            set({ isLoading: false });
        }
    },

    connectSocket: () => {
        const { userId, authenticationToken } = get();
        const socket = io("http://localhost:8000", { auth: { token: authenticationToken } }); 
        socket.connect();
        set({ socket: socket });
        if (userId) 
            socket.emit("register", userId);
    },

    disconnectSocket: () => {
        if (get().socket?.connected) 
            get().socket.disconnect();
    },
}));



