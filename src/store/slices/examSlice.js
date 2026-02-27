import { createSlice } from '@reduxjs/toolkit'

const initialState = {
     examData: null,
     questions: [],
     currentQuestionIndex: 0,
     answers: {},
     markedForReview: [],
     timeRemaining: 0,
     isStarted: false,
     isSubmitted: false,
     tabSwitchCount: 0,
     suspiciousLogs: [],
     showWarning: false,
     result: null,
}

const examSlice = createSlice({
     name: 'exam',
     initialState,
     reducers: {
          startExam: (state, action) => {
               state.examData = action.payload.test
               state.questions = action.payload.questions
               state.timeRemaining = action.payload.test.duration * 60
               state.isStarted = true
               state.isSubmitted = false
               state.answers = {}
               state.markedForReview = []
               state.tabSwitchCount = 0
               state.suspiciousLogs = []
               state.currentQuestionIndex = 0
               state.result = null
          },
          setAnswer: (state, action) => {
               const { questionId, answer } = action.payload
               state.answers[questionId] = answer
          },
          clearAnswer: (state, action) => {
               delete state.answers[action.payload]
          },
          goToQuestion: (state, action) => {
               state.currentQuestionIndex = action.payload
          },
          nextQuestion: (state) => {
               if (state.currentQuestionIndex < state.questions.length - 1) {
                    state.currentQuestionIndex += 1
               }
          },
          prevQuestion: (state) => {
               if (state.currentQuestionIndex > 0) {
                    state.currentQuestionIndex -= 1
               }
          },
          toggleMarkForReview: (state, action) => {
               const qId = action.payload
               if (state.markedForReview.includes(qId)) {
                    state.markedForReview = state.markedForReview.filter(id => id !== qId)
               } else {
                    state.markedForReview.push(qId)
               }
          },
          decrementTimer: (state) => {
               if (state.timeRemaining > 0) {
                    state.timeRemaining -= 1
               }
          },
          incrementTabSwitch: (state) => {
               state.tabSwitchCount += 1
               state.suspiciousLogs.push({
                    type: 'tab_switch',
                    timestamp: new Date().toISOString(),
                    count: state.tabSwitchCount,
               })
          },
          addSuspiciousLog: (state, action) => {
               state.suspiciousLogs.push({
                    ...action.payload,
                    timestamp: new Date().toISOString(),
               })
          },
          setShowWarning: (state, action) => {
               state.showWarning = action.payload
          },
          submitExam: (state, action) => {
               state.isSubmitted = true
               state.isStarted = false
               state.result = action.payload
          },
          resetExam: () => initialState,
     },
})

export const {
     startExam, setAnswer, clearAnswer, goToQuestion, nextQuestion, prevQuestion,
     toggleMarkForReview, decrementTimer, incrementTabSwitch, addSuspiciousLog,
     setShowWarning, submitExam, resetExam,
} = examSlice.actions
export default examSlice.reducer
