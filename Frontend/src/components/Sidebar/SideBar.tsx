
import React, { useEffect, useState } from "react";
import axios from "axios";
import ChatWindow from "../ChatComponent/ChatWindow.tsx";
import { useNavigate, useLocation } from "react-router-dom";

interface User {
  id: string;
  username: string;
  email: string;
}

interface userSearchInfo {
  id: string;
  username: string;
  email: string;
  avatar: string;
  created_at: string;
  friendStatus: string;
}

interface SideBarProps {
  searchId: string | null;
  setSearchId: React.Dispatch<React.SetStateAction<string | null>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  userSearchInfo: userSearchInfo | undefined;
  setUserSearchInfo: React.Dispatch<React.SetStateAction<userSearchInfo | undefined>>;
  renderFetchUserDetail: number;
  setRenderFetchUserDetail: React.Dispatch<React.SetStateAction<number>>;
  // setInputMessage: React.Dispatch<React.SetStateAction<string>>;
  setReceiverId: React.Dispatch<React.SetStateAction<string>>;
  onSendMessage: (content: string, targetReceiverId: string) => void
}

const SideBar: React.FC<SideBarProps> = ({
  searchId,
  setSearchId,
  users,
  setUsers,
  userSearchInfo,
  setUserSearchInfo,
  renderFetchUserDetail,
  setRenderFetchUserDetail,
  // setInputMessage,
  setReceiverId,
  onSendMessage
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  useEffect(() => {
    const searchIdExtracted = queryParams.get("searchId");
    setSearchId(searchIdExtracted);
  }, [location.search]);

  useEffect(() => {
    const getAllUsers = async () => {
      const userId = localStorage.getItem("user_id") || 1;
      try {
        const response = await axios.get(
          `http://localhost:8000/api/v1/users/getAllUsers/${encodeURIComponent(
            userId
          )}`
        );
        if (response.status === 200) {
          setUsers(response.data);
        }
      } catch (error) {
        console.log("Unable to fetch getAllUsers data from backend:", error);
      }
    };
    getAllUsers();
  }, [renderFetchUserDetail]);

  //This effect runs when URL parameters change
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (searchId) {
        try {
          const userId = localStorage.getItem("user_id");
          if (!userId) {
            console.log("User ID not found in localStorage");
            return;
          }
          const response = await axios.get(
            `http://localhost:8000/api/v1/users/getUserDetail/${encodeURIComponent(
              userId
            )}/and/${encodeURIComponent(searchId)}`
          );
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
  }, [searchId, renderFetchUserDetail]); //renderFetchUserDetail is used to trigger rendering of fetchUserDetails when a friend request is sent to this person

  // could be sent from parent
  const toggleSideBar = () => {
    const sidebar = document.querySelector("div.bg-blue-800");
    if (sidebar) {
      sidebar.classList.toggle("-translate-x-full");
    }
  };

  const userSelectionNavigation = (
    friendId: string,
    username: string,
    email: string
  ) => {
    const query = new URLSearchParams({
      searchId: friendId,
      username: username,
      email: email,
    }).toString();
    const newURL = `${location.pathname}?${query}`;
    navigate(newURL);
  };

  const sendFriendRequest = async (sentToUserId: string) => {
    const sentByUserId = localStorage.getItem("user_id");
    if (!sentByUserId) {
      console.log("UserId not found in the local storage");
      alert("You must be logged in to send a friend request.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/users/sendFriendRequest",
        { user_id: sentByUserId, friend_id: sentToUserId }
      );
      if (response.status === 200) {
        setRenderFetchUserDetail((prev) => prev + 1);
      } else {
        console.error("Unexpected response:", response.data);
        alert("Failed to send friend request. Please try again.");
      }
    } catch (error) {
      console.error("Unable to send friend request:", error);
      alert(
        "An error occurred while sending the friend request. Please try again."
      );
    }
  };

  return (
    <div className="bg-gray-100 h-screen">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="bg-gray-900 text-white w-64 space-y-6 px-2 py-7 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
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
          <div className="max-h-3/5 py-2.5 px-4 rounded transition duration-200 overflow-y-auto">
            <span className="block font-semibold text-lg">Available</span>
            <div className="flex flex-col pt-2 space-y-2">
              {users.map((user) => (
                <span
                  key={user.id}
                  className="p-2 rounded transition duration-200 cursor-pointer hover:bg-gray-800 border-b-1 border-gray-700"
                  onClick={() =>
                    userSelectionNavigation(user.id, user.username, user.email)
                  }
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
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-800"
            >
              Home
            </a>
            <a
              href="#"
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-800"
            >
              About
            </a>
            <a
              href="#"
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-800"
            >
              Services
            </a>
            <a
              href="#"
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-800"
            >
              Contact
            </a>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-blue-500 border-4 border-black text-white box-border">
          {searchId == undefined || searchId.length === 0 ? (
            <>
              <h1 className="text-3xl font-bold mb-5 text-white px-5 py-5">
                Main Content
              </h1>
              <p className="text-white px-5">
                This is the main content area. The sidebar is responsive and
                will collapse on smaller screens.
              </p>
            </>
          ) : userSearchInfo?.friendStatus === "accepted" ? (
            // User HeaderBar
            <>
              <div className="flex flex-col h-screen">
                {/* User HeaderBar */}
                <div className="flex h-16 w-full items-center justify-between p-8 bg-gray-900 cursor-pointer">
                  <div className="font-medium text-xl text-white">
                    <span>
                      {(userSearchInfo?.username ?? "")
                        .charAt(0)
                        .toUpperCase() +
                        (userSearchInfo?.username ?? "").substring(1)}
                    </span>
                  </div>
                  <div className="font-medium text-xl text-white flex gap-10 items-center content-center">
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-5 font-bold"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                        />
                      </svg>
                    </span>
                    <span className="size-6 font-medium">:</span>
                  </div>
                </div>

                {/* Message Area */}
                <div className="flex-1 bg-gray-700 h-screen w-full flex-col">
                  {/* Content goes here */}
                  <div className="h-11/12 w-full bg-[url('/6195005.jpg')] bg-cover bg-center" id = "messageArea">
                    {/* User messages */}
                    <ChatWindow 
                      currentUserId = {localStorage.getItem("user_id") || ""} 
                      otherUserId = {userSearchInfo?.id || ""}
                      setReceiverId = {setReceiverId}
                      onSendMessage = {onSendMessage}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center min-h-full">
              {userSearchInfo != null ? (
                <div className="flex flex-col gap-4 items-center justify-center p-6 rounded-md w-full bg-blue-950">
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
                        className="w-18 h-18 text-gray-500"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-2xl font-semibold text-gray-600">
                    {userSearchInfo.username}
                  </span>
                  <span className="text-gray-600 text-xl">
                    {userSearchInfo.email}
                  </span>
                  <span className="text-lg text-gray-500">
                    Joined on{" "}
                    {new Date(userSearchInfo.created_at).toLocaleDateString()}
                  </span>
                  <span>
                    {userSearchInfo.friendStatus === "accepted" ? (
                      <button className="btn bg-blue-500 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-600 transition-colors cursor-pointer">
                        Friends
                      </button>
                    ) : userSearchInfo.friendStatus === "pending" ? (
                      <button className="btn bg-blue-500 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-600 transition-colors cursor-pointer">
                        Pending
                      </button>
                    ) : (
                      <button
                        className="btn bg-blue-500 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-600 transition-colors cursor-pointer"
                        onClick={() => sendFriendRequest(userSearchInfo.id)}
                      >
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



// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import ChatWindow from "../ChatComponent/ChatWindow.tsx";
// import { useNavigate, useLocation } from "react-router-dom";

// interface User {
//   id: string;
//   username: string;
//   email: string;
// }

// interface userSearchInfo {
//   id: string;
//   username: string;
//   email: string;
//   avatar: string;
//   created_at: string;
//   friendStatus: string;
// }

// interface SideBarProps {
//   searchId: string | null;
//   setSearchId: React.Dispatch<React.SetStateAction<string | null>>;
//   users: User[];
//   setUsers: React.Dispatch<React.SetStateAction<User[]>>;
//   userSearchInfo: userSearchInfo | undefined;
//   setUserSearchInfo: React.Dispatch<
//     React.SetStateAction<userSearchInfo | undefined>
//   >;
//   renderFetchUserDetail: number;
//   setRenderFetchUserDetail: React.Dispatch<React.SetStateAction<number>>;
//   // setInputMessage: React.Dispatch<React.SetStateAction<string>>;
//   setReceiverId: React.Dispatch<React.SetStateAction<string>>;
//   onSendMessage: (content: string, targetReceiverId: string) => void;
// }

// const SideBar: React.FC<SideBarProps> = ({
//   searchId,
//   setSearchId,
//   users,
//   setUsers,
//   userSearchInfo,
//   setUserSearchInfo,
//   renderFetchUserDetail,
//   setRenderFetchUserDetail,
//   // setInputMessage,
//   setReceiverId,
//   onSendMessage,
// }) => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const queryParams = new URLSearchParams(location.search);

//   useEffect(() => {
//     const searchIdExtracted = queryParams.get("searchId");
//     setSearchId(searchIdExtracted);
//   }, [location.search]);

//   useEffect(() => {
//     const getAllUsers = async () => {
//       const userId = localStorage.getItem("user_id") || 1;
//       try {
//         const response = await axios.get(
//           `http://localhost:8000/api/v1/users/getAllUsers/${encodeURIComponent(
//             userId
//           )}`
//         );
//         if (response.status === 200) {
//           setUsers(response.data);
//         }
//       } catch (error) {
//         console.log("Unable to fetch getAllUsers data from backend:", error);
//       }
//     };
//     getAllUsers();
//   }, [renderFetchUserDetail]);

//   //This effect runs when URL parameters change
//   useEffect(() => {
//     const fetchUserDetails = async () => {
//       if (searchId) {
//         try {
//           const userId = localStorage.getItem("user_id");
//           if (!userId) {
//             console.log("User ID not found in localStorage");
//             return;
//           }
//           const response = await axios.get(
//             `http://localhost:8000/api/v1/users/getUserDetail/${encodeURIComponent(
//               userId
//             )}/and/${encodeURIComponent(searchId)}`
//           );
//           console.log("User details:", response.data);
//           setUserSearchInfo(response.data);
//         } catch (error) {
//           console.log("Unable to get user details from the backend", error);
//         }
//       } else {
//         setUserSearchInfo(undefined);
//       }
//     };
//     fetchUserDetails();
//   }, []); //renderFetchUserDetail is used to trigger rendering of fetchUserDetails when a friend request is sent to this person

//   // could be sent from parent
//   const toggleSideBar = () => {
//     const sidebar = document.querySelector("div.bg-blue-800");
//     if (sidebar) {
//       sidebar.classList.toggle("-translate-x-full");
//     }
//   };

//   const userSelectionNavigation = (
//     friendId: string,
//     username: string,
//     email: string
//   ) => {
//     const query = new URLSearchParams({
//       searchId: friendId,
//       username: username,
//       email: email,
//     }).toString();
//     const newURL = `${location.pathname}?${query}`;
//     navigate(newURL);
//   };

//   const sendFriendRequest = async (sentToUserId: string) => {
//     const sentByUserId = localStorage.getItem("user_id");
//     if (!sentByUserId) {
//       console.log("UserId not found in the local storage");
//       alert("You must be logged in to send a friend request.");
//       return;
//     }
//     try {
//       const response = await axios.post(
//         "http://localhost:8000/api/v1/users/sendFriendRequest",
//         { user_id: sentByUserId, friend_id: sentToUserId }
//       );
//       if (response.status === 200) {
//         setRenderFetchUserDetail((prev) => prev + 1);
//       } else {
//         console.error("Unexpected response:", response.data);
//         alert("Failed to send friend request. Please try again.");
//       }
//     } catch (error) {
//       console.error("Unable to send friend request:", error);
//       alert(
//         "An error occurred while sending the friend request. Please try again."
//       );
//     }
//   };

//   return (
//     <div className="bg-gray-100 h-full">
//       <div className="flex h-full bg-amber-950">
//         {/* Sidebar */}
//         <div className="bg-gray-900 text-white w-64 space-y-6 px-2 py-7 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
//           {" "}
//           {/* Logo */}
//           <a href="#" className="flex items-center space-x-2 px-4">
//             <svg
//               className="w-8 h-8"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M12 6v6m0 0v6m0-6h6m-6 0H6"
//               ></path>
//             </svg>
//             <span className="text-2xl font-extrabold">Logo</span>
//           </a>
//           {/* Available Users */}
//           <div className="max-h-3/5 py-2.5 px-4 rounded transition duration-200 overflow-y-auto">
//             <span className="block font-semibold text-lg">Available</span>
//             <div className="flex flex-col pt-2 space-y-2">
//               {users.map((user) => (
//                 <span
//                   key={user.id}
//                   className="p-2 rounded transition duration-200 cursor-pointer hover:bg-gray-800 border-b-1 border-gray-700"
//                   onClick={() =>
//                     userSelectionNavigation(user.id, user.username, user.email)
//                   }
//                 >
//                   {user.username}
//                 </span>
//               ))}
//             </div>
//           </div>
//           {/* Navigation */}
//           <nav>
//             <a
//               href="#"
//               className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-800"
//             >
//               Home
//             </a>
//             <a
//               href="#"
//               className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-800"
//             >
//               About
//             </a>
//             <a
//               href="#"
//               className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-800"
//             >
//               Services
//             </a>
//             <a
//               href="#"
//               className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-800"
//             >
//               Contact
//             </a>
//           </nav>
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 bg-blue-500 border-4 border-black text-white box-border">
//           {searchId == undefined || searchId.length === 0 ? (
//             <>
//               <h1 className="text-3xl font-bold mb-5 text-white px-5 py-5">
//                 Main Content
//               </h1>
//               <p className="text-white px-5">
//                 This is the main content area. The sidebar is responsive and
//                 will collapse on smaller screens.
//               </p>
//             </>
//           ) : userSearchInfo?.friendStatus === "accepted" ? (
//             // User HeaderBar
//             <>
//               <div className="flex flex-col h-full">
//                 {/* User HeaderBar */}
//                 <div className="flex h-16 items-center justify-between p-4 bg-gray-900">
//                   <div className="font-medium text-xl text-white">
//                     <span>
//                       {(userSearchInfo?.username ?? "")
//                         .charAt(0)
//                         .toUpperCase() +
//                         (userSearchInfo?.username ?? "").substring(1)}
//                     </span>
//                   </div>
//                   <div className="flex gap-4 items-center">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       strokeWidth="1.5"
//                       stroke="currentColor"
//                       className="size-5 font-bold"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
//                       />
//                     </svg>
//                     <span className="font-medium">:</span>
//                   </div>
//                 </div>

//                 {/* Message Area */}
//                 <div className="flex-1 flex flex-col bg-gray-700">
//                   {/* Content goes here */}
//                   <div className="relative flex-1">
//                     <div className="absolute inset-0 bg-[url('/6195005.jpg')] bg-cover bg-center">
//                       {/* User messages */}
//                       <ChatWindow
//                         currentUserId={localStorage.getItem("user_id") || ""}
//                         otherUserId={userSearchInfo?.id || ""}
//                         setReceiverId={setReceiverId}
//                         onSendMessage={onSendMessage}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </>
//           ) : (
//             <div className="flex justify-center items-center min-h-full">
//               {userSearchInfo != null ? (
//                 <div className="flex flex-col gap-4 items-center justify-center p-6 rounded-md w-full bg-blue-950">
//                   <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
//                     {userSearchInfo.avatar?.length > 0 ? (
//                       <img
//                         src={`${userSearchInfo.avatar}`}
//                         alt="User Avatar"
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         viewBox="0 0 24 24"
//                         fill="currentColor"
//                         className="w-18 h-18 text-gray-500"
//                       >
//                         <path
//                           fillRule="evenodd"
//                           d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
//                           clipRule="evenodd"
//                         />
//                       </svg>
//                     )}
//                   </div>
//                   <span className="text-2xl font-semibold text-gray-600">
//                     {userSearchInfo.username}
//                   </span>
//                   <span className="text-gray-600 text-xl">
//                     {userSearchInfo.email}
//                   </span>
//                   <span className="text-lg text-gray-500">
//                     Joined on{" "}
//                     {new Date(userSearchInfo.created_at).toLocaleDateString()}
//                   </span>
//                   <span>
//                     {userSearchInfo.friendStatus === "accepted" ? (
//                       <button className="btn bg-blue-500 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-600 transition-colors cursor-pointer">
//                         Friends
//                       </button>
//                     ) : userSearchInfo.friendStatus === "pending" ? (
//                       <button className="btn bg-blue-500 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-600 transition-colors cursor-pointer">
//                         Pending
//                       </button>
//                     ) : (
//                       <button
//                         className="btn bg-blue-500 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-600 transition-colors cursor-pointer"
//                         onClick={() => sendFriendRequest(userSearchInfo.id)}
//                       >
//                         Add Friend
//                       </button>
//                     )}
//                   </span>
//                 </div>
//               ) : (
//                 <p className="text-gray-600">No user found.</p>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Toggle Button */}
//       <button
//         id="sidebarToggle"
//         className="md:hidden fixed top-4 left-4 p-2 bg-blue-800 text-white rounded"
//         onClick={toggleSideBar}
//       >
//         <svg
//           className="w-6 h-6"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth="2"
//             d="M4 6h16M4 12h16m-7 6h7"
//           ></path>
//         </svg>
//       </button>
//     </div>
//   );
// };

// export default SideBar;
