export const initialState = {
  questions: [],
  currentIndex: 0,
  selected: '',
  submitted: false,
  score: 0,
  totalScore: 0,
  finished: false,
}

export function quizReducer(state, action) {
  switch (action.type) {

    case 'LOAD_QUESTIONS':
      return {
        ...state,
        questions: action.payload.questions,
        totalScore: action.payload.totalScore,
      }

    case 'SELECT_OPTION':
      return { ...state, selected: action.payload }

    case 'SUBMIT_CORRECT':
      return { ...state, submitted: true, score: state.score + action.payload }

    case 'SUBMIT_WRONG':
      return { ...state, submitted: true }

    case 'NEXT_QUESTION':
      return { ...state, currentIndex: state.currentIndex + 1, selected: '', submitted: false }

    case 'FINISH':
      return { ...state, finished: true }

    case 'RESET':
      return initialState

    default:
      return state
  }
}
