import { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import API from '../axios/api'
import './Code.css'
import { useNavigate, useParams } from 'react-router-dom'

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
]

const STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  SUBMITTING: 'submitting',
}

function DifficultyBadge({ difficulty }) {
  return <span className={`difficulty-badge ${difficulty}`}>{difficulty}</span>
}

function Code({ onFinish }) {
  const { assignment_id, problem_id } = useParams()
  const navigate = useNavigate()
  const editorRef = useRef(null)

  const [problemData, setProblemData] = useState(null)
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState('')
  const [functionName, setFunctionName] = useState('solve')
  const [status, setStatus] = useState(STATUS.IDLE)
  const [runResults, setRunResults] = useState([])
  const [submitResult, setSubmitResult] = useState(null)
  const [activeTab, setActiveTab] = useState('testcases')

  const isBusy = status === STATUS.RUNNING || status === STATUS.SUBMITTING

  useEffect(() => {
    fetchProblem()
  }, [problem_id])

  async function fetchProblem() {
    try {
      const res = await API.get(`/dashboard/coding-problem/${problem_id}`)
      console.log(res)
      const data = res.data.data
      setProblemData(data)
      let a = data.examples[0]?.example_input
      console.log(JSON.parse(a))
      setLanguage(data.problem.language || 'javascript')
      setFunctionName(data.problem.function_name || 'solve')
      setCode(getStarterCode(data.problem.language))
    } catch (err) {
       console.log(err.response?.data)
    }
  }

  function getStarterCode(lang) {
    if (lang === 'python') return `def ${functionName}():\n    pass`
    if (lang === 'java') return `class Main {\n    public static void main(String[] args) {\n\n    }\n}`
    return `function ${functionName}() {\n\n}`
  }

  async function handleRun() {
    try {
      setStatus(STATUS.RUNNING)
      setActiveTab('testcases')
      setRunResults([])
      const res = await API.post('/dashboard/code/run', { problem_id, language, code, function_name: functionName })
      setRunResults(res.data.data || [])
      console.log(res)
    } catch (err) {
      console.log(err)
    } finally {
      setStatus(STATUS.IDLE)
    }
  }

  async function handleSubmit() {
    try {
      setStatus(STATUS.SUBMITTING)
      setActiveTab('results')
      const res = await API.post('/dashboard/code/submit', { problem_id, language, code, function_name: functionName })
      setSubmitResult(res.data.data)
      console.log(res.data.data.results)
    } catch (err) {
      console.log(err)
    } finally {
      setStatus(STATUS.IDLE)
    }
  }

  function handleLanguageChange(e) {
    const lang = e.target.value
    setLanguage(lang)
    setCode(getStarterCode(lang))
  }

  function handleBackToProblems() {
    if (assignment_id) {
      navigate(`/dashboard/assignmentCode/${assignment_id}`)
    } else {
      navigate(-1)
    }
  }

  if (!problemData) return <div className="code-page">Loading...</div>

  const info = problemData.problem

  return (
    <div className="code-page">
      <div className="panel problem-panel">
        <div className="panel-header">
          {assignment_id && (
            <button className="back-link" onClick={handleBackToProblems}>← Problems</button>
          )}
          <h3>{info.title}</h3>
          <DifficultyBadge difficulty={info.difficulty} />
        </div>
        <div className="problem-body">
          <p>{info.description}</p>
          <h4>Examples</h4>
          {problemData.examples?.map((item, index) => (
            <div key={index} className="example-block">
              <p><b>Input:</b> {JSON.stringify(JSON.parse(item.example_input).args)}</p>
              <p><b>Output:</b> {item.example_output}</p>
              {item.explanation && <p><b>Explanation:</b> {item.explanation}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="panel editor-panel">
        <div className="editor-topbar">
          <select value={language} onChange={handleLanguageChange} disabled={isBusy}>
            {LANGUAGES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
          {/* FIX: clear active state AND navigate back */}
          <button onClick={() => { onFinish?.(); navigate(-1) }}>✕</button>
        </div>
        <div className="editor-wrapper">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(value) => setCode(value || '')}
            onMount={(editor) => (editorRef.current = editor)}
            theme="vs-light"
          />
        </div>
        <div className="editor-bottombar">
          <button onClick={handleRun} disabled={isBusy}>Run</button>
          <button onClick={handleSubmit} disabled={isBusy}>Submit</button>
        </div>
      </div>

      <div className="panel result-panel">
        <div className="result-tabs">
          <button className={activeTab === 'testcases' ? 'active' : ''} onClick={() => setActiveTab('testcases')}>
            Test Cases
          </button>
          <button className={activeTab === 'results' ? 'active' : ''} onClick={() => setActiveTab('results')}>
            Results
          </button>
        </div>
        <div className="result-body">
          {activeTab === 'testcases' && (
            <div>
              {runResults.map((item, index) => (
                <div key={index} className="case-card">
                  <p><b>Case {index + 1}</b></p>
                  <p>Input: {item.testcase_input}</p>
                  <p>Expected: {item.testcase_expected_output}</p>
                  <p>Output: {item.actual_output}</p>
                  <p>{item.passed ? 'Passed' : 'Failed'}</p>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'results' && submitResult && (
            <div>
              <p><b>Passed:</b> {submitResult?.total_testcase_pass}</p>
              <p><b>Total:</b> {submitResult?.total_cases}</p>
              <p><b>Score:</b> {submitResult?.score}</p>
              <p><b>Submitted:</b> {submitResult?.submitted_at}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Code
