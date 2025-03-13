import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

interface User {
  id: string;
  username: string;
  email: string;
}

interface userSearchInfo {
    id: string,
    username: string,
    email: string,
    avatar: string,
    created_at: string,
    friendStatus: boolean 
}

const SideBar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([]);
  const [userSearchInfo, setUserSearchInfo] = useState<userSearchInfo>()
  
  const queryParams = new URLSearchParams(location.search)
  const searchId = queryParams.get("searchId")
  const username = queryParams.get("username")
  const email = queryParams.get("email")

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

  // This effect runs when URL parameters change
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (searchId) {
        try {
          const userId = localStorage.getItem("user_id");
          if (!userId) {
            console.log("User ID not found in localStorage");
            return;
          }
          const response = await axios.get(`http://localhost:8000/api/v1/users/getUserDetail/${encodeURIComponent(userId)}/and/${encodeURIComponent(searchId)}`);
          console.log("User details:", response.data);
          setUserSearchInfo(response.data);
        } catch (error) {
          console.log("Unable to get user details from the backend", error);
        }
      } else {
        setUserSearchInfo(undefined);
      }
    };

    fetchUserDetails();
  }, [searchId]); 

  const toggleSideBar = () => {
    const sidebar = document.querySelector("div.bg-blue-800");
    if (sidebar) {
      sidebar.classList.toggle("-translate-x-full");
    }
  };

  const userSelectionNavigation = (friendId: string, username: string, email: string) => {
    const query = new URLSearchParams({
      searchId: friendId,
      username: username,
      email: email,
    }).toString();
    const newURL = `${location.pathname}?${query}`;
    navigate(newURL);
  }

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
                  onClick={() => userSelectionNavigation(user.id, user.username, user.email)}
                >
                  {user.username}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <nav>
            <a
              href="#"
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700"
            >
              Home
            </a>
            <a
              href="#"
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700"
            >
              About
            </a>
            <a
              href="#"
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700"
            >
              Services
            </a>
            <a
              href="#"
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700"
            >
              Contact
            </a>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-10 bg-blue-950 min-h-screen border-4 border-black">
          {searchId == undefined || searchId.length === 0 ? (
            <>
              <h1 className="text-3xl font-bold mb-5 text-gray-800">
                Main Content
              </h1>
              <p className="text-gray-600">
                This is the main content area. The sidebar is responsive and
                will collapse on smaller screens.
              </p>
            </>
          ) : (
            <div className="flex justify-center items-center border-black h-full">
              {userSearchInfo != null ? (
                <div className="flex flex-col gap-4 items-center p-6 rounded-lg shadow-md w-full max-w-md bg-white">
                  <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
                    {userSearchInfo.avatar?.length > 0 ? (
                      <img
                        src={`${userSearchInfo.avatar}`}
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-12 h-12 text-gray-500"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-xl font-semibold text-gray-800">
                    {userSearchInfo.username}
                  </span>
                  <span className="text-gray-600">{userSearchInfo.email}</span>
                  <span className="text-sm text-gray-500">
                    Joined on{" "}
                    {new Date(userSearchInfo.created_at).toLocaleDateString()}
                  </span>
                  <span>
                    {userSearchInfo.friendStatus ? (
                      <button className="bg-blue-500 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-600 transition-colors">
                        Friends
                      </button>
                    ) : (
                      <button className="bg-blue-500 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-600 transition-colors">
                        Add Friend
                      </button>
                    )}
                  </span>
                </div>
              ) : (
                <p className="text-gray-600">No user found.</p>
              )}
            </div>
          )}
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


