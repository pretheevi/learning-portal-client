import './App.css'
import Auth from './components/auth/auth.jsx'
import Layout from './components/layout/layout.jsx'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Auth />} />
        <Route path='/dashboard/*' element={<Layout />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
