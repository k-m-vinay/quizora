import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { attemptAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
     HiTrophy, HiClock, HiChartBar, HiCheckCircle,
} from 'react-icons/hi2'

export default function StudentResults() {
     const { user } = useSelector(state => state.auth)
     const [attempts, setAttempts] = useState([])
     const [loading, setLoading] = useState(true)

     useEffect(() => { loadResults() }, [])

     const loadResults = async () => {
          try {
               const data = await attemptAPI.getByStudent(user._id)
               setAttempts(data.reverse())
          } catch (err) { console.error(err) }
          finally { setLoading(false) }
     }

     if (loading) return <LoadingSpinner size="lg" className="mt-20" />

     const avgScore = attempts.length > 0
          ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length * 10) / 10
          : 0
     const bestScore = attempts.length > 0
          ? Math.max(...attempts.map(a => a.percentage))
          : 0

     return (
          <div className="space-y-6 animate-fade-in">
               <div>
                    <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">My Results</h1>
                    <p className="text-surface-500 dark:text-surface-400 mt-1">Review your examination performance</p>
               </div>

               {/* Summary */}
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="card p-5 text-center">
                         <HiCheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                         <p className="text-2xl font-bold text-surface-900 dark:text-white">{attempts.length}</p>
                         <p className="text-xs text-surface-500 mt-1">Tests Completed</p>
                    </div>
                    <div className="card p-5 text-center">
                         <HiChartBar className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                         <p className="text-2xl font-bold text-surface-900 dark:text-white">{avgScore}%</p>
                         <p className="text-xs text-surface-500 mt-1">Average Score</p>
                    </div>
                    <div className="card p-5 text-center">
                         <HiTrophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                         <p className="text-2xl font-bold text-surface-900 dark:text-white">{bestScore}%</p>
                         <p className="text-xs text-surface-500 mt-1">Best Score</p>
                    </div>
               </div>

               {/* Results list */}
               <div className="space-y-3">
                    {attempts.map((a, i) => (
                         <div key={a._id} className="card p-5">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                   <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${a.percentage >= 75 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                                                  a.percentage >= 50 ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                                                       'bg-gradient-to-br from-red-500 to-red-600'
                                             }`}>
                                             {a.percentage}%
                                        </div>
                                        <div>
                                             <h3 className="font-semibold text-surface-900 dark:text-white">{a.testTitle}</h3>
                                             <div className="flex items-center gap-3 text-xs text-surface-500 mt-1">
                                                  <span className="flex items-center gap-1">
                                                       <HiClock className="w-3 h-3" />
                                                       {Math.round((new Date(a.submittedAt) - new Date(a.startedAt)) / 60000)} min
                                                  </span>
                                                  <span>{new Date(a.submittedAt).toLocaleDateString()}</span>
                                             </div>
                                        </div>
                                   </div>

                                   <div className="flex items-center gap-4">
                                        <div className="text-right">
                                             <p className="font-bold text-lg text-surface-900 dark:text-white">{a.score}/{a.totalMarks}</p>
                                             <span className={`badge ${a.percentage >= 75 ? 'badge-success' : a.percentage >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                                                  {a.percentage >= 75 ? 'Excellent' : a.percentage >= 50 ? 'Passed' : 'Needs Improvement'}
                                             </span>
                                        </div>
                                        {a.tabSwitchCount > 0 && (
                                             <span className={`badge ${a.tabSwitchCount > 2 ? 'badge-danger' : 'badge-warning'}`}>
                                                  {a.tabSwitchCount} switch{a.tabSwitchCount !== 1 ? 'es' : ''}
                                             </span>
                                        )}
                                   </div>
                              </div>
                         </div>
                    ))}

                    {attempts.length === 0 && (
                         <div className="text-center py-16">
                              <HiChartBar className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                              <p className="text-surface-500 font-medium">No results yet</p>
                              <p className="text-sm text-surface-400 mt-1">Take your first test to see results here</p>
                         </div>
                    )}
               </div>
          </div>
     )
}
