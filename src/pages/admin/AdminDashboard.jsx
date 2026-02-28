import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { testAPI, attemptAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
     HiDocumentText, HiUsers, HiChartBar, HiClock,
     HiArrowTrendingUp, HiExclamationTriangle, HiShieldExclamation,
} from 'react-icons/hi2'

export default function AdminDashboard() {
     const [analytics, setAnalytics] = useState(null)
     const [tests, setTests] = useState([])
     const [attempts, setAttempts] = useState([])
     const [loading, setLoading] = useState(true)

     useEffect(() => {
          loadData()
     }, [])

     const loadData = async () => {
          try {
               const [analyticsData, testsData, attemptsData] = await Promise.all([
                    attemptAPI.getAnalytics(),
                    testAPI.getAll(),
                    attemptAPI.getAll(),
               ])
               setAnalytics(analyticsData)
               setTests(testsData)
               setAttempts(attemptsData)
          } catch (err) {
               console.error(err)
          } finally {
               setLoading(false)
          }
     }

     if (loading) return <LoadingSpinner size="lg" className="mt-20" />

     const cheaters = attempts.filter(a => a.terminatedByViolation)
     const cheatersByTest = {}
     cheaters.forEach(a => {
          if (!cheatersByTest[a.testId]) {
               cheatersByTest[a.testId] = { testTitle: a.testTitle, students: [] }
          }
          cheatersByTest[a.testId].students.push(a)
     })

     const stats = [
          { label: 'Total Tests', value: analytics?.totalTests || 0, icon: HiDocumentText, color: 'from-primary-500 to-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20', iconColor: '#6366f1' },
          { label: 'Total Students', value: analytics?.totalStudents || 0, icon: HiUsers, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: '#10b981' },
          { label: 'Total Attempts', value: analytics?.totalAttempts || 0, icon: HiChartBar, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', iconColor: '#f59e0b' },
          { label: 'Avg Score', value: `${analytics?.avgScore || 0}%`, icon: HiArrowTrendingUp, color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20', iconColor: '#06b6d4' },
     ]

     return (
          <div className="space-y-8 animate-fade-in">
               <div>
                    <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Admin Dashboard</h1>
                    <p className="text-surface-500 dark:text-surface-400 mt-1">Overview of your examination platform</p>
               </div>

               {/* Stats Grid */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                         <div key={i} className="card p-5 hover:scale-[1.02] transition-transform duration-200">
                              <div className="flex items-center justify-between">
                                   <div>
                                        <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">{stat.label}</p>
                                        <p className="text-2xl font-bold text-surface-900 dark:text-white mt-2">{stat.value}</p>
                                   </div>
                                   <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                        <stat.icon className="w-6 h-6" style={{ color: stat.iconColor }} />
                                   </div>
                              </div>
                         </div>
                    ))}
               </div>

               {/* Quick Actions + Recent Tests */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Quick Actions */}
                    <div className="card p-6">
                         <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Quick Actions</h2>
                         <div className="space-y-3">
                              <Link to="/admin/tests" className="flex items-center gap-3 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors group">
                                   <HiDocumentText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                   <div>
                                        <p className="font-medium text-primary-700 dark:text-primary-300">Manage Tests</p>
                                        <p className="text-xs text-primary-500 dark:text-primary-400/70">Create, edit, or delete tests</p>
                                   </div>
                              </Link>
                              <Link to="/admin/results" className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                                   <HiUsers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                   <div>
                                        <p className="font-medium text-emerald-700 dark:text-emerald-300">View Results</p>
                                        <p className="text-xs text-emerald-500 dark:text-emerald-400/70">Check student scores and activity</p>
                                   </div>
                              </Link>
                              <Link to="/admin/analytics" className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                                   <HiChartBar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                   <div>
                                        <p className="font-medium text-amber-700 dark:text-amber-300">Analytics</p>
                                        <p className="text-xs text-amber-500 dark:text-amber-400/70">Detailed performance insights</p>
                                   </div>
                              </Link>
                         </div>
                    </div>

                    {/* Recent Tests */}
                    <div className="card p-6">
                         <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Recent Tests</h2>
                         <div className="space-y-3">
                              {tests.slice(0, 4).map(test => (
                                   <div key={test._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-700">
                                        <div className="min-w-0 flex-1">
                                             <p className="font-medium text-surface-900 dark:text-white text-sm truncate">{test.title}</p>
                                             <div className="flex items-center gap-3 mt-1">
                                                  <span className="text-xs text-surface-500 flex items-center gap-1">
                                                       <HiClock className="w-3.5 h-3.5" /> {test.duration} min
                                                  </span>
                                                  <span className="text-xs text-surface-500">{test.questionsCount} questions</span>
                                             </div>
                                        </div>
                                        <span className={`badge ${test.isPublished ? 'badge-success' : 'badge-warning'}`}>
                                             {test.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                   </div>
                              ))}
                         </div>
                    </div>
               </div>

               {/* Malpractice / Cheater Overview */}
               <div className="card p-6 border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                                   <HiExclamationTriangle className="w-5 h-5 text-red-500" />
                              </div>
                              <div>
                                   <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Malpractice Report</h2>
                                   <p className="text-xs text-surface-500">{cheaters.length} violation{cheaters.length !== 1 ? 's' : ''} detected</p>
                              </div>
                         </div>
                         <Link to="/admin/results" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                              View All →
                         </Link>
                    </div>

                    {cheaters.length === 0 ? (
                         <div className="text-center py-8">
                              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-3">
                                   <span className="text-2xl">✅</span>
                              </div>
                              <p className="text-sm text-surface-500 font-medium">No malpractice detected</p>
                              <p className="text-xs text-surface-400 mt-1">All exams completed cleanly</p>
                         </div>
                    ) : (
                         <div className="space-y-4">
                              {Object.entries(cheatersByTest).map(([testId, data]) => (
                                   <div key={testId} className="rounded-xl bg-red-50/50 dark:bg-red-900/5 border border-red-100 dark:border-red-900/30 p-4">
                                        <h4 className="font-semibold text-surface-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                                             <HiDocumentText className="w-4 h-4 text-red-500" />
                                             {data.testTitle}
                                             <span className="badge-danger text-xs ml-auto">{data.students.length} cheater{data.students.length !== 1 ? 's' : ''}</span>
                                        </h4>
                                        <div className="space-y-2">
                                             {data.students.map(s => (
                                                  <div key={s._id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-surface-800/50 text-sm">
                                                       <div className="flex items-center gap-2">
                                                            <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-xs">🚫</span>
                                                            <span className="font-medium text-surface-900 dark:text-white">{s.studentName}</span>
                                                       </div>
                                                       <div className="flex items-center gap-3 text-xs">
                                                            <span className="text-red-500 font-medium">{s.violationReason?.replace(/_/g, ' ') || 'violation'}</span>
                                                            <span className="text-surface-400">{new Date(s.submittedAt).toLocaleDateString()}</span>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   </div>
                              ))}
                         </div>
                    )}
               </div>
          </div>
     )
}

