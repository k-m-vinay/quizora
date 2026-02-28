import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
     startExam, setAnswer, clearAnswer, goToQuestion,
     nextQuestion, prevQuestion, toggleMarkForReview,
     decrementTimer, recordViolation, submitExam, resetExam,
} from '../../store/slices/examSlice'
import { testAPI, questionAPI, attemptAPI, violationAPI } from '../../services/api'
import { PageLoader } from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'
import {
     HiClock, HiChevronLeft, HiChevronRight,
     HiFlag, HiPaperAirplane, HiExclamationTriangle,
     HiArrowsPointingOut, HiShieldCheck,
} from 'react-icons/hi2'

function shuffleArray(arr) {
     const shuffled = [...arr]
     for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
     }
     return shuffled
}

export default function ExamInterface() {
     const { testId } = useParams()
     const navigate = useNavigate()
     const dispatch = useDispatch()
     const { user } = useSelector(state => state.auth)

     // ALL hooks at top level — never conditional
     const {
          examData, questions, currentQuestionIndex, answers,
          markedForReview, timeRemaining, isStarted, isSubmitted,
          tabSwitchCount, suspiciousLogs, violationTerminated, violationReason, result,
     } = useSelector(state => state.exam)

     const [loading, setLoading] = useState(true)
     const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
     const [showInstructions, setShowInstructions] = useState(true)
     const [examTempData, setExamTempData] = useState(null)
     const startTimeRef = useRef(null)
     const submitRef = useRef(null)
     const submittingRef = useRef(false)
     const [submittingState, setSubmittingState] = useState(false)
     const violationFiredRef = useRef(false)

     // Keep a ref to current state for use in event handlers (avoids stale closures)
     const stateRef = useRef({ answers: {}, tabSwitchCount: 0, suspiciousLogs: [] })
     useEffect(() => {
          stateRef.current = { answers, tabSwitchCount, suspiciousLogs }
     }, [answers, tabSwitchCount, suspiciousLogs])

     // Load test + questions
     useEffect(() => {
          loadExam()
     }, [testId])

     const loadExam = async () => {
          try {
               const alreadyAttempted = await attemptAPI.checkAttempted(user._id, testId)
               if (alreadyAttempted) {
                    toast.error('You have already attempted this test')
                    navigate('/student/tests', { replace: true })
                    return
               }
               const [test, qs] = await Promise.all([
                    testAPI.getById(testId),
                    questionAPI.getByTestIdForStudent(testId),
               ])
               setExamTempData({ test, questions: qs })
          } catch (err) {
               toast.error('Failed to load exam')
               navigate('/student/tests', { replace: true })
          } finally {
               setLoading(false)
          }
     }

     const handleStartExam = () => {
          if (!examTempData) return
          const { test, questions: qs } = examTempData
          let processedQs = qs
          if (test.shuffleQuestions) processedQs = shuffleArray(processedQs)
          startTimeRef.current = new Date().toISOString()
          violationFiredRef.current = false
          dispatch(startExam({ test, questions: processedQs }))
          setShowInstructions(false)

          // Request fullscreen
          try {
               document.documentElement.requestFullscreen?.()
          } catch (e) { /* ignore */ }
     }

     // Timer
     useEffect(() => {
          if (!isStarted || isSubmitted) return
          const timer = setInterval(() => {
               dispatch(decrementTimer())
          }, 1000)
          return () => clearInterval(timer)
     }, [isStarted, isSubmitted, dispatch])

     // Submit function using refs to always get current state
     const handleSubmit = useCallback(async (forced = false) => {
          if (submittingRef.current) return
          submittingRef.current = true
          setSubmittingState(true)
          try {
               if (document.fullscreenElement) {
                    try { document.exitFullscreen?.() } catch (e) { }
               }
               const current = stateRef.current
               const submitResult = await attemptAPI.submit({
                    studentId: user._id,
                    testId,
                    answers: current.answers,
                    tabSwitchCount: current.tabSwitchCount,
                    suspiciousLogs: current.suspiciousLogs,
                    startedAt: startTimeRef.current,
               })
               dispatch(submitExam(submitResult))
               setShowConfirmSubmit(false)
               if (forced) {
                    toast.error('Test auto-submitted')
               } else {
                    toast.success('Test submitted successfully!')
               }
          } catch (err) {
               toast.error('Failed to submit test')
          } finally {
               submittingRef.current = false
               setSubmittingState(false)
          }
     }, [user._id, testId, dispatch])

     // Keep submit ref updated
     useEffect(() => {
          submitRef.current = handleSubmit
     }, [handleSubmit])

     // Auto-submit when time runs out
     useEffect(() => {
          if (isStarted && !isSubmitted && timeRemaining <= 0) {
               submitRef.current?.(true)
          }
     }, [timeRemaining, isStarted, isSubmitted])

     // ============================================================
     // ZERO-TOLERANCE violation handler
     // Fires once: records violation → calls backend → submits exam
     // ============================================================
     const handleViolation = useCallback(async (type, detail = null) => {
          if (violationFiredRef.current || submittingRef.current) return
          violationFiredRef.current = true
          submittingRef.current = true
          setSubmittingState(true)

          // 1. Lock state in Redux immediately
          dispatch(recordViolation({ type, detail }))
          toast.error('Exam terminated due to malpractice.', { duration: 6000, icon: '🚫' })

          try {
               if (document.fullscreenElement) {
                    try { document.exitFullscreen?.() } catch (e) { }
               }

               const current = stateRef.current

               // 2. Call backend /api/violation
               const result = await violationAPI.report({
                    studentId: user._id,
                    testId,
                    answers: current.answers,
                    suspiciousLogs: [
                         ...current.suspiciousLogs,
                         { type, detail, timestamp: new Date().toISOString(), terminal: true },
                    ],
                    startedAt: startTimeRef.current,
                    violationReason: type,
               })

               // 3. Mark exam as submitted in Redux
               if (!result.alreadySubmitted) {
                    dispatch(submitExam(result))
               }
          } catch (err) {
               // Even if the API call fails, exam is locked locally
               dispatch(submitExam({
                    score: 0,
                    totalMarks: 0,
                    percentage: 0,
                    tabSwitchCount: 1,
                    terminatedByViolation: true,
                    violationReason: type,
               }))
          } finally {
               submittingRef.current = false
               setSubmittingState(false)
          }
     }, [user._id, testId, dispatch])

     // Keep a ref for the violation handler so event listeners always get latest
     const violationRef = useRef(handleViolation)
     useEffect(() => {
          violationRef.current = handleViolation
     }, [handleViolation])

     // ============================================================
     // Anti-cheat listeners — ZERO TOLERANCE
     // Every violation → immediate termination
     // ============================================================
     useEffect(() => {
          if (!isStarted || isSubmitted) return

          // --- Tab switch / visibility ---
          const onVisibilityChange = () => {
               if (document.hidden) {
                    violationRef.current('tab_switch', 'Document became hidden')
               }
          }

          // --- Window blur (Alt+Tab, clicking outside) ---
          // Delay slightly so visibilitychange fires first for tab switches
          const onWindowBlur = () => {
               setTimeout(() => {
                    // If document is hidden, visibilitychange already handled it as tab_switch
                    if (!document.hidden) {
                         violationRef.current('window_blur', 'Window lost focus')
                    }
               }, 50)
          }

          // --- Fullscreen exit ---
          const onFullscreenChange = () => {
               if (!document.fullscreenElement) {
                    violationRef.current('fullscreen_exit', 'Exited fullscreen mode')
               }
          }

          // --- Blocked keyboard shortcuts & DevTools ---
          const onKeyDown = (e) => {
               const blocked =
                    // Copy / Paste / Select All / View Source / Print
                    (e.ctrlKey && ['c', 'v', 'a', 'u', 'p', 's'].includes(e.key.toLowerCase())) ||
                    // Alt+Tab
                    (e.altKey && e.key === 'Tab') ||
                    // F12 (DevTools)
                    e.key === 'F12' ||
                    // Ctrl+Shift+I / J / C (DevTools)
                    (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) ||
                    // Cmd+Option+I (Mac DevTools)
                    (e.metaKey && e.altKey && ['i', 'I'].includes(e.key)) ||
                    // Escape
                    e.key === 'Escape'

               if (blocked) {
                    e.preventDefault()
                    e.stopPropagation()
                    const combo = `${e.ctrlKey ? 'Ctrl+' : ''}${e.altKey ? 'Alt+' : ''}${e.metaKey ? 'Cmd+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}`
                    violationRef.current('blocked_shortcut', combo)
               }
          }

          // --- Right-click ---
          const onContextMenu = (e) => {
               e.preventDefault()
               violationRef.current('right_click', 'Right-click attempted')
          }

          // --- Resolution / display change ---
          const onResize = (() => {
               let timer = null
               return () => {
                    // Debounce to avoid false positives from fullscreen transitions
                    clearTimeout(timer)
                    timer = setTimeout(() => {
                         if (!document.fullscreenElement) {
                              violationRef.current('resolution_change', `${window.innerWidth}x${window.innerHeight}`)
                         }
                    }, 500)
               }
          })()

          // --- DevTools open detection (debugger timing) ---
          const devToolsInterval = setInterval(() => {
               const start = performance.now()
               // A debugger statement causes a noticeable delay if DevTools is open
               // eslint-disable-next-line no-debugger
               const diff = performance.now() - start
               if (diff > 100) {
                    violationRef.current('devtools_open', 'DevTools detected via timing')
               }
          }, 3000)

          // --- Clipboard + selection + drag ---
          const preventDefault = (e) => {
               e.preventDefault()
               violationRef.current('clipboard_blocked', e.type)
          }
          const blockSelect = (e) => e.preventDefault()
          const blockDrag = (e) => e.preventDefault()

          // Register all listeners
          document.addEventListener('visibilitychange', onVisibilityChange)
          window.addEventListener('blur', onWindowBlur)
          document.addEventListener('fullscreenchange', onFullscreenChange)
          document.addEventListener('keydown', onKeyDown, true)
          document.addEventListener('contextmenu', onContextMenu)
          window.addEventListener('resize', onResize)
          document.addEventListener('copy', preventDefault)
          document.addEventListener('paste', preventDefault)
          document.addEventListener('cut', preventDefault)
          document.addEventListener('selectstart', blockSelect)
          document.addEventListener('dragstart', blockDrag)

          return () => {
               document.removeEventListener('visibilitychange', onVisibilityChange)
               window.removeEventListener('blur', onWindowBlur)
               document.removeEventListener('fullscreenchange', onFullscreenChange)
               document.removeEventListener('keydown', onKeyDown, true)
               document.removeEventListener('contextmenu', onContextMenu)
               window.removeEventListener('resize', onResize)
               document.removeEventListener('copy', preventDefault)
               document.removeEventListener('paste', preventDefault)
               document.removeEventListener('cut', preventDefault)
               document.removeEventListener('selectstart', blockSelect)
               document.removeEventListener('dragstart', blockDrag)
               clearInterval(devToolsInterval)
          }
     }, [isStarted, isSubmitted])

     const formatTime = (seconds) => {
          const m = Math.floor(seconds / 60)
          const s = seconds % 60
          return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
     }

     const currentQ = questions[currentQuestionIndex]
     const answeredCount = Object.keys(answers).length
     const getQuestionStatus = (q, idx) => {
          if (markedForReview.includes(q._id)) return 'review'
          if (answers[q._id] !== undefined) return 'answered'
          if (idx === currentQuestionIndex) return 'current'
          return 'unanswered'
     }

     if (loading) return <PageLoader />

     // Instructions screen
     if (showInstructions && !isStarted) {
          return (
               <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center p-4">
                    <div className="max-w-2xl w-full card-glass p-8 animate-scale-in">
                         <div className="flex items-center gap-3 mb-6">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                   <HiShieldCheck className="w-7 h-7 text-white" />
                              </div>
                              <div>
                                   <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">
                                        {examTempData?.test?.title}
                                   </h1>
                                   <p className="text-sm text-surface-500">{examTempData?.test?.description}</p>
                              </div>
                         </div>

                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                              <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 text-center">
                                   <p className="text-lg font-bold text-surface-900 dark:text-white">{examTempData?.test?.duration}</p>
                                   <p className="text-xs text-surface-500">Minutes</p>
                              </div>
                              <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 text-center">
                                   <p className="text-lg font-bold text-surface-900 dark:text-white">{examTempData?.test?.totalMarks}</p>
                                   <p className="text-xs text-surface-500">Total Marks</p>
                              </div>
                              <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 text-center">
                                   <p className="text-lg font-bold text-surface-900 dark:text-white">{examTempData?.questions?.length}</p>
                                   <p className="text-xs text-surface-500">Questions</p>
                              </div>
                              <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 text-center">
                                   <p className="text-lg font-bold text-surface-900 dark:text-white">
                                        {examTempData?.test?.negativeMarking > 0 ? `-${examTempData.test.negativeMarking}x` : 'No'}
                                   </p>
                                   <p className="text-xs text-surface-500">Neg. Marking</p>
                              </div>
                         </div>

                         <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 mb-6">
                              <h3 className="font-semibold text-red-800 dark:text-red-300 text-sm mb-2 flex items-center gap-2">
                                   <HiExclamationTriangle className="w-4 h-4" /> ⚠️ ZERO TOLERANCE — Important Instructions
                              </h3>
                              <ul className="text-xs text-red-700 dark:text-red-400 space-y-1.5">
                                   <li>• The test will enter fullscreen mode. <strong>Do not exit fullscreen.</strong></li>
                                   <li>• <strong>ANY violation will immediately terminate your exam.</strong></li>
                                   <li>• Tab switching, window switching, or Alt+Tab → instant termination.</li>
                                   <li>• Opening DevTools (F12, Ctrl+Shift+I/J/C) → instant termination.</li>
                                   <li>• Right-click, copy, paste, and keyboard shortcuts are blocked.</li>
                                   <li>• Resolution or display changes → instant termination.</li>
                                   <li>• The test will auto-submit when the timer runs out.</li>
                                   <li>• Once submitted, you cannot re-attempt this test.</li>
                              </ul>
                         </div>

                         <button onClick={handleStartExam} className="btn-primary w-full py-3.5 text-base gap-2">
                              <HiArrowsPointingOut className="w-5 h-5" />
                              Start Examination
                         </button>
                    </div>
               </div>
          )
     }

     // Result / termination screen
     if (isSubmitted) {
          const wasTerminated = result?.terminatedByViolation || violationTerminated
          return (
               <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center p-4">
                    <div className="max-w-lg w-full card-glass p-8 text-center animate-scale-in">
                         <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${wasTerminated
                              ? 'bg-gradient-to-br from-red-500 to-orange-500'
                              : 'bg-gradient-to-br from-emerald-500 to-cyan-500'
                              }`}>
                              {wasTerminated
                                   ? <HiExclamationTriangle className="w-10 h-10 text-white" />
                                   : <HiShieldCheck className="w-10 h-10 text-white" />
                              }
                         </div>

                         <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white mb-2">
                              {wasTerminated ? 'Exam Terminated' : 'Test Submitted!'}
                         </h1>
                         <p className={`mb-8 ${wasTerminated ? 'text-red-500 font-semibold' : 'text-surface-500'}`}>
                              {wasTerminated
                                   ? 'Exam terminated due to malpractice.'
                                   : 'Your responses have been recorded'}
                         </p>

                         <div className="grid grid-cols-2 gap-4 mb-8">
                              <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                                   <p className="text-3xl font-bold text-surface-900 dark:text-white">{result?.score || 0}</p>
                                   <p className="text-xs text-surface-500">Score</p>
                              </div>
                              <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                                   <p className="text-3xl font-bold text-surface-900 dark:text-white">{result?.percentage || 0}%</p>
                                   <p className="text-xs text-surface-500">Percentage</p>
                              </div>
                              <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                                   <p className="text-3xl font-bold text-surface-900 dark:text-white">{result?.totalMarks || 0}</p>
                                   <p className="text-xs text-surface-500">Total Marks</p>
                              </div>
                              <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                                   <p className={`text-3xl font-bold ${wasTerminated ? 'text-red-500' : 'text-surface-900 dark:text-white'}`}>
                                        {wasTerminated ? '🚫' : (result?.tabSwitchCount || 0)}
                                   </p>
                                   <p className="text-xs text-surface-500">{wasTerminated ? 'Violation' : 'Tab Switches'}</p>
                              </div>
                         </div>

                         {wasTerminated && (
                              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 mb-6">
                                   <p className="text-sm text-red-700 dark:text-red-300">
                                        <strong>Reason:</strong> {result?.violationReason || violationReason || 'Policy violation detected'}
                                   </p>
                              </div>
                         )}

                         <button
                              onClick={() => { dispatch(resetExam()); navigate('/student', { replace: true }) }}
                              className="btn-primary py-3 px-8"
                         >
                              Return to Dashboard
                         </button>
                    </div>
               </div>
          )
     }

     // Exam interface
     if (!isStarted || !currentQ) return <PageLoader />

     return (
          <div className="min-h-screen bg-surface-50 dark:bg-surface-950 no-select">
               {/* Top Bar */}
               <div className="sticky top-0 z-30 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 shadow-sm">
                    <div className="flex items-center justify-between px-4 lg:px-6 py-3">
                         <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                   <HiShieldCheck className="w-5 h-5 text-white" />
                              </div>
                              <h1 className="font-display font-semibold text-surface-900 dark:text-white text-sm lg:text-base truncate max-w-[200px] lg:max-w-none">
                                   {examData?.title}
                              </h1>
                         </div>

                         <div className="flex items-center gap-4">
                              <span className="badge-danger text-xs hidden sm:flex items-center gap-1">
                                   <HiShieldCheck className="w-3 h-3" />
                                   ZERO TOLERANCE
                              </span>

                              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${timeRemaining <= 60 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 animate-pulse' :
                                   timeRemaining <= 300 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
                                        'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-white'
                                   }`}>
                                   <HiClock className="w-5 h-5" />
                                   {formatTime(timeRemaining)}
                              </div>
                         </div>
                    </div>
               </div>

               <div className="flex flex-col lg:flex-row gap-4 p-4 lg:p-6 max-w-7xl mx-auto">
                    {/* Question Area */}
                    <div className="flex-1">
                         <div className="card p-6 lg:p-8">
                              <div className="flex items-center justify-between mb-6">
                                   <span className="badge-primary">
                                        Question {currentQuestionIndex + 1} of {questions.length}
                                   </span>
                                   <span className="text-sm text-surface-500">{currentQ.marks} marks</span>
                              </div>

                              <h2 className="text-lg lg:text-xl font-medium text-surface-900 dark:text-white mb-8 leading-relaxed">
                                   {currentQ.questionText}
                              </h2>

                              <div className="space-y-3">
                                   {currentQ.options.map((option, i) => {
                                        const isSelected = answers[currentQ._id] === i
                                        return (
                                             <button
                                                  key={i}
                                                  onClick={() => dispatch(setAnswer({ questionId: currentQ._id, answer: i }))}
                                                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group ${isSelected
                                                       ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                       : 'border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-surface-50 dark:hover:bg-surface-800'
                                                       }`}
                                             >
                                                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-all ${isSelected
                                                       ? 'bg-primary-500 text-white'
                                                       : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30'
                                                       }`}>
                                                       {String.fromCharCode(65 + i)}
                                                  </span>
                                                  <span className={`text-sm lg:text-base ${isSelected ? 'text-primary-700 dark:text-primary-300 font-medium' : 'text-surface-700 dark:text-surface-300'}`}>
                                                       {option}
                                                  </span>
                                             </button>
                                        )
                                   })}
                              </div>

                              <div className="flex items-center justify-between mt-8 pt-6 border-t border-surface-100 dark:border-surface-800">
                                   <div className="flex items-center gap-2">
                                        {answers[currentQ._id] !== undefined && (
                                             <button
                                                  onClick={() => dispatch(clearAnswer(currentQ._id))}
                                                  className="btn-secondary text-sm"
                                             >
                                                  Clear
                                             </button>
                                        )}
                                   </div>

                                   <div className="flex items-center gap-2">
                                        <button
                                             onClick={() => dispatch(prevQuestion())}
                                             disabled={currentQuestionIndex === 0}
                                             className="btn-secondary gap-1 text-sm"
                                        >
                                             <HiChevronLeft className="w-4 h-4" /> Previous
                                        </button>
                                        {currentQuestionIndex < questions.length - 1 && (
                                             <button
                                                  onClick={() => dispatch(nextQuestion())}
                                                  className="btn-secondary gap-1 text-sm"
                                             >
                                                  Next <HiChevronRight className="w-4 h-4" />
                                             </button>
                                        )}
                                        {currentQuestionIndex === questions.length - 1 && (
                                             <button
                                                  onClick={() => setShowConfirmSubmit(true)}
                                                  className="btn-success gap-1 text-sm"
                                             >
                                                  <HiPaperAirplane className="w-4 h-4" /> Submit
                                             </button>
                                        )}
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Question Palette */}
                    <div className="lg:w-72">
                         <div className="card p-5 lg:sticky lg:top-20">
                              <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Question Palette</h3>

                              <div className="grid grid-cols-5 gap-2 mb-6">
                                   {questions.map((q, i) => {
                                        const status = getQuestionStatus(q, i)
                                        const colors = {
                                             current: 'bg-primary-500 text-white ring-2 ring-primary-300',
                                             answered: 'bg-emerald-500 text-white',
                                             review: 'bg-amber-500 text-white',
                                             unanswered: 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-600',
                                        }
                                        return (
                                             <button
                                                  key={q._id}
                                                  onClick={() => dispatch(goToQuestion(i))}
                                                  className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${colors[status]}`}
                                             >
                                                  {i + 1}
                                             </button>
                                        )
                                   })}
                              </div>

                              <div className="space-y-2 text-xs text-surface-600 dark:text-surface-400">
                                   <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-emerald-500" /> Answered ({answeredCount})
                                   </div>
                                   <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-amber-500" /> Marked ({markedForReview.length})
                                   </div>
                                   <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-surface-200 dark:bg-surface-700" /> Not Answered ({questions.length - answeredCount})
                                   </div>
                              </div>

                              <div className="mt-5 pt-4 border-t border-surface-100 dark:border-surface-800">
                                   <div className="flex justify-between text-xs text-surface-500 mb-1.5">
                                        <span>Progress</span>
                                        <span>{answeredCount}/{questions.length}</span>
                                   </div>
                                   <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                                        <div
                                             className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full transition-all duration-300"
                                             style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                                        />
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Confirm Submit */}
               <Modal isOpen={showConfirmSubmit} onClose={() => setShowConfirmSubmit(false)} title="Submit Test" size="sm">
                    <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-3 text-center">
                              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                                   <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{answeredCount}</p>
                                   <p className="text-xs text-surface-500">Answered</p>
                              </div>
                              <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                                   <p className="text-lg font-bold text-surface-900 dark:text-white">{questions.length - answeredCount}</p>
                                   <p className="text-xs text-surface-500">Unanswered</p>
                              </div>
                         </div>
                         {questions.length - answeredCount > 0 && (
                              <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl">
                                   You have {questions.length - answeredCount} unanswered question(s).
                              </p>
                         )}
                         <div className="flex gap-3">
                              <button onClick={() => setShowConfirmSubmit(false)} className="btn-secondary flex-1">Continue Test</button>
                              <button onClick={() => handleSubmit(false)} className="btn-success flex-1">Submit</button>
                         </div>
                    </div>
               </Modal>
          </div>
     )
}
