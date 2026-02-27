import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { testAPI, attemptAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import {
     HiClock, HiAcademicCap, HiArrowRight, HiLockClosed,
     HiCheckCircle, HiExclamationTriangle, HiQueueList,
} from 'react-icons/hi2'

export default function AvailableTests() {
     const { user } = useSelector(state => state.auth)
     const [tests, setTests] = useState([])
     const [loading, setLoading] = useState(true)
     const navigate = useNavigate()

     useEffect(() => { loadTests() }, [])

     const loadTests = async () => {
          try {
               const data = await testAPI.getAvailableForStudent(user._id)
               setTests(data)
          } catch (err) { toast.error('Failed to load tests') }
          finally { setLoading(false) }
     }

     const handleStartTest = async (test) => {
          if (test.attempted) {
               toast.error('You have already attempted this test')
               return
          }
          navigate(`/student/exam/${test._id}`)
     }

     if (loading) return <LoadingSpinner size="lg" className="mt-20" />

     return (
          <div className="space-y-6 animate-fade-in">
               <div>
                    <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Available Tests</h1>
                    <p className="text-surface-500 dark:text-surface-400 mt-1">Select a test to begin your examination</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {tests.map(test => (
                         <div key={test._id} className={`card p-6 relative overflow-hidden ${test.attempted ? 'opacity-80' : ''}`}>
                              {test.attempted && (
                                   <div className="absolute top-3 right-3">
                                        <span className="badge-success flex items-center gap-1">
                                             <HiCheckCircle className="w-3.5 h-3.5" /> Completed
                                        </span>
                                   </div>
                              )}

                              <h3 className="font-semibold text-lg text-surface-900 dark:text-white mb-2 pr-20">{test.title}</h3>
                              <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2 mb-4">{test.description}</p>

                              <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                                   <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                                        <HiClock className="w-4 h-4 text-primary-500" />
                                        <span>{test.duration} minutes</span>
                                   </div>
                                   <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                                        <HiAcademicCap className="w-4 h-4 text-emerald-500" />
                                        <span>{test.totalMarks} marks</span>
                                   </div>
                                   <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                                        <HiQueueList className="w-4 h-4 text-amber-500" />
                                        <span>{test.questionsCount} questions</span>
                                   </div>
                                   {test.negativeMarking > 0 && (
                                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                             <HiExclamationTriangle className="w-4 h-4" />
                                             <span>-{test.negativeMarking}x penalty</span>
                                        </div>
                                   )}
                              </div>

                              {test.shuffleQuestions && <span className="badge-primary text-xs mr-2">Shuffled Questions</span>}
                              {test.shuffleOptions && <span className="badge-primary text-xs">Shuffled Options</span>}

                              <button
                                   onClick={() => handleStartTest(test)}
                                   disabled={test.attempted}
                                   className={`w-full mt-5 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${test.attempted
                                             ? 'bg-surface-100 dark:bg-surface-800 text-surface-400 dark:text-surface-500 cursor-not-allowed'
                                             : 'btn-primary'
                                        }`}
                              >
                                   {test.attempted ? (
                                        <>
                                             <HiLockClosed className="w-4 h-4" /> Already Attempted
                                        </>
                                   ) : (
                                        <>
                                             Start Test <HiArrowRight className="w-4 h-4" />
                                        </>
                                   )}
                              </button>
                         </div>
                    ))}
               </div>

               {tests.length === 0 && (
                    <div className="text-center py-20">
                         <HiAcademicCap className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                         <p className="text-surface-500 dark:text-surface-400 font-medium">No tests available right now</p>
                         <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">Check back later for new tests</p>
                    </div>
               )}
          </div>
     )
}
