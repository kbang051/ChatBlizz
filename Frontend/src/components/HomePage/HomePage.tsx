import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore.ts";
import { useChatStore } from "../../store/useChatStore.ts";
import SideBar from "../Sidebar/SideBar.tsx";
import HeaderBar from "../Headerbar/HeaderBar.tsx";
import ChatContainer from "../ChatComponent/ChatContainer.tsx";

const HomePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { getUsers, openChat } = useChatStore();
  
  //Load friend list on mount 
  useEffect(() => {
    getUsers()
  }, [getUsers]);

  return (
    <div>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar - Hidden on mobile by default */}
        <SideBar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
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
              {openChat && <ChatContainer/>} {/* ChatContainer will be displayed if openChat is true */}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
