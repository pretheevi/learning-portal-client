
import './fileSystem.css'
import Auth from '../auth/auth.jsx'
import AssignmentQuestions from '../quiz/quiz.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFolder, faUser } from '@fortawesome/free-solid-svg-icons'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import API from '../axios/api.js'
import { useEffect, useRef, useState } from 'react'

function formatDate(dateString) {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.toLocaleString('en-US', { month: 'short' })
  const year = String(date.getFullYear()).slice(-2)
  return `${day} ${month} ${year}`
}

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [fileSystem, setFileSystem] = useState(false)
  const [assignments, setAssignments] = useState([])
  const [assignmentLazyLoading, setAssignmentLazyLoading] = useState(false)
  // FIX: track which assignment is currently open
  const [activeAssignmentId, setActiveAssignmentId] = useState(null)
  const timeoutRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false) 
  const getAssignment = async (type) => {
    // ✅ already waiting, ignore repeat click
    if (timeoutRef.current) return
    setIsLoading(true)
    timeoutRef.current = setTimeout(async () => {
      const path = `/dashboard/assignment?type=${type}&limit=10&offset=0`
      try {
        const response = await API.get(path)
        setAssignments(response.data.data)
      } catch (err) {
        console.log(err.response?.data)
      } finally {
        // ✅ reset after done, so next click works
        timeoutRef.current = null
        setIsLoading(false)
      }
    }, 2000)
  }

  const handleAssignmentClick = (id) => {
    setActiveAssignmentId(id)
    navigate(`assignment/${id}`)
  }

  useEffect(() => {
    setActiveAssignmentId('')
  }, [])

  return (
    <div className='bg-container'>
      <div className="main-container">
        <Routes>
          <Route element={<AssignmentQuestions onFinish={() => setActiveAssignmentId(null)} />} path='assignment/:assignment_id' />
        </Routes>
      </div>

      {fileSystem && (
        <div className='file-system-container'>
          <div className='folder-list'>
            <p>Assignments</p>
            <p onClick={() => getAssignment('quiz')}>
              {isLoading ? 'Loading...' : 'Quiz'}
            </p>
            <p>Coding</p>
          </div>
          <div className='file-list'>
            {assignments?.map(as => {
              const isActive = as.assignment_id === activeAssignmentId
              return (
                <div
                  key={as.assignment_id}
                  // FIX: active class for visual feedback, pointer-events handled in handler
                  className={`file-list-card ${isActive ? 'file-list-card--active' : ''}`}
                  onClick={() => handleAssignmentClick(as.assignment_id)}
                >
                  <div>
                    <p>{as.title}</p>
                  </div>
                  <div>
                    <p>{isActive ? '▶ Open' : formatDate(as.created_at)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <nav className='nav-container'>
        <div
          className={`nav-icon ${fileSystem ? 'nav-icon--active' : ''}`}
          onClick={() => setFileSystem(prev => !prev)}>
          <FontAwesomeIcon icon={faFolder} />
        </div>
        <div className='nav-icon'>
          <FontAwesomeIcon icon={faUser} />
        </div>
      </nav>
    </div>
  )
}

export default Layout
