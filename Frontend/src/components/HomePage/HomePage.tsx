import SideBar from "../Sidebar/SideBar.tsx";
import HeaderBar from "../Headerbar/HeaderBar.tsx";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const HomePage = () => {
  return (
    <>
      <HeaderBar />
      <SideBar />
    </>
  );
};

export default HomePage;

