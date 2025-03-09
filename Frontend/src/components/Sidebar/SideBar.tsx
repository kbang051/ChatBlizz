import React, { useState, useEffect } from "react";
import axios from "axios";

interface User {
  id: string;
  username: string;
  email: string;
}

const SideBar: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/v1/users/getAllUsers");
        if (response.status === 200) {
          setUsers(response.data);
        }
      } catch (error) {
        console.log("Unable to fetch getAllUsers data from backend:", error);
      }
    };
    getAllUsers();
  }, []);

  useEffect(() => {
    console.log("User data", users);
  }, [users]);

  const toggleSideBar = () => {
    const sidebar = document.querySelector("div.bg-blue-800");
    if (sidebar) {
      sidebar.classList.toggle("-translate-x-full");
    }
  };

  return (
    <div className="bg-gray-100 h-screen">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="bg-blue-800 text-white w-64 space-y-6 px-2 py-7 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
          {/* Logo */}
          <a href="#" className="flex items-center space-x-2 px-4">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            <span className="text-2xl font-extrabold">Logo</span>
          </a>

          {/* Available Users */}
          <div className="h-3/5 py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700 overflow-y-auto">
            <span className="block font-semibold text-lg">Available</span>
            <div className="flex flex-col pt-2 space-y-2">
              {users.map((user) => (
                <span
                  key={user.id}
                  className="p-2 bg-blue-600 rounded hover:bg-blue-500 transition duration-200"
                >
                  {user.username}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <nav>
            <a href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700">
              Home
            </a>
            <a href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700">
              About
            </a>
            <a href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700">
              Services
            </a>
            <a href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700">
              Contact
            </a>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-10">
          <h1 className="text-3xl font-bold mb-5">Main Content</h1>
          <p>
            This is the main content area. The sidebar is responsive and will
            collapse on smaller screens.
          </p>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        id="sidebarToggle"
        className="md:hidden fixed top-4 left-4 p-2 bg-blue-800 text-white rounded"
        onClick={toggleSideBar}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16m-7 6h7"
          ></path>
        </svg>
      </button>
    </div>
  );
};

export default SideBar;


