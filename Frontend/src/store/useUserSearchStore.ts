import axios from "axios";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore.js";
import { useChatStore } from "./useChatStore.js";

interface SearchAll {
    id: string,
    username: string,
    email: string,
    status: string
}

interface UserSearchProps {
    searchAllProfiles: boolean,
    searchAllResults: SearchAll[],
    setSearchAllResults: ([]: SearchAll[]) => void,
    searchAll: (searchQuery: string) => void,
}

export const useUserSearchStore = create<UserSearchProps>((set, get) => ({
    searchAllProfiles: false,
    searchAllResults: [],
    
    setSearchAllResults: (searchResults: SearchAll[]) => {
        console.log("Request received to set chat and file section to false");
        const { setOpenFileUploadedSectionFalse, setOpenChatFalse, openFileUploadSection, openChat } = useChatStore.getState();
        setOpenFileUploadedSectionFalse();
        setOpenChatFalse();
        console.log(`Updated States : openChat --- ${openChat}, fileUpload --- ${openFileUploadSection}`)
        set({searchAllProfiles: true, searchAllResults: searchResults});
    },

    searchAll: async (searchQuery: string) => {
        const { userId, authenticationToken } = useAuthStore.getState();
        if (searchQuery) {
            await axios.get(
                `http://localhost:8000/api/v1/users/fetchSearchResults/${encodeURIComponent(searchQuery || "")}`,
                { 
                    headers: { Authorization: `Bearer ${authenticationToken}` },
                    params: { limit: -1 }
                }
            )
            .then((res) => {
                console.log("Response onkeyDown == enter")
                console.log(res.data)
                get().setSearchAllResults(res.data)
            })
            .catch((error) => console.log("Unable to searchAll users: ", error))
        }
    }
}))

