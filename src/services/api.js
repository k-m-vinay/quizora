// Mock API service — simulates backend calls with delays
// Will be replaced with real Axios calls pointing to Express backend

import { mockUsers, mockTests, mockQuestions, mockAttempts } from './mockData'

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms))

// Deep clone helper
const clone = (obj) => JSON.parse(JSON.stringify(obj))

// In-memory state (simulates DB)
let users = clone(mockUsers)
let tests = clone(mockTests)
let questions = clone(mockQuestions)
let attempts = clone(mockAttempts)

// ============ AUTH ============

export const authAPI = {
     async login(email, password) {
          await delay(600)
          const user = users.find(u => u.email === email && u.password === password)
          if (!user) throw new Error('Invalid email or password')
          const { password: _, ...userWithoutPassword } = user
          const token = btoa(JSON.stringify({ id: user._id, role: user.role, exp: Date.now() + 86400000 }))
          return { user: userWithoutPassword, token }
     },

     async register(name, email, password, role = 'student') {
          await delay(600)
          if (users.find(u => u.email === email)) throw new Error('Email already registered')
          const newUser = {
               _id: 'user_' + Date.now(),
               name,
               email,
               password,
               role,
               createdAt: new Date().toISOString(),
          }
          users.push(newUser)
          const { password: _, ...userWithoutPassword } = newUser
          const token = btoa(JSON.stringify({ id: newUser._id, role: newUser.role, exp: Date.now() + 86400000 }))
          return { user: userWithoutPassword, token }
     },

     async getProfile(userId) {
          await delay(300)
          const user = users.find(u => u._id === userId)
          if (!user) throw new Error('User not found')
          const { password: _, ...userWithoutPassword } = user
          return userWithoutPassword
     },
}

// ============ TESTS ============

export const testAPI = {
     async getAll() {
          await delay(400)
          return clone(tests)
     },

     async getById(testId) {
          await delay(300)
          const test = tests.find(t => t._id === testId)
          if (!test) throw new Error('Test not found')
          return clone(test)
     },

     async create(testData) {
          await delay(500)
          const newTest = {
               _id: 'test_' + Date.now(),
               ...testData,
               questionsCount: 0,
               isPublished: false,
               status: 'active',
               createdAt: new Date().toISOString(),
          }
          tests.push(newTest)
          questions[newTest._id] = []
          return clone(newTest)
     },

     async update(testId, testData) {
          await delay(400)
          const index = tests.findIndex(t => t._id === testId)
          if (index === -1) throw new Error('Test not found')
          tests[index] = { ...tests[index], ...testData }
          return clone(tests[index])
     },

     async delete(testId) {
          await delay(400)
          tests = tests.filter(t => t._id !== testId)
          delete questions[testId]
          return { message: 'Test deleted successfully' }
     },

     async getAvailableForStudent(studentId) {
          await delay(400)
          const now = new Date()
          const available = tests.filter(t => {
               const start = new Date(t.startDate)
               const end = new Date(t.endDate)
               return t.isPublished && start <= now && end >= now
          })
          // Mark which ones have been attempted
          return available.map(t => ({
               ...t,
               attempted: attempts.some(a => a.studentId === studentId && a.testId === t._id),
          }))
     },

     async togglePublish(testId) {
          await delay(300)
          const index = tests.findIndex(t => t._id === testId)
          if (index === -1) throw new Error('Test not found')
          tests[index].isPublished = !tests[index].isPublished
          return clone(tests[index])
     },
}

// ============ QUESTIONS ============

export const questionAPI = {
     async getByTestId(testId) {
          await delay(300)
          return clone(questions[testId] || [])
     },

     async getByTestIdForStudent(testId) {
          await delay(300)
          const qs = questions[testId] || []
          // Don't send correct answers to student
          return qs.map(({ correctAnswer, ...q }) => q)
     },

     async create(questionData) {
          await delay(400)
          const newQ = {
               _id: 'q_' + Date.now(),
               ...questionData,
          }
          if (!questions[questionData.testId]) questions[questionData.testId] = []
          questions[questionData.testId].push(newQ)
          // Update question count on test
          const testIndex = tests.findIndex(t => t._id === questionData.testId)
          if (testIndex !== -1) tests[testIndex].questionsCount = questions[questionData.testId].length
          return clone(newQ)
     },

     async update(questionId, questionData) {
          await delay(400)
          const qs = questions[questionData.testId] || []
          const index = qs.findIndex(q => q._id === questionId)
          if (index === -1) throw new Error('Question not found')
          qs[index] = { ...qs[index], ...questionData }
          return clone(qs[index])
     },

     async delete(testId, questionId) {
          await delay(300)
          if (questions[testId]) {
               questions[testId] = questions[testId].filter(q => q._id !== questionId)
               const testIndex = tests.findIndex(t => t._id === testId)
               if (testIndex !== -1) tests[testIndex].questionsCount = questions[testId].length
          }
          return { message: 'Question deleted' }
     },
}

