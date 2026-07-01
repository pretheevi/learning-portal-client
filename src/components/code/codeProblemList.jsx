import { useEffect, useState } from 'react'
import API from '../axios/api'
import './Code.css'
import { useNavigate, useParams } from 'react-router-dom'

function DifficultyBadge({ difficulty }) {
  return <span className={`difficulty-badge ${difficulty}`}>{difficulty}</span>
}

function CodeProblemList({ onFinish }) {
  const { assignment_id } = useParams()
  const navigate = useNavigate()

  const [assignmentTitle, setAssignmentTitle] = useState('')
  const [problems, setProblems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProblems()
  }, [assignment_id])

  async function fetchProblems() {
    setIsLoading(true)
    try {
      // NOTE: adjust this path if your backend route differs
      const res = await API.get(`/dashboard/coding-assignment/${assignment_id}/problems`)
      const data = res.data.data
      console.log(res)
      setAssignmentTitle(data.assignment?.title || '')
      setProblems(data.problems || [])
    } catch (err) {
      console.log(err.response?.data)
    } finally {
      setIsLoading(false)
    }
  }

  function handleProblemClick(problem_id) {
    navigate(`/dashboard/assignmentCode/${assignment_id}/problem/${problem_id}`)
  }

  return (
    <div className="code-page">
      <div className="panel problem-list-panel">
        <div className="panel-header">
          <h3>{assignmentTitle || 'Coding Problems'}</h3>
          <button onClick={() => { onFinish?.(); navigate(-1) }}>✕</button>
        </div>

        <div className="problem-list-body">
          {isLoading ? (
            <p>Loading...</p>
          ) : problems.length === 0 ? (
            <p>No problems found for this assignment.</p>
          ) : (
            problems.map((p) => (
              <div
                key={p.problem_id}
                className="problem-list-card"
                onClick={() => handleProblemClick(p.problem_id)}
              >
                <p>{p.title}</p>
                <DifficultyBadge difficulty={p.difficulty} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default CodeProblemList
