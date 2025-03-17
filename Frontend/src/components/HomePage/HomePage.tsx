import SideBar from "../Sidebar/SideBar.tsx";
import HeaderBar from "../Headerbar/HeaderBar.tsx";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [searchId, setSearchId] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [userSearchInfo, setUserSearchInfo] = useState<userSearchInfo>()
  const [renderFetchUserDetail, setRenderFetchUserDetail] = useState(0)
    
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
      />
    </>
  );
};

export default HomePage;




