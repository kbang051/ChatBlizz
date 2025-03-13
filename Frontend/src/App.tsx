import RegisterUser from './components/Login/RegisterUser.tsx'
import SignIn from './components/Login/SignIn.tsx'
import SideBar from './components/Sidebar/SideBar.tsx'
import HeaderBar from './components/Headerbar/HeaderBar.tsx'
import HomePage from './components/HomePage/HomePage.tsx'
import { Outlet, useLocation, BrowserRouter, Routes, Route } from 'react-router-dom'

const RootLayout = () => {
  const location = useLocation()
  const noHeaderRoutes = ["/", "/register", "/HomePage"]
  const shouldShowHeader = !noHeaderRoutes.includes(location.pathname)
  
  return (
    <>
      {shouldShowHeader && <HeaderBar/>}
      <Outlet/>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route element={<RootLayout/>}>
        <Route path="/" element={<SignIn/>} />
        <Route path="/register" element={<RegisterUser/>} />
        <Route path="/HomePage" element={<HomePage/>} />
      </Route>
    </Routes>
  </BrowserRouter>
  )
}

export default App

    // <>
    //   {/* <SignIn/> */}
    //   {/* <RegisterUser/> */}
    //   <HeaderBar/>
    //   <SideBar/>
    // </>
