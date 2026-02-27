import { useState, useEffect } from 'react'
import { attemptAPI, testAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'
import {
     HiMagnifyingGlass, HiArrowDownTray, HiEye,
     HiExclamationTriangle, HiFunnel,
} from 'react-icons/hi2'

export default function AdminResults() {
     const [attempts, setAttempts] = useState([])
     const [tests, setTests] = useState([])
     const [loading, setLoading] = useState(true)
     const [selectedTest, setSelectedTest] = useState('all')
     const [search, setSearch] = useState('')
     const [showDetailModal, setShowDetailModal] = useState(false)
     const [selectedAttempt, setSelectedAttempt] = useState(null)

     useEffect(() => {
          loadData()
     }, [])

     const loadData = async () => {
          try {
               const [attData, testData] = await Promise.all([
                    attemptAPI.getAll(),
                    testAPI.getAll(),
               ])
               setAttempts(attData)
               setTests(testData)
          } catch (err) { toast.error('Failed to load data') }
          finally { setLoading(false) }
     }

     const filtered = attempts.filter(a => {
          const matchesTest = selectedTest === 'all' || a.testId === selectedTest
          const matchesSearch = a.studentName?.toLowerCase().includes(search.toLowerCase())
          return matchesTest && matchesSearch
     })

     const exportCSV = () => {
          const headers = ['Student', 'Test', 'Score', 'Total', 'Percentage', 'Tab Switches', 'Started', 'Submitted']
          const rows = filtered.map(a => [
               a.studentName, a.testTitle, a.score, a.totalMarks,
               `${a.percentage}%`, a.tabSwitchCount,
               new Date(a.startedAt).toLocaleString(), new Date(a.submittedAt).toLocaleString(),
          ])
          const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
          const blob = new Blob([csv], { type: 'text/csv' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `results_${new Date().toISOString().slice(0, 10)}.csv`
          a.click()
          URL.revokeObjectURL(url)
          toast.success('CSV exported!')
     }

     if (loading) return <LoadingSpinner size="lg" className="mt-20" />

     return (
          <div className="space-y-6 animate-fade-in">
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                         <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Student Results</h1>
                         <p className="text-surface-500 dark:text-surface-400 mt-1">{filtered.length} results found</p>
                    </div>
                    <button onClick={exportCSV} className="btn-secondary gap-2">
                         <HiArrowDownTray className="w-4 h-4" /> Export CSV
                    </button>
               </div>

               {/* Filters */}
               <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 max-w-md">
                         <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                         <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student name..."
                              className="input pl-10" />
                    </div>
                    <div className="relative">
                         <HiFunnel className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                         <select value={selectedTest} onChange={e => setSelectedTest(e.target.value)}
                              className="input pl-10 pr-8 min-w-[200px]">
                              <option value="all">All Tests</option>
                              {tests.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
                         </select>
                    </div>
               </div>

               {/* Results Table */}
               <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                         <table className="w-full text-sm">
                              <thead>
                                   <tr className="bg-surface-50 dark:bg-surface-800/50 border-b border-surface-200 dark:border-surface-700">
                                        <th className="text-left px-5 py-3.5 font-medium text-surface-600 dark:text-surface-400">Student</th>
                                        <th className="text-left px-5 py-3.5 font-medium text-surface-600 dark:text-surface-400">Test</th>
                                        <th className="text-center px-5 py-3.5 font-medium text-surface-600 dark:text-surface-400">Score</th>
                                        <th className="text-center px-5 py-3.5 font-medium text-surface-600 dark:text-surface-400">%</th>
                                        <th className="text-center px-5 py-3.5 font-medium text-surface-600 dark:text-surface-400">Tab Switches</th>
                                        <th className="text-center px-5 py-3.5 font-medium text-surface-600 dark:text-surface-400">Submitted</th>
                                        <th className="text-center px-5 py-3.5 font-medium text-surface-600 dark:text-surface-400">Actions</th>
                                   </tr>
                              </thead>
                              <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
                                   {filtered.map(a => (
                                        <tr key={a._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                                             <td className="px-5 py-3.5 font-medium text-surface-900 dark:text-white">{a.studentName}</td>
                                             <td className="px-5 py-3.5 text-surface-600 dark:text-surface-400 max-w-[200px] truncate">{a.testTitle}</td>
                                             <td className="px-5 py-3.5 text-center font-medium">{a.score}/{a.totalMarks}</td>
                                             <td className="px-5 py-3.5 text-center">
                                                  <span className={`badge ${a.percentage >= 75 ? 'badge-success' : a.percentage >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                                                       {a.percentage}%
                                                  </span>
                                             </td>
                                             <td className="px-5 py-3.5 text-center">
                                                  <span className={`badge ${a.tabSwitchCount === 0 ? 'badge-success' : a.tabSwitchCount <= 2 ? 'badge-warning' : 'badge-danger'}`}>
                                                       {a.tabSwitchCount}
                                                       {a.tabSwitchCount > 2 && (
                                                            <HiExclamationTriangle className="w-3 h-3 ml-1" />
                                                       )}
                                                  </span>
                                             </td>
                                             <td className="px-5 py-3.5 text-center text-surface-500 dark:text-surface-400 text-xs">
                                                  {new Date(a.submittedAt).toLocaleDateString()}
                                             </td>
                                             <td className="px-5 py-3.5 text-center">
                                                  <button onClick={() => { setSelectedAttempt(a); setShowDetailModal(true) }}
                                                       className="p-1.5 rounded-lg text-surface-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all">
                                                       <HiEye className="w-4.5 h-4.5" />
                                                  </button>
                                             </td>
                                        </tr>
                                   ))}
                              </tbody>
                         </table>
                    </div>
                    {filtered.length === 0 && (
                         <div className="text-center py-16 text-surface-400">No results found</div>
                    )}
               </div>

               {/* Detail Modal */}
               <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)}
                    title={`Result Details — ${selectedAttempt?.studentName}`} size="lg">
                    {selectedAttempt && (
                         <div className="space-y-4">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                   <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 text-center">
                                        <p className="text-xs text-surface-500">Score</p>
                                        <p className="text-lg font-bold text-surface-900 dark:text-white">{selectedAttempt.score}/{selectedAttempt.totalMarks}</p>
                                   </div>
                                   <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 text-center">
                                        <p className="text-xs text-surface-500">Percentage</p>
                                        <p className="text-lg font-bold text-surface-900 dark:text-white">{selectedAttempt.percentage}%</p>
                                   </div>
                                   <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 text-center">
                                        <p className="text-xs text-surface-500">Tab Switches</p>
                                        <p className={`text-lg font-bold ${selectedAttempt.tabSwitchCount > 2 ? 'text-red-500' : 'text-surface-900 dark:text-white'}`}>
                                             {selectedAttempt.tabSwitchCount}
                                        </p>
                                   </div>
                                   <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 text-center">
                                        <p className="text-xs text-surface-500">Duration</p>
                                        <p className="text-lg font-bold text-surface-900 dark:text-white">
                                             {Math.round((new Date(selectedAttempt.submittedAt) - new Date(selectedAttempt.startedAt)) / 60000)} min
                                        </p>
                                   </div>
                              </div>

                              {selectedAttempt.suspiciousLogs.length > 0 && (
                                   <div>
                                        <h4 className="font-medium text-surface-900 dark:text-white mb-2 flex items-center gap-2">
                                             <HiExclamationTriangle className="w-4 h-4 text-amber-500" /> Suspicious Activity
                                        </h4>
                                        <div className="space-y-1.5">
                                             {selectedAttempt.suspiciousLogs.map((log, i) => (
                                                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 text-xs">
                                                       <span className="badge-warning">{log.type.replace('_', ' ')}</span>
                                                       <span className="text-surface-500">{new Date(log.timestamp).toLocaleString()}</span>
                                                  </div>
                                             ))}
                                        </div>
                                   </div>
                              )}

                              <div className="text-xs text-surface-500 space-y-1">
                                   <p>Started: {new Date(selectedAttempt.startedAt).toLocaleString()}</p>
                                   <p>Submitted: {new Date(selectedAttempt.submittedAt).toLocaleString()}</p>
                              </div>
                         </div>
                    )}
               </Modal>
          </div>
     )
}
