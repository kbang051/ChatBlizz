import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

interface User {
  id: string,
  email: string;
  username: string;
}

interface FriendRequestResponse {
  id: string,
  status: string,
  created_at: string,
  username: string 
}

const HeaderBar = () => {
  const [input, setInput] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [friendRequests, setFriendRequests] = useState<FriendRequestResponse[]>([])
  const searchRef = useRef<HTMLDivElement>(null);
  
  const handleInputChange = async (e: string) => {
    setInput(e);
    if (e.trim() !== "") {
      try {
        const response = await axios.get(`http://localhost:8000/api/v1/users/fetchSearchResults/${encodeURIComponent(e)}`);
        if (response.status === 200)
          setUsers(response.data);
      } catch (error) {
        console.log("Unable to fetch searchResults from the backend:", error);
      }
    } else {
      setUsers([]);
    }
  };

  // Handle clicks outside the search area to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchFriendRequests = async () => {
    const userId = localStorage.getItem("user_id") || 1
    try {
      const request = await axios.get(`http://localhost:8000/api/v1/users/displayFriendRequests/${encodeURIComponent(userId)}`);
      if (request.status === 200) {
        setFriendRequests(request.data);
      } else if (request.status === 201) {
        console.log("No pending friend requests");
      }
    } catch (error) {
      console.error("An error occured in fetchFriendRequests function", error);
    }
  }

  useEffect(() => {
    console.log("Updated Friend Requests:", friendRequests);
  }, [friendRequests]); 

  return (
    <header className="bg-gray-900 text-white shadow-md relative">
      <nav className="container mx-auto flex flex-wrap items-center justify-between py-3">
        {/* Logo */}
        <a href="https://flowbite.com" className="flex items-center space-x-3">
          <img
            src="https://flowbite.com/docs/images/logo.svg"
            className="h-8"
            alt="Flowbite Logo"
          />
          <span className="text-xl font-semibold">ChatBlizz</span>
        </a>

        {/* Search Bar */}
        <div ref={searchRef} className="relative w-96 md:block">
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              type="search"
              className="w-full p-2 pl-10 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 text-white border-white"
              placeholder="Search ChatBlizz"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
            />
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </span>
            {input && (
              <button
                onClick={() => {
                  setInput("");
                  setUsers([]);
                }}
                className="absolute inset-y-0 right-2 flex items-center"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            )}
          </form>

          {/* Search Results Dropdown */}
          {isSearchFocused && input.trim() !== "" && (
            <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
              {users.length > 0 ? (
                <ul className="py-1">
                  {users.map((user) => (
                    <li
                      key={user.email}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                    >
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No users found matching "{input}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Icons */}
        {/* <div className="flex items-center space-x-7 cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
            />
          </svg>

          <Menu as="div" className="relative inline-flex text-left">
            <MenuButton onClick={fetchFriendRequests}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6 cursor-pointer"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
            </MenuButton>
              <MenuItems className="absolute right-0 mt-5 w-72 bg-white border rounded shadow-lg cursor-pointer" anchor="bottom">
                {friendRequests.map((item, index) => (
              <React.Fragment key={item.id}>
                <MenuItem as="div" className = "flex justify-between">
                  <span className={`block px-4 py-2 text-gray-700 data-[focus]:bg-blue-100`}> {item.username} </span>
                  <span className={`block px-4 py-2 text-gray-700 data-[focus]:bg-blue-100`}> {item.status} </span>
                </MenuItem>
              </React.Fragment>
                ))}
            </MenuItems>
          </Menu>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </div> */}

        <div className="flex items-center space-x-7 cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
            />
          </svg>

          <Menu as="div" className="relative inline-flex text-left">
            <MenuButton onClick={fetchFriendRequests}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6 cursor-pointer"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
            </MenuButton>
            <MenuItems className="absolute right-0 mt-5 w-72 bg-white border rounded shadow-lg cursor-pointer overflow-y-auto max-h-60">
              {friendRequests.map((item, index) => (
                <React.Fragment key={item.id}>
                  <MenuItem as="div" className="flex justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                    <div className="flex flex-col">
                      <span className="text-gray-800 font-medium">{item.username}</span>
                      <span className="text-sm text-gray-500">{item.status}</span>
                      <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </MenuItem>
                </React.Fragment>
              ))}
            </MenuItems>
          </Menu>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </div>
      </nav>
    </header>
  );
};

export default HeaderBar;

