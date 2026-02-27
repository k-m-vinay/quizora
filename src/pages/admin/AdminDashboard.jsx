import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { testAPI, attemptAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
     HiDocumentText, HiUsers, HiChartBar, HiClock,
     HiArrowTrendingUp, HiExclamationTriangle,
} from 'react-icons/hi2'

export default function AdminDashboard() {
     const [analytics, setAnalytics] = useState(null)
     const [tests, setTests] = useState([])
     const [loading, setLoading] = useState(true)

     useEffect(() => {
          loadData()
     }, [])

     const loadData = async () => {
          try {
               const [analyticsData, testsData] = await Promise.all([
                    attemptAPI.getAnalytics(),
                    testAPI.getAll(),
               ])
               setAnalytics(analyticsData)
               setTests(testsData)
          } catch (err) {
               console.error(err)
          } finally {
               setLoading(false)
          }
     }

     if (loading) return <LoadingSpinner size="lg" className="mt-20" />

     const stats = [
          { label: 'Total Tests', value: analytics?.totalTests || 0, icon: HiDocumentText, color: 'from-primary-500 to-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
          { label: 'Total Students', value: analytics?.totalStudents || 0, icon: HiUsers, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Total Attempts', value: analytics?.totalAttempts || 0, icon: HiChartBar, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Avg Score', value: `${analytics?.avgScore || 0}%`, icon: HiArrowTrendingUp, color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
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
                                        <stat.icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ color: stat.color.includes('primary') ? '#6366f1' : stat.color.includes('emerald') ? '#10b981' : stat.color.includes('amber') ? '#f59e0b' : '#06b6d4' }} />
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
                                        <span className={`badge ${test.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                             {test.status}
                                        </span>
                                   </div>
                              ))}
                         </div>
                    </div>
               </div>

               {/* Suspicious Activity */}
               {analytics && analytics.avgTabSwitches > 0 && (
                    <div className="card p-6 border-amber-200 dark:border-amber-800">
                         <div className="flex items-center gap-3 mb-4">
                              <HiExclamationTriangle className="w-5 h-5 text-amber-500" />
                              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Activity Alert</h2>
                         </div>
                         <p className="text-sm text-surface-600 dark:text-surface-400">
                              Average tab switches per attempt: <span className="font-semibold text-amber-600 dark:text-amber-400">{analytics.avgTabSwitches}</span>.
                              Monitor student activity in the Results section for detailed logs.
                         </p>
                    </div>
               )}
          </div>
     )
}
