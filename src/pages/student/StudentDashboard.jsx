import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { testAPI, attemptAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
     HiDocumentText, HiTrophy, HiChartBar, HiClock,
     HiArrowRight, HiCheckCircle, HiAcademicCap,
} from 'react-icons/hi2'

export default function StudentDashboard() {
     const { user } = useSelector(state => state.auth)
     const [stats, setStats] = useState({ available: 0, attempted: 0, avgScore: 0 })
     const [recentAttempts, setRecentAttempts] = useState([])
     const [loading, setLoading] = useState(true)

     useEffect(() => {
          loadData()
     }, [])

     const loadData = async () => {
          try {
               const [tests, attempts] = await Promise.all([
                    testAPI.getAvailableForStudent(user._id),
                    attemptAPI.getByStudent(user._id),
               ])
               const avgScore = attempts.length > 0
                    ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length * 10) / 10
                    : 0
               setStats({
                    available: tests.filter(t => !t.attempted).length,
                    attempted: attempts.length,
                    avgScore,
               })
               setRecentAttempts(attempts.slice(-3).reverse())
          } catch (err) { console.error(err) }
          finally { setLoading(false) }
     }

     if (loading) return <LoadingSpinner size="lg" className="mt-20" />

     return (
          <div className="space-y-8 animate-fade-in">
               <div>
                    <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">
                         Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
                    </h1>
                    <p className="text-surface-500 dark:text-surface-400 mt-1">Here's your examination overview</p>
               </div>

               {/* Stats */}
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="card p-5 hover:scale-[1.02] transition-transform">
                         <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                                   <HiDocumentText className="w-6 h-6 text-primary-500" />
                              </div>
                              <div>
                                   <p className="text-xs text-surface-500 uppercase tracking-wider font-medium">Available Tests</p>
                                   <p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.available}</p>
                              </div>
                         </div>
                    </div>
                    <div className="card p-5 hover:scale-[1.02] transition-transform">
                         <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                   <HiCheckCircle className="w-6 h-6 text-emerald-500" />
                              </div>
                              <div>
                                   <p className="text-xs text-surface-500 uppercase tracking-wider font-medium">Tests Taken</p>
                                   <p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.attempted}</p>
                              </div>
                         </div>
                    </div>
                    <div className="card p-5 hover:scale-[1.02] transition-transform">
                         <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                   <HiChartBar className="w-6 h-6 text-amber-500" />
                              </div>
                              <div>
                                   <p className="text-xs text-surface-500 uppercase tracking-wider font-medium">Avg Score</p>
                                   <p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.avgScore}%</p>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Quick Actions */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Link to="/student/tests" className="card p-6 group hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                         <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                        <HiAcademicCap className="w-6 h-6 text-white" />
                                   </div>
                                   <div>
                                        <h3 className="font-semibold text-surface-900 dark:text-white">Take a Test</h3>
                                        <p className="text-sm text-surface-500 dark:text-surface-400">Browse and attempt available tests</p>
                                   </div>
                              </div>
                              <HiArrowRight className="w-5 h-5 text-surface-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                         </div>
                    </Link>
                    <Link to="/student/leaderboard" className="card p-6 group hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                         <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                        <HiTrophy className="w-6 h-6 text-white" />
                                   </div>
                                   <div>
                                        <h3 className="font-semibold text-surface-900 dark:text-white">Leaderboard</h3>
                                        <p className="text-sm text-surface-500 dark:text-surface-400">Check rankings and compare scores</p>
                                   </div>
                              </div>
                              <HiArrowRight className="w-5 h-5 text-surface-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                         </div>
                    </Link>
               </div>

               {/* Recent Results */}
               {recentAttempts.length > 0 && (
                    <div className="card p-6">
                         <div className="flex items-center justify-between mb-4">
                              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Recent Results</h2>
                              <Link to="/student/results" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">View all</Link>
                         </div>
                         <div className="space-y-3">
                              {recentAttempts.map(a => (
                                   <div key={a._id} className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                                        <div>
                                             <p className="font-medium text-surface-900 dark:text-white text-sm">{a.testTitle}</p>
                                             <p className="text-xs text-surface-500 mt-0.5 flex items-center gap-1">
                                                  <HiClock className="w-3 h-3" /> {new Date(a.submittedAt).toLocaleDateString()}
                                             </p>
                                        </div>
                                        <div className="text-right">
                                             <p className="font-bold text-surface-900 dark:text-white">{a.score}/{a.totalMarks}</p>
                                             <span className={`badge mt-1 ${a.percentage >= 75 ? 'badge-success' : a.percentage >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                                                  {a.percentage}%
                                             </span>
                                        </div>
                                   </div>
                              ))}
                         </div>
                    </div>
               )}
          </div>
     )
}
