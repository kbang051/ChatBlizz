import React, { useRef, useEffect, useState } from 'react'
import axios from 'axios';
import FriendRequestComponent from './FriendRequestComponent.tsx';
import { useAuthStore } from '../../store/useAuthStore.ts';
import { useUserSearchStore } from '../../store/useUserSearchStore.ts';

interface HeaderBarProps {
  onMenuClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

interface Suggestions {
  id: string,
  username: string,
  email: string,
  status: string
}

const HeaderBar: React.FC<HeaderBarProps> = ({ onMenuClick, searchQuery, onSearchChange }) => {
  const { userId, authenticationToken } = useAuthStore();
  const { searchAll } = useUserSearchStore();
  const [suggestions, setSuggestions] = useState<Suggestions[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const wrappedRef = useRef<HTMLDivElement>(null);
  const showFriendRequestsRef = useRef<HTMLDivElement>(null);

  //handle mouse click outside search area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrappedRef.current && wrappedRef.current.contains(event.target as Node) == false)
        setShowSuggestions(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [])

  //handle mouse click outside friendRequest area
  useEffect(() => {
    const handleShowFriendRequests = (event: MouseEvent) => {
      if (showFriendRequestsRef.current && showFriendRequestsRef.current.contains(event.target as Node) == false)
        setShowFriendRequests(false);
    }
    document.addEventListener("mousedown", handleShowFriendRequests);
    return () => document.removeEventListener("mousedown", handleShowFriendRequests);
  }, [])

  useEffect(() => {
    const searchResultsFn = setTimeout(async () => {
        if (searchQuery) {
          await axios
            .get(
              `${import.meta.env.VITE_BASE_URL}/users/fetchRecommendation/${encodeURIComponent(searchQuery || "")}`,
              { headers: { Authorization: `Bearer ${authenticationToken}` } }
            )
            .then((res) => setSuggestions(res.data))
            .catch((error) =>
              console.log("Unable to fetch suggestions: ", error)
            );
        } else {
          setSuggestions([]);
        }
    }, 400)
    return () => clearTimeout(searchResultsFn);
  }, [searchQuery])

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Left Section - Menu Button (mobile) and Logo */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="mr-4 text-gray-500 hover:text-gray-600 md:hidden"
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-800 hidden md:block">
            Logo
          </h1>
        </div>

        {/* Center Section - Search Bar */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative" ref={wrappedRef}>
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  searchAll((e.target as HTMLInputElement).value);
                  setShowSuggestions(false);
                }
              }}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md mt-1 z-50 shadow-lg">
                {suggestions.map((item) => (
                  <p
                    key={item.id}
                    className={`p-2 cursor-pointer flex justify-between items-center ${
                      item.status === "accepted"
                        ? "bg-green-500 hover:bg-green-600"
                        : item.status === "pending"
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-amber-50 hover:bg-gray-200"
                    } `}
                  >
                    <span>{item.username}</span>
                    <span>
                      {item.status === "accepted" ? "Friend"
                        : item.status === "pending" ? "Pending"
                        : ""}
                    </span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Icons */}

        <div className="flex items-center space-x-4">
        {/* Friend Requests */}
          <div className="relative" ref = {showFriendRequestsRef}>
            <button className="p-2 text-gray-500 hover:text-gray-600 relative hover:cursor-pointer" onClick={() => setShowFriendRequests(!showFriendRequests)}>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {showFriendRequests && (
              <div className="absolute right-0 mt-2 z-50">
                <FriendRequestComponent />
              </div>
            )}
          </div>

          <button className="p-2 text-gray-500 hover:text-gray-600">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>

          <div className="relative">
            <button className="flex items-center space-x-2 focus:outline-none">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                U
              </div>
              <span className="hidden md:inline text-gray-700">User</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;


