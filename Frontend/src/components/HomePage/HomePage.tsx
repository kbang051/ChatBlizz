import SideBar from "../Sidebar/SideBar.tsx";
import HeaderBar from "../Headerbar/HeaderBar.tsx";
import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import io from "socket.io-client";

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
    friendStatus: string  
}

const socket = io("http://localhost:8000");

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [searchId, setSearchId] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [userSearchInfo, setUserSearchInfo] = useState<userSearchInfo>()
  const [renderFetchUserDetail, setRenderFetchUserDetail] = useState(0)
  
  const [messages, setMessages] = useState<String[]>([]);
  // const [inputMessage, setInputMessage] = useState("");
  const [receiverId, setReceiverId] = useState("")

  // Register user and set up listeners

  //1. Since the dependency array is [], the useEffect runs only once when the component mounts.
  //2. It registers the current user by emitting "register" to the socket server.
  //3. handleReceiveMessage updates the messages state by appending the new message to the previous messages.
  //4. socket.on("receive_message", handleReceiveMessage); sets up a listener for incoming messages.
  //5. Even though useEffect runs only once, the event listener remains active and listens for incoming messages as long as the component is mounted.
  //6. Whenever a new message is received, socket.on triggers handleReceiveMessage, which:
          //Calls setMessages((prev) => [...prev, newMessage])
          //React automatically re-renders the component with the updated messages state.
          //This causes the new message to appear on the screen.

  useEffect(() => {
    const userId = localStorage.getItem("user_id") || "1";
    socket.emit("register", userId);
    const handleReceiveMessage = (newMessage: String) => {
      setMessages((prev) => [...prev, newMessage]);
    };
    socket.on("receive_message", handleReceiveMessage);
    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, []); 
  

  const sendMessage = useCallback((content: string, targetReceiverId: string) => {
    console.log("Data received at sendMessage function present on homepage: ", content)
    console.log("receiver_id at HomePage: ", targetReceiverId)
    if (targetReceiverId.trim() && content.trim()) {
      const messageData = {
        sender_id: localStorage.getItem("user_id") || "1",
        receiver_id: targetReceiverId.trim(),
        content: content,
      };
      console.log("Message data at home page: ", messageData)
      socket.emit("send_message", messageData);
    }
  }, [receiverId]);

  return (
    <>
      <HeaderBar setRenderFetchUserDetail={setRenderFetchUserDetail} />
      <SideBar
        searchId={searchId}
        setSearchId={setSearchId}
        users={users}
        setUsers={setUsers}
        userSearchInfo={userSearchInfo}
        setUserSearchInfo={setUserSearchInfo}
        renderFetchUserDetail={renderFetchUserDetail}
        setRenderFetchUserDetail={setRenderFetchUserDetail}

        // setInputMessage = {setInputMessage}
        setReceiverId = {setReceiverId}
        onSendMessage={sendMessage}
      />
      
    </>
  );
};

export default HomePage;




