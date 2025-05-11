import LoginSignUpPage from './components/Login/LoginSignUpPage.tsx'
import HomePage from './components/HomePage/HomePage.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<LoginSignUpPage/>} />
          <Route path="/HomePage" element={<HomePage/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