// ============ ATTEMPTS ============

export const attemptAPI = {
     async submit(attemptData) {
          await delay(600)
          const { studentId, testId, answers, tabSwitchCount, suspiciousLogs, startedAt } = attemptData
          const test = tests.find(t => t._id === testId)
          const qs = questions[testId] || []

          // Calculate score
          let score = 0
          qs.forEach(q => {
               if (answers[q._id] !== undefined) {
                    if (answers[q._id] === q.correctAnswer) {
                         score += q.marks
                    } else if (test.negativeMarking) {
                         score -= q.marks * test.negativeMarking
                    }
               }
          })
          score = Math.max(0, score)

          const user = users.find(u => u._id === studentId)
          const attempt = {
               _id: 'att_' + Date.now(),
               studentId,
               studentName: user ? user.name : 'Unknown',
               testId,
               testTitle: test ? test.title : 'Unknown',
               answers,
               score: Math.round(score * 100) / 100,
               totalMarks: test ? test.totalMarks : 0,
               tabSwitchCount: tabSwitchCount || 0,
               suspiciousLogs: suspiciousLogs || [],
               startedAt,
               submittedAt: new Date().toISOString(),
               percentage: test ? Math.round((score / test.totalMarks) * 1000) / 10 : 0,
          }
          attempts.push(attempt)
          return clone(attempt)
     },

     async getByStudent(studentId) {
          await delay(400)
          return clone(attempts.filter(a => a.studentId === studentId))
     },

     async getByTest(testId) {
          await delay(400)
          return clone(attempts.filter(a => a.testId === testId))
     },

     async getAll() {
          await delay(400)
          return clone(attempts)
     },

     async checkAttempted(studentId, testId) {
          await delay(200)
          return attempts.some(a => a.studentId === studentId && a.testId === testId)
     },

     async getLeaderboard(testId) {
          await delay(400)
          const testAttempts = attempts
               .filter(a => a.testId === testId)
               .sort((a, b) => b.score - a.score)
               .map((a, index) => ({ ...a, rank: index + 1 }))
          return clone(testAttempts)
     },

     async getAnalytics() {
          await delay(500)
          const totalStudents = new Set(attempts.map(a => a.studentId)).size
          const totalAttempts = attempts.length
          const avgScore = attempts.length > 0
               ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length * 10) / 10
               : 0
          const highestScore = attempts.length > 0
               ? Math.max(...attempts.map(a => a.percentage))
               : 0
          const avgTabSwitches = attempts.length > 0
               ? Math.round(attempts.reduce((s, a) => s + a.tabSwitchCount, 0) / attempts.length * 10) / 10
               : 0

          // Per-test analytics
          const testAnalytics = tests.map(test => {
               const testAttempts = attempts.filter(a => a.testId === test._id)
               return {
                    testId: test._id,
                    testTitle: test.title,
                    attemptCount: testAttempts.length,
                    avgScore: testAttempts.length > 0
                         ? Math.round(testAttempts.reduce((s, a) => s + a.percentage, 0) / testAttempts.length * 10) / 10
                         : 0,
                    highestScore: testAttempts.length > 0
                         ? Math.max(...testAttempts.map(a => a.percentage))
                         : 0,
                    lowestScore: testAttempts.length > 0
                         ? Math.min(...testAttempts.map(a => a.percentage))
                         : 0,
               }
          })

          return {
               totalStudents,
               totalAttempts,
               totalTests: tests.length,
               avgScore,
               highestScore,
               avgTabSwitches,
               testAnalytics,
          }
     },
}
