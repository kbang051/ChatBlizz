import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { useAuthStore } from "../../store/useAuthStore.ts";
import { useChatStore } from "../../store/useChatStore.ts";
import { useUserSearchStore } from "../../store/useUserSearchStore.ts";
import SideBar from "../Sidebar/SideBar.tsx";
import HeaderBar from "../Headerbar/HeaderBar.tsx";
import ChatContainer from "../ChatComponent/ChatContainer.tsx";
import SearchAllUsers from "../SearchUserComponent/SearchAllUsers.tsx";
import "react-toastify/dist/ReactToastify.css";

const HomePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { userId } = useAuthStore();
 
  const {
    getUsers,
    openChat,
    openFileUploadSection,
    subscribeToQuickNotifications,
    getUnreadMessages,
    setUnreadInitializedTrue,
  } = useChatStore();
  
  const { searchAllProfiles } = useUserSearchStore();
  
  //Load friend list on mount 
  useEffect(() => {
    getUsers()
  }, [getUsers]);

  useEffect(() => {
    subscribeToQuickNotifications();
  }, []);

  useEffect(() => {
    if (!userId) return; // don't run until userId is available
    getUnreadMessages(userId).then((success) => {
      if (success)
        setUnreadInitializedTrue();
    });
  }, [userId]);

  return (
    <div>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar - Hidden on mobile by default */}
        <SideBar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        <ToastContainer
          position="top-right"
          autoClose={10000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <HeaderBar
            onMenuClick={() => setSidebarOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 ">
            <div className="max-w-7xl mx-auto h-full">
              { openChat && <ChatContainer/> } {/* ChatContainer will be displayed if openChat is true */}
              { !openChat && !openFileUploadSection && searchAllProfiles && <SearchAllUsers/> } {/* Search all users in the db as per the search query*/}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
