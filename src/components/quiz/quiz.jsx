import { useNavigate, useParams } from 'react-router-dom'
import './quiz.css'
import { useEffect, useReducer } from 'react'
import API from '../axios/api'
import { initialState, quizReducer } from './quizReducer'

function AssignmentQuestions({ onFinish }) {
  const { assignment_id } = useParams()
  const navigate = useNavigate()

  const [state, dispatch] = useReducer(quizReducer, initialState)
  const { questions, currentIndex, selected, submitted, score, totalScore, finished } = state
  const currentQuestion = questions[currentIndex]

  const getAssignmentQuestions = async () => {
    try {
      const path = `/dashboard/assignment/${assignment_id}/questions`
      const response = await API.get(path)
      const data = response.data.data
      let tScore = data.reduce((acc, quiz) => acc + quiz.points, 0)
      dispatch({type: 'LOAD_QUESTIONS', payload: {questions: data, totalScore: tScore}})
    } catch (err) {
      console.log(err.response?.data)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {navigate('/'); return}
    dispatch({type: 'RESET'})
    getAssignmentQuestions()
  }, [assignment_id])

  const handleSubmit = async () => {
    if (!selected) return
    const isCorrect = selected === currentQuestion.correct_option
    const pointsEarned = isCorrect ? currentQuestion.points : 0
    try {
      const url = `/dashboard/quiz/${currentQuestion.question_id}/submission`
      const response = await API.post(url, {
        selected_option: selected,
        is_correct: isCorrect,
        points_earned: pointsEarned
      })
      // Only update UI after successful save
      if (isCorrect) dispatch({type: 'SUBMIT_CORRECT', payload: pointsEarned})
      else dispatch({type: 'SUBMIT_WRONG'})
    } catch (err) {
      console.log(err.response?.data)
    }
  }

  const assignmentSubmit = async (finalScore, finalTotalScore) => {
    try {
      const url = `/dashboard/assignment/${assignment_id}/submission`
      await API.post(url, {
        quiz_score: finalScore,
        total_possible_score: finalTotalScore   // ✅ needed for unlock logic
      })
    } catch (err) {
      console.log(err.response?.data)
    }
  }
 
  const handleNext = () => {
    const next = currentIndex + 1
    if (next >= questions.length) {
      dispatch({ type: 'FINISH' })
      assignmentSubmit(score, totalScore)   // ✅ pass both values at finish time
      return
    }
    dispatch({ type: 'NEXT_QUESTION' })
  }

  const quitAssignment = () => {
    dispatch({type: 'RESET'})
    onFinish?.()
    navigate('/dashboard')
  }

  // BUG FIX 1: was '/dashboard/files' which doesn't exist as a route
  if (finished) {
    const percentage = totalScore > 0 ? Math.round((score / totalScore) * 100) : 0
    const unlocked = percentage >= 80

    return (
      <div className="quizCard">
        <div className="quiz-complete-icon">✓</div>
        <h1>Quiz Completed!</h1>

        <div className="quiz-score-badge">
          <span className="quiz-score-label">Final Score</span>
          <span className="quiz-score-value">{score} / {totalScore}</span>
        </div>

        {/* ✅ percentage */}
        <div className={`quiz-unlock-status ${unlocked ? 'quiz-unlock-status--unlocked' : 'quiz-unlock-status--locked'}`}>
          <span className="quiz-unlock-percentage">{percentage}%</span>
          <span className="quiz-unlock-msg">
            {unlocked
              ? '🔓 Next assignment unlocked!'
              : `🔒 Score 80% or above to unlock next assignment (${Math.ceil(totalScore * 0.8)} / ${totalScore} needed)`}
          </span>
        </div>

        <button className="btn btn-primary quiz-submit-btn" onClick={() => { onFinish?.(); navigate('/dashboard') }}>
          ← Back to Dashboard
        </button>
      </div>
    )
  }

  if (!currentQuestion) return <></>

  const options = [
    { key: 'a', text: currentQuestion.option_a },
    { key: 'b', text: currentQuestion.option_b },
    { key: 'c', text: currentQuestion.option_c },
    { key: 'd', text: currentQuestion.option_d },
  ]

  return (
    <div className="quizCard">
      <button type='button' 
        className='btn btn-primary quit-assignment-btn'
        onClick={quitAssignment}
        >Quit Assignment</button>
      <div className="quiz-progress">
        <span className="quiz-progress-text">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <div className="quiz-progress-bar">
          <div
            className="quiz-progress-fill"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h1>{currentQuestion.question_text}</h1>

      {/* BUG FIX 3: selected state now applies .quiz-option--selected class */}
      <div className="quizOptions">
        {options.map(({ key, text }) => {
          let optionClass = 'quiz-option'
          if (submitted) {
            if (key === currentQuestion.correct_option) optionClass += ' quiz-option--correct'
            else if (key === selected) optionClass += ' quiz-option--wrong'
          } else if (key === selected) {
            optionClass += ' quiz-option--selected'
          }
          return (
            <button
              key={key}
              type="button"
              className={optionClass}
              onClick={() => !submitted && dispatch({type: 'SELECT_OPTION', payload: key})}
              disabled={submitted}
            >
              <span className="quiz-option-key">{key.toUpperCase()}</span>
              <span className="quiz-option-text">{text}</span>
            </button>
          )
        })}
      </div>

      {/* BUG FIX 2: CSS classes quiz-submit-btn / quiz-next-btn now actually applied */}
      <div className="quiz-btn-container">
        {!submitted ? (
          <button
            type="button"
            className="btn btn-primary quiz-submit-btn"
            onClick={handleSubmit}
            disabled={!selected}
          >
            Submit Answer
          </button>
        ) : (
          <>
            <div className={`quiz-feedback ${selected === currentQuestion.correct_option ? 'quiz-feedback--correct' : 'quiz-feedback--wrong'}`}>
              <p className="quiz-feedback-result">
                {selected === currentQuestion.correct_option
                  ? '✓ Correct!'
                  : `✗ Wrong — Correct answer: ${currentQuestion.correct_option.toUpperCase()}`}
              </p>
              {currentQuestion.explanation && (
                <p className="quiz-feedback-explanation">{currentQuestion.explanation}</p>
              )}
            </div>
            <button type="button" className="btn btn-primary quiz-next-btn" onClick={handleNext}>
              {currentIndex + 1 >= questions.length ? 'Finish Quiz' : 'Next Question →'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default AssignmentQuestions
