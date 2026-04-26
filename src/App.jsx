import './App.css'
import Auth from './components/auth/auth.jsx'
import Layout from './components/layout/layout.jsx'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <>
     <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
            borderRadius: '8px',
            color: '#1a1a2e',
          },
          success: {
            style: {
              border: '1px solid #bbf7d0',
              background: '#f0fdf4',
            },
            iconTheme: {
              primary: '#16a34a',
              secondary: '#fff',
            },
          },
          error: {
            style: {
              border: '1px solid #fecaca',
              background: '#fef2f2',
            },
            iconTheme: {
              primary: '#dc2626',
              secondary: '#fff',
            },
          },
        }}
      /> 
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Auth />} />
        <Route path='/dashboard/*' element={<Layout />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
