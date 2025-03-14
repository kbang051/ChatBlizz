import SideBar from "../Sidebar/SideBar.tsx";
import HeaderBar from "../Headerbar/HeaderBar.tsx";
import { useState, useEffect } from "react";
import axios from "axios";


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
  
  return (
    <>
      <HeaderBar />
      <SideBar />
    </>
  );
};

export default HomePage;

