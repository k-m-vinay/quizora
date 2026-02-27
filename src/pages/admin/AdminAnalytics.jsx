import { useState, useEffect } from 'react'
import { attemptAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
     HiChartBar, HiUsers, HiAcademicCap, HiArrowTrendingUp,
     HiArrowTrendingDown, HiDocumentText,
} from 'react-icons/hi2'

export default function AdminAnalytics() {
     const [analytics, setAnalytics] = useState(null)
     const [loading, setLoading] = useState(true)

     useEffect(() => {
          loadAnalytics()
     }, [])

     const loadAnalytics = async () => {
          try {
               const data = await attemptAPI.getAnalytics()
               setAnalytics(data)
          } catch (err) { console.error(err) }
          finally { setLoading(false) }
     }

     if (loading) return <LoadingSpinner size="lg" className="mt-20" />

     if (!analytics) return <div className="text-center py-20 text-surface-500">Failed to load analytics</div>

     return (
          <div className="space-y-8 animate-fade-in">
               <div>
                    <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Analytics Dashboard</h1>
                    <p className="text-surface-500 dark:text-surface-400 mt-1">Comprehensive performance insights</p>
               </div>

               {/* Overview Cards */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {[
                         { label: 'Total Tests', value: analytics.totalTests, icon: HiDocumentText, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20' },
                         { label: 'Students', value: analytics.totalStudents, icon: HiUsers, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                         { label: 'Attempts', value: analytics.totalAttempts, icon: HiAcademicCap, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                         { label: 'Avg Score', value: `${analytics.avgScore}%`, icon: HiChartBar, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
                         { label: 'Highest', value: `${analytics.highestScore}%`, icon: HiArrowTrendingUp, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
                    ].map((stat, i) => (
                         <div key={i} className="card p-5">
                              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                                   <stat.icon className={`w-5 h-5 ${stat.color}`} />
                              </div>
                              <p className="text-xs text-surface-500 dark:text-surface-400 font-medium uppercase tracking-wider">{stat.label}</p>
                              <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">{stat.value}</p>
                         </div>
                    ))}
               </div>

               {/* Per-test Analytics */}
               <div className="card p-6">
                    <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Test-wise Performance</h2>
                    <div className="space-y-4">
                         {analytics.testAnalytics.map(test => {
                              const barWidth = Math.max(5, test.avgScore)
                              return (
                                   <div key={test.testId} className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-700">
                                        <div className="flex items-center justify-between mb-3">
                                             <h3 className="font-medium text-surface-900 dark:text-white text-sm">{test.testTitle}</h3>
                                             <span className="badge-primary">{test.attemptCount} attempts</span>
                                        </div>

                                        {/* Score Bar */}
                                        <div className="space-y-2">
                                             <div className="flex justify-between text-xs text-surface-500">
                                                  <span>Average Score</span>
                                                  <span className="font-medium">{test.avgScore}%</span>
                                             </div>
                                             <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                                                  <div
                                                       className={`h-full rounded-full transition-all duration-1000 ${test.avgScore >= 75 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                                                                 test.avgScore >= 50 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                                                                      'bg-gradient-to-r from-red-500 to-red-400'
                                                            }`}
                                                       style={{ width: `${barWidth}%` }}
                                                  />
                                             </div>
                                        </div>

                                        <div className="flex items-center gap-4 mt-3 text-xs text-surface-500">
                                             <span className="flex items-center gap-1">
                                                  <HiArrowTrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                                  Highest: {test.highestScore}%
                                             </span>
                                             <span className="flex items-center gap-1">
                                                  <HiArrowTrendingDown className="w-3.5 h-3.5 text-red-500" />
                                                  Lowest: {test.lowestScore}%
                                             </span>
                                        </div>
                                   </div>
                              )
                         })}
                    </div>
               </div>

               {/* Activity Monitor */}
               <div className="card p-6">
                    <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Anti-Cheat Summary</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                         <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 text-center">
                              <p className="text-3xl font-bold text-surface-900 dark:text-white">{analytics.avgTabSwitches}</p>
                              <p className="text-xs text-surface-500 mt-1">Avg Tab Switches</p>
                         </div>
                         <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 text-center">
                              <p className="text-3xl font-bold text-emerald-500">{analytics.totalAttempts > 0 ? Math.round((1 - analytics.avgTabSwitches / 3) * 100) : 100}%</p>
                              <p className="text-xs text-surface-500 mt-1">Clean Attempts</p>
                         </div>
                         <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 text-center">
                              <p className="text-3xl font-bold text-primary-500">{analytics.highestScore}%</p>
                              <p className="text-xs text-surface-500 mt-1">Platform Best Score</p>
                         </div>
                    </div>
               </div>
          </div>
     )
}
