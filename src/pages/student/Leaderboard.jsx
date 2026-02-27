import { useState, useEffect } from 'react'
import { testAPI, attemptAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
     HiTrophy, HiChevronDown,
} from 'react-icons/hi2'

export default function Leaderboard() {
     const [tests, setTests] = useState([])
     const [selectedTest, setSelectedTest] = useState('')
     const [leaders, setLeaders] = useState([])
     const [loading, setLoading] = useState(true)
     const [loadingLeaders, setLoadingLeaders] = useState(false)

     useEffect(() => { loadTests() }, [])

     const loadTests = async () => {
          try {
               const data = await testAPI.getAll()
               setTests(data)
               if (data.length > 0) {
                    setSelectedTest(data[0]._id)
                    await loadLeaderboard(data[0]._id)
               }
          } catch (err) { console.error(err) }
          finally { setLoading(false) }
     }

     const loadLeaderboard = async (testId) => {
          setLoadingLeaders(true)
          try {
               const data = await attemptAPI.getLeaderboard(testId)
               setLeaders(data)
          } catch (err) { console.error(err) }
          finally { setLoadingLeaders(false) }
     }

     const handleTestChange = (testId) => {
          setSelectedTest(testId)
          loadLeaderboard(testId)
     }

     const medalColors = ['from-amber-400 to-yellow-500', 'from-slate-300 to-slate-400', 'from-amber-700 to-amber-800']
     const medalLabels = ['🥇', '🥈', '🥉']

     if (loading) return <LoadingSpinner size="lg" className="mt-20" />

     return (
          <div className="space-y-6 animate-fade-in">
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                         <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Leaderboard</h1>
                         <p className="text-surface-500 dark:text-surface-400 mt-1">Top performers for each test</p>
                    </div>
                    <div className="relative">
                         <select
                              value={selectedTest}
                              onChange={e => handleTestChange(e.target.value)}
                              className="input pr-10 min-w-[240px]"
                         >
                              {tests.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
                         </select>
                    </div>
               </div>

               {/* Top 3 podium */}
               {leaders.length >= 3 && (
                    <div className="flex items-end justify-center gap-4 py-6">
                         {/* 2nd place */}
                         <div className="text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-2 shadow-lg">
                                   2
                              </div>
                              <p className="font-medium text-surface-900 dark:text-white text-sm truncate max-w-[120px]">{leaders[1].studentName}</p>
                              <p className="text-xs text-surface-500">{leaders[1].score}/{leaders[1].totalMarks}</p>
                              <div className="h-20 w-24 bg-slate-200 dark:bg-slate-700 rounded-t-xl mt-2" />
                         </div>

                         {/* 1st place */}
                         <div className="text-center animate-slide-up">
                              <div className="text-3xl mb-1">👑</div>
                              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-2 shadow-xl ring-4 ring-amber-200 dark:ring-amber-800">
                                   1
                              </div>
                              <p className="font-semibold text-surface-900 dark:text-white text-base truncate max-w-[140px]">{leaders[0].studentName}</p>
                              <p className="text-sm text-surface-500 font-medium">{leaders[0].score}/{leaders[0].totalMarks}</p>
                              <div className="h-28 w-28 bg-amber-200 dark:bg-amber-800 rounded-t-xl mt-2" />
                         </div>

                         {/* 3rd place */}
                         <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-700 to-amber-800 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-2 shadow-lg">
                                   3
                              </div>
                              <p className="font-medium text-surface-900 dark:text-white text-sm truncate max-w-[120px]">{leaders[2].studentName}</p>
                              <p className="text-xs text-surface-500">{leaders[2].score}/{leaders[2].totalMarks}</p>
                              <div className="h-14 w-24 bg-amber-100 dark:bg-amber-900 rounded-t-xl mt-2" />
                         </div>
                    </div>
               )}

               {/* Full Rankings Table */}
               <div className="card overflow-hidden">
                    {loadingLeaders ? (
                         <LoadingSpinner size="md" className="py-16" />
                    ) : (
                         <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                   <thead>
                                        <tr className="bg-surface-50 dark:bg-surface-800/50 border-b border-surface-200 dark:border-surface-700">
                                             <th className="text-center px-5 py-3.5 font-medium text-surface-600 dark:text-surface-400 w-16">#</th>
                                             <th className="text-left px-5 py-3.5 font-medium text-surface-600 dark:text-surface-400">Student</th>
                                             <th className="text-center px-5 py-3.5 font-medium text-surface-600 dark:text-surface-400">Score</th>
                                             <th className="text-center px-5 py-3.5 font-medium text-surface-600 dark:text-surface-400">Percentage</th>
                                             <th className="text-center px-5 py-3.5 font-medium text-surface-600 dark:text-surface-400">Duration</th>
                                        </tr>
                                   </thead>
                                   <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
                                        {leaders.map((l, i) => (
                                             <tr key={l._id} className={`hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors ${i < 3 ? 'font-medium' : ''}`}>
                                                  <td className="px-5 py-3.5 text-center">
                                                       {i < 3 ? (
                                                            <span className="text-lg">{medalLabels[i]}</span>
                                                       ) : (
                                                            <span className="text-surface-500">{l.rank}</span>
                                                       )}
                                                  </td>
                                                  <td className="px-5 py-3.5">
                                                       <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs ${i === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500' :
                                                                      i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400' :
                                                                           i === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-800' :
                                                                                'bg-gradient-to-br from-primary-500 to-accent-500'
                                                                 }`}>
                                                                 {l.studentName?.charAt(0)}
                                                            </div>
                                                            <span className="text-surface-900 dark:text-white">{l.studentName}</span>
                                                       </div>
                                                  </td>
                                                  <td className="px-5 py-3.5 text-center font-medium text-surface-900 dark:text-white">{l.score}/{l.totalMarks}</td>
                                                  <td className="px-5 py-3.5 text-center">
                                                       <span className={`badge ${l.percentage >= 75 ? 'badge-success' : l.percentage >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                                                            {l.percentage}%
                                                       </span>
                                                  </td>
                                                  <td className="px-5 py-3.5 text-center text-surface-500">
                                                       {Math.round((new Date(l.submittedAt) - new Date(l.startedAt)) / 60000)} min
                                                  </td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                         </div>
                    )}
                    {!loadingLeaders && leaders.length === 0 && (
                         <div className="text-center py-16">
                              <HiTrophy className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                              <p className="text-surface-500 font-medium">No attempts yet for this test</p>
                         </div>
                    )}
               </div>
          </div>
     )
}
