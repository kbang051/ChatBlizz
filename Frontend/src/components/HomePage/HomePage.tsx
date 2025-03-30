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
  useEffect(() => {
    const userId = localStorage.getItem("user_id") || "1";
    socket.emit("register", userId);
    socket.on("receive_message", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });
    return () => {
      socket.off("receive_message");
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




