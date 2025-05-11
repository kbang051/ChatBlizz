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
    setSearchAllProfilesFalse: () => void;
    searchAllResults: SearchAll[],
    setSearchAllResults: ([]: SearchAll[]) => void,
    modifySearchAllResultsOnAccept: (id: string) => void,
    searchAll: (searchQuery: string) => void,
    handleFriendStatusToogle: (userId: string) => void,
}

export const useUserSearchStore = create<UserSearchProps>((set, get) => ({
  searchAllProfiles: false,
  searchAllResults: [],

  setSearchAllProfilesFalse: () => {
    set({searchAllProfiles: false});
  },

  setSearchAllResults: (searchResults: SearchAll[]) => {
    console.log("Request received to set chat and file section to false");
    const {
      setOpenFileUploadedSectionFalse,
      setOpenChatFalse,
      openFileUploadSection,
      openChat,
    } = useChatStore.getState();
    setOpenFileUploadedSectionFalse();
    setOpenChatFalse();
    console.log(
      `Updated States : openChat --- ${openChat}, fileUpload --- ${openFileUploadSection}`
    );
    set({ searchAllProfiles: true, searchAllResults: searchResults });
  },

  searchAll: async (searchQuery: string) => {
    const { userId, authenticationToken } = useAuthStore.getState();
    if (searchQuery) {
      await axios
        .get(
          `${import.meta.env.VITE_BASE_URL}/users/fetchSearchAll/${encodeURIComponent(
            searchQuery || ""
          )}`,
          {
            headers: { Authorization: `Bearer ${authenticationToken}` },
          }
        )
        .then((res) => {
          console.log("Response onkeyDown == enter");
          console.log(res.data);
          get().setSearchAllResults(res.data);
        })
        .catch((error) => console.log("Unable to searchAll users: ", error));
    }
  },

  modifySearchAllResultsOnAccept: (id: string) => {
    const results = get().searchAllResults.filter(item => item.id !== id);
    set({searchAllResults: results});
  },

  handleFriendStatusToogle: async (userSearchId: string) => {
    const { userId, authenticationToken } = useAuthStore.getState();
    if (userSearchId) {
      await axios
        .post(
          `${import.meta.env.VITE_BASE_URL}/users/sendFriendRequest`,
          { user_id: userId, friend_id: userSearchId },
          { headers: { Authorization: `Bearer ${authenticationToken}` } }
        )
        .catch((error) => {
          console.log("Unable to upadate friend status", error);
          return;
        });
    }
    const { searchAllResults } = get();
    const updatedResults = searchAllResults.map((user) => {
      if (user.id === userSearchId) {
        let newStatus = user.status;
        if (user.status === "unknown") newStatus = "pending";
        return { ...user, status: newStatus };
      }
      return user;
    });
    set({ searchAllResults: updatedResults });
  },


}));

