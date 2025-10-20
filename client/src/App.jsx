import React from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Route, Routes} from 'react-router-dom'
import Home from './pages/Home/Home'
import { useAppContext } from './context/AppContext'
import Login from './components/Login'

const App = () => {
   const {showLogin} = useAppContext()
 


  return (
    <>
    <Navbar/>
    {showLogin && <Login/>}
    <Routes>
     <Route path='/' element={<Home/>}/>
     
     </Routes>
     
     <Footer/>
    
    </>
  )
}

export default App