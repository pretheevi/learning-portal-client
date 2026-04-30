
import './fileSystem.css'
import './layout.css'
import Auth from '../auth/auth.jsx'
import AssignmentQuestions from '../quiz/quiz.jsx'
import Code from '../code/code.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFolder, faMessage, faUser } from '@fortawesome/free-solid-svg-icons'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import API from '../axios/api.js'
import { useEffect, useRef, useState } from 'react'
import Profile from '../profile/profile.jsx'
import Chat from '../chat/chat.jsx'

function formatDate(dateString) {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.toLocaleString('en-US', { month: 'short' })
  const year = String(date.getFullYear()).slice(-2)
  return `${day} ${month} ${year}`
}

const quizList = ['html', 'css', 'javascript', 'linux', 'os', 'github', 'react', 'node', 'sqlite', 'aptitude']
const codeList = ['html', 'css', 'javascript', 'react', 'node', 'sqlite']

const animations = [
  "https://lottie.host/56120fb8-e3dc-4dc5-8506-3e590a30ec29/7IznO55UDy.lottie",
  "https://lottie.host/31961654-d4bb-42e7-a68d-3601377e5792/76O5M1QYNj.lottie",
  "https://lottie.host/d105bec6-2e09-4229-9d6b-c4f933ffccf1/0h4vgASLaq.lottie",
  "https://lottie.host/bf485422-9905-43d2-b623-40f17289f675/7ZcYGPeQKn.lottie"
]

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [animIndex, setAnimIndex] = useState(0)
  const [fileSystem, setFileSystem] = useState(false)
  const [assignments, setAssignments] = useState([])
  const [assignmentLazyLoading, setAssignmentLazyLoading] = useState(false)
  const [assignmentType, setAssignmentType] = useState('quiz')
  // FIX: track which assignment is currently open
  const [activeAssignmentId, setActiveAssignmentId] = useState(null)
  const timeoutRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false) 
  const getAssignment = async (assignmentType, language) => {
    // ✅ already waiting, ignore repeat click
    if (timeoutRef.current) return
    setIsLoading(true)
    timeoutRef.current = setTimeout(async () => {
      const path = `/dashboard/assignment?assignmentType=${assignmentType}&skill_type=${language === 'HTML5' ? 'HTML' : language}&limit=10&offset=0`
      try {
        const response = await API.get(path)
        console.log(response.data)
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

  // ✅ block navigation if locked
  const handleAssignmentClick = (as, assignmentType) => {
    if (!as.is_unlocked) return          // locked — do nothing
    setActiveAssignmentId(as.assignment_id)
    if (assignmentType === 'quiz') {
      navigate(`/dashboard/assignment/${as.assignment_id}`)
    } else {
      navigate(`/dashboard/assignmentCode/${as.assignment_id}`)
    }
  }

  useEffect(() => {
    setActiveAssignmentId('')
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimIndex(prev => (prev + 1) % animations.length)
    }, 1 * 60 * 1000)  // every 1 minute

    return () => clearInterval(interval)
  }, [])


  // Layout.jsx
const [messages, setMessages] = useState([])
const wsRef = useRef(null)

  useEffect(() => {
  const token = localStorage.getItem('token')  // or wherever you store JWT
  
  wsRef.current = new WebSocket(`ws://localhost:8080/ws?token=${token}`)

  wsRef.current.onmessage = (event) => {
    const payload = JSON.parse(event.data)

    if (payload.type === 'history') {
        setMessages(payload.data)   
        console.log(payload)       // load history on connect
      } else if (payload.type === 'announcement') {
        setMessages(prev => [...prev, payload.data])  // append new message
      }
    }

    wsRef.current.onerror = (err) => console.log('WS error:', err)

    return () => {
      wsRef.current?.close()   // ✅ clean up on logout/unmount
    }
  }, [])

  return (
    <div className='bg-container'>
      <div className='bg-gif'>
        <DotLottieReact
          className='bg-gif-lottie'
          key={animIndex}   // ✅ forces remount on change so new animation loads fresh
          src={animations[animIndex]}
          loop
          autoplay
        />
      </div>

      <div className="main-container">
        <Routes>
          <Route element={<AssignmentQuestions onFinish={() => setActiveAssignmentId(null)} />} path='assignment/:assignment_id' />
          <Route element={<Code onFinish={() => setActiveAssignmentId(null)} />} path='assignmentCode/:problem_id' />
          <Route element={<Chat messages={messages} />} path='chat' />
          <Route element={<Profile />} path='profile' />              
        </Routes>
      </div>

      {fileSystem && (
        <div className='file-system-container'>
          <div className='folder-list'>
            <div className='folder-header'>
              <p>Assignments</p>
              <div className='folder-assignment-type'>
                <p onClick={() => setAssignmentType('quiz')} className={`${assignmentType === 'quiz' ? 'folder-assignment-type-active' : ''}`}>Quiz</p>
                <p onClick={() => setAssignmentType('coding')} className={`${assignmentType === 'coding' ? 'folder-assignment-type-active' : ''}`}>Code</p>
              </div>
            </div>
            <div>
              {assignmentType === 'quiz'
                ? quizList.map(qz => <p key={qz} onClick={() => getAssignment('quiz', qz)}>{qz}</p>)
                : codeList.map(cd => <p key={cd} onClick={() => getAssignment('coding', cd)}>{cd}</p>)
              }
            </div>
          </div>

          <div className='file-list'>
            {isLoading ? (
              <div className='file-list-loading'>
                <p>Loading...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className='file-list-loading'>
                <p>No assignments found</p>
              </div>
            ) : assignments.map(as => {
                  const isActive = as.assignment_id === activeAssignmentId
                  const isLocked = !as.is_unlocked
                  return (
                    <div
                      key={as.assignment_id}
                      className={`file-list-card 
                        ${isActive ? 'file-list-card--active' : ''} 
                        ${isLocked ? 'file-list-card--locked' : ''}`}
                      onClick={() => handleAssignmentClick(as, assignmentType)}  // ✅ pass full object
                    >
                      <div>
                        <p>
                          {isLocked && <span className='lock-icon'>🔒</span>}
                          {as.title}
                        </p>
                      </div>
                      <div>
                        <p>{isActive ? '▶ Open' : isLocked ? 'Locked' : formatDate(as.created_at)}</p>
                      </div>
                    </div>
                  )
                })}
          </div>
        </div>
      )}

      <nav className='nav-container'>
        <div className={`nav-icon ${fileSystem ? 'nav-icon--active' : ''}`} onClick={() => setFileSystem(prev => !prev)}>
          <FontAwesomeIcon icon={faFolder} />
        </div>
        <div className='nav-icon' onClick={() => navigate(`/dashboard/chat`)} >
          <FontAwesomeIcon icon={faMessage} />
        </div>
        <div className='nav-icon' onClick={() => navigate(`/dashboard/profile`)} >
          <FontAwesomeIcon icon={faUser} />
        </div>
      </nav>
    </div>
  )
}

export default Layout
