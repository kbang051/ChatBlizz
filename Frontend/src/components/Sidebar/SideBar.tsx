import React from "react";
import { useChatStore } from "../../store/useChatStore.ts"; 

interface SideBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SideBar: React.FC<SideBarProps> = ({ isOpen, onClose }) => {
  
  const { users, setSelectedUser, unreadMessage, filterUnreadMessage } = useChatStore(); // Accessing users from the chat store
  
  const checkId = (id: string) => {
    const match = unreadMessage.find((item) => item.sender_id === id);
    return match ? match.unread_count : 0;
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-30 w-64 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
          </div>

          {/* Sidebar Content */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              <li>
                <a href="#" className="flex items-center p-2 text-gray-700 rounded-lg">
                  <div className="flex flex-col gap-2">
                    <div className="font-semibold">Friends</div>
                      <ul className="space-y-1">
                        {users.map((user) => {
                          const unreadCount = checkId(user.id);
                          return (
                            <li
                              key={user.id}
                              onClick={() => {
                                setSelectedUser(user.id, user.username);
                                filterUnreadMessage(user.id);
                              }}
                              className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                            >
                              <span className="text-gray-800 font-medium">{user.username}</span>

                              {unreadCount > 0 && (
                                <span className="bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full ml-2">
                                  {unreadCount}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                  </div>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  <span>Dashboard</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  <span>Profile</span>
                </a>
              </li>
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <button className="w-full p-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              Settings
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
