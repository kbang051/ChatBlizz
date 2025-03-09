import './App.css'
import RegisterUser from './components/Login/RegisterUser.tsx'
import SignIn from './components/Login/SignIn.tsx'
import SideBar from './components/Sidebar/SideBar.tsx'
import HeaderBar from './components/Headerbar/HeaderBar.tsx'

function App() {
  return (
    <>
      {/* <h2 className='text-3xl font-bold underline'> This is some text </h2> */}
      {/* <SignIn/> */}
      {/* <RegisterUser/> */}
      <HeaderBar/>
      <SideBar/>
    </>
  )
}

export default App
