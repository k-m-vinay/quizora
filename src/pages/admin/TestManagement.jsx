import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { testAPI, questionAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal, { ConfirmModal } from '../../components/common/Modal'
import toast from 'react-hot-toast'
import {
     HiPlus, HiPencilSquare, HiTrash, HiClock, HiQueueList,
     HiAcademicCap, HiArrowPath, HiMagnifyingGlass,
     HiGlobeAlt, HiEyeSlash,
} from 'react-icons/hi2'

export default function TestManagement() {
     const { user } = useSelector(state => state.auth)
     const [tests, setTests] = useState([])
     const [loading, setLoading] = useState(true)
     const [showModal, setShowModal] = useState(false)
     const [modalStep, setModalStep] = useState(1) // 1 = test details, 2 = add questions
     const [showDeleteModal, setShowDeleteModal] = useState(false)
     const [showQuestionModal, setShowQuestionModal] = useState(false)
     const [editingTest, setEditingTest] = useState(null)
     const [deletingTestId, setDeletingTestId] = useState(null)
     const [selectedTest, setSelectedTest] = useState(null)
     const [questions, setQuestions] = useState([])
     const [search, setSearch] = useState('')
     const [testForm, setTestForm] = useState({
          title: '', description: '', duration: 60, totalMarks: 100,
          negativeMarking: 0, shuffleQuestions: false, shuffleOptions: false,
          startDate: '', endDate: '',
     })
     const [questionForm, setQuestionForm] = useState({
          questionText: '', options: ['', '', '', ''], correctAnswer: 0, marks: 10,
     })
     const [editingQuestion, setEditingQuestion] = useState(null)

     useEffect(() => { loadTests() }, [])

     const loadTests = async () => {
          try {
               const data = await testAPI.getAll()
               setTests(data)
          } catch (err) { toast.error('Failed to load tests') }
          finally { setLoading(false) }
     }

     const handleSaveTest = async () => {
          if (!testForm.title.trim()) { toast.error('Title is required'); return }
          try {
               if (editingTest) {
                    const updated = await testAPI.update(editingTest._id, testForm)
                    setTests(tests.map(t => t._id === updated._id ? updated : t))
                    setSelectedTest(updated)
                    toast.success('Test updated!')
                    // Switch to questions step
                    setModalStep(2)
                    const qs = await questionAPI.getByTestId(updated._id)
                    setQuestions(qs)
               } else {
                    const newTest = await testAPI.create({ ...testForm, createdBy: user._id })
                    setTests([...tests, newTest])
                    setSelectedTest(newTest)
                    toast.success('Test created! Now add questions.')
                    // Switch to questions step
                    setModalStep(2)
                    setQuestions([])
               }
          } catch (err) { toast.error(err.message) }
     }

     const handleDeleteTest = async () => {
          try {
               await testAPI.delete(deletingTestId)
               setTests(tests.filter(t => t._id !== deletingTestId))
               toast.success('Test deleted!')
               setShowDeleteModal(false)
          } catch (err) { toast.error(err.message) }
     }

     const handleTogglePublish = async (testId) => {
          try {
               const updated = await testAPI.togglePublish(testId)
               setTests(tests.map(t => t._id === updated._id ? updated : t))
               toast.success(updated.isPublished ? 'Test published! Students can now see it.' : 'Test unpublished.')
          } catch (err) { toast.error(err.message) }
     }

     const openEditTest = (test) => {
          setEditingTest(test)
          setTestForm({
               title: test.title, description: test.description, duration: test.duration,
               totalMarks: test.totalMarks, negativeMarking: test.negativeMarking,
               shuffleQuestions: test.shuffleQuestions, shuffleOptions: test.shuffleOptions,
               startDate: test.startDate?.slice(0, 16) || '', endDate: test.endDate?.slice(0, 16) || '',
          })
          setModalStep(1)
          setShowModal(true)
     }

     const resetTestForm = () => {
          setEditingTest(null)
          setModalStep(1)
          setTestForm({ title: '', description: '', duration: 60, totalMarks: 100, negativeMarking: 0, shuffleQuestions: false, shuffleOptions: false, startDate: '', endDate: '' })
     }

     // Questions
     const openQuestions = async (test) => {
          setSelectedTest(test)
          try {
               const qs = await questionAPI.getByTestId(test._id)
               setQuestions(qs)
               setShowQuestionModal(true)
          } catch (err) { toast.error('Failed to load questions') }
     }

     const handleSaveQuestion = async () => {
          if (!questionForm.questionText.trim()) { toast.error('Question text is required'); return }
          if (questionForm.options.some(o => !o.trim())) { toast.error('All options are required'); return }
          try {
               if (editingQuestion) {
                    const updated = await questionAPI.update(editingQuestion._id, { ...questionForm, testId: selectedTest._id })
                    setQuestions(questions.map(q => q._id === updated._id ? updated : q))
                    toast.success('Question updated!')
               } else {
                    const newQ = await questionAPI.create({ ...questionForm, testId: selectedTest._id })
                    setQuestions([...questions, newQ])
                    toast.success('Question added!')
               }
               resetQuestionForm()
          } catch (err) { toast.error(err.message) }
     }

     const handleDeleteQuestion = async (qId) => {
          try {
               await questionAPI.delete(selectedTest._id, qId)
               setQuestions(questions.filter(q => q._id !== qId))
               toast.success('Question deleted!')
          } catch (err) { toast.error(err.message) }
     }

     const resetQuestionForm = () => {
          setEditingQuestion(null)
          setQuestionForm({ questionText: '', options: ['', '', '', ''], correctAnswer: 0, marks: 10 })
     }

     const filteredTests = tests.filter(t =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase())
     )

     if (loading) return <LoadingSpinner size="lg" className="mt-20" />

     return (
          <div className="space-y-6 animate-fade-in">
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                         <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Test Management</h1>
                         <p className="text-surface-500 dark:text-surface-400 mt-1">Create and manage your examination tests</p>
                    </div>
                    <button onClick={() => { resetTestForm(); setModalStep(1); setShowModal(true) }} className="btn-primary gap-2">
                         <HiPlus className="w-4 h-4" /> Create Test
                    </button>
               </div>

               {/* Search */}
               <div className="relative max-w-md">
                    <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tests..."
                         className="input pl-10" />
               </div>

               {/* Tests Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredTests.map(test => (
                         <div key={test._id} className="card p-5 group">
                              <div className="flex items-start justify-between mb-3">
                                   <h3 className="font-semibold text-surface-900 dark:text-white pr-2 line-clamp-2">{test.title}</h3>
                                   <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <span className={`badge ${test.isPublished ? 'badge-success' : 'badge-warning'}`}>
                                             {test.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                   </div>
                              </div>
                              <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2 mb-4">{test.description}</p>

                              <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-surface-600 dark:text-surface-400">
                                   <div className="flex items-center gap-1.5"><HiClock className="w-3.5 h-3.5" /> {test.duration} min</div>
                                   <div className="flex items-center gap-1.5"><HiAcademicCap className="w-3.5 h-3.5" /> {test.totalMarks} marks</div>
                                   <div className="flex items-center gap-1.5"><HiQueueList className="w-3.5 h-3.5" /> {test.questionsCount} Qs</div>
                                   {test.negativeMarking > 0 && (
                                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                                             <span>-{test.negativeMarking}x</span> negative
                                        </div>
                                   )}
                              </div>

                              <div className="flex items-center gap-1.5 text-xs text-surface-400 mb-4">
                                   {test.shuffleQuestions && <span className="badge-primary text-[10px] px-2 py-0.5">Shuffle Qs</span>}
                                   {test.shuffleOptions && <span className="badge-primary text-[10px] px-2 py-0.5">Shuffle Opts</span>}
                              </div>

                              <div className="flex items-center gap-2 pt-3 border-t border-surface-100 dark:border-surface-700 flex-wrap">
                                   <button onClick={() => handleTogglePublish(test._id)}
                                        className={`btn text-xs py-1.5 px-3 gap-1 border ${test.isPublished
                                             ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                                             : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                                             }`}>
                                        {test.isPublished ? <><HiEyeSlash className="w-3.5 h-3.5" /> Unpublish</> : <><HiGlobeAlt className="w-3.5 h-3.5" /> Publish</>}
                                   </button>
                                   <button onClick={() => openQuestions(test)} className="btn-secondary text-xs py-1.5 flex-1 gap-1">
                                        <HiQueueList className="w-3.5 h-3.5" /> Questions
                                   </button>
                                   <button onClick={() => openEditTest(test)} className="btn-secondary text-xs py-1.5 px-3">
                                        <HiPencilSquare className="w-3.5 h-3.5" />
                                   </button>
                                   <button onClick={() => { setDeletingTestId(test._id); setShowDeleteModal(true) }}
                                        className="btn text-xs py-1.5 px-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800">
                                        <HiTrash className="w-3.5 h-3.5" />
                                   </button>
                              </div>
                         </div>
                    ))}
               </div>

               {filteredTests.length === 0 && (
                    <div className="text-center py-16">
                         <HiDocumentText className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                         <p className="text-surface-500 dark:text-surface-400 font-medium">No tests found</p>
                         <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">Create your first test to get started</p>
                    </div>
               )}

               {/* Create/Edit Test Modal */}
               <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetTestForm() }}
                    title={modalStep === 1 ? (editingTest ? 'Edit Test' : 'Create New Test') : `Add Questions — ${selectedTest?.title || testForm.title}`} size="xl">
                    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">

                         {/* Step indicator */}
                         <div className="flex items-center gap-3 mb-2">
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${modalStep === 1 ? 'bg-primary-500 text-white' : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'}`}>
                                   {modalStep > 1 ? '✓' : '1'} Test Details
                              </div>
                              <div className="w-8 h-px bg-surface-300 dark:bg-surface-600" />
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${modalStep === 2 ? 'bg-primary-500 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-400'}`}>
                                   2 Questions
                              </div>
                         </div>

                         {modalStep === 1 && (<>
                              <div>
                                   <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Title *</label>
                                   <input value={testForm.title} onChange={e => setTestForm({ ...testForm, title: e.target.value })} className="input" placeholder="e.g. Data Structures & Algorithms" />
                              </div>
                              <div>
                                   <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Description</label>
                                   <textarea value={testForm.description} onChange={e => setTestForm({ ...testForm, description: e.target.value })} className="input min-h-[80px] resize-none" placeholder="Describe the test..." rows={3} />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                   <div>
                                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Duration (min)</label>
                                        <input type="number" min="1" value={testForm.duration} onChange={e => setTestForm({ ...testForm, duration: +e.target.value })} className="input" />
                                   </div>
                                   <div>
                                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Total Marks</label>
                                        <input type="number" min="1" value={testForm.totalMarks} onChange={e => setTestForm({ ...testForm, totalMarks: +e.target.value })} className="input" />
                                   </div>
                              </div>
                              <div>
                                   <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Negative Marking (multiplier, 0 = off)</label>
                                   <input type="number" step="0.01" min="0" max="1" value={testForm.negativeMarking} onChange={e => setTestForm({ ...testForm, negativeMarking: +e.target.value })} className="input" />
                              </div>
                              {/* Date Pickers with inline calendars */}
                              {(() => {
                                   // Mini calendar component
                                   const MiniCalendar = ({ label, value, onChange }) => {
                                        const parseVal = (v) => {
                                             if (!v) return { date: null, time: '09:00' }
                                             const d = new Date(v)
                                             if (isNaN(d)) return { date: null, time: '09:00' }
                                             return { date: d, time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }
                                        }
                                        const { date: selectedDate, time: selectedTime } = parseVal(value)
                                        const today = new Date()
                                        const [viewMonth, setViewMonth] = useState(selectedDate ? selectedDate.getMonth() : today.getMonth())
                                        const [viewYear, setViewYear] = useState(selectedDate ? selectedDate.getFullYear() : today.getFullYear())

                                        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
                                        const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()
                                        const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
                                        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

                                        const handleDayClick = (day) => {
                                             const t = selectedTime || '09:00'
                                             const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${t}`
                                             onChange(iso)
                                        }
                                        const handleTimeChange = (t) => {
                                             if (selectedDate) {
                                                  const iso = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}T${t}`
                                                  onChange(iso)
                                             }
                                        }
                                        const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) } else setViewMonth(viewMonth - 1) }
                                        const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) } else setViewMonth(viewMonth + 1) }

                                        const isSameDay = (d, day) => d && d.getDate() === day && d.getMonth() === viewMonth && d.getFullYear() === viewYear
                                        const isToday = (day) => today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear

                                        return (
                                             <div>
                                                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">{label}</label>
                                                  <div className="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 p-3 overflow-hidden">
                                                       {/* Month nav */}
                                                       <div className="flex items-center justify-between mb-2">
                                                            <button type="button" onClick={prevMonth} className="p-1 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-500 transition-colors">
                                                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                                            </button>
                                                            <span className="text-xs font-semibold text-surface-800 dark:text-surface-200">{monthNames[viewMonth]} {viewYear}</span>
                                                            <button type="button" onClick={nextMonth} className="p-1 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-500 transition-colors">
                                                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                            </button>
                                                       </div>

                                                       {/* Day headers */}
                                                       <div className="grid grid-cols-7 gap-0.5 mb-1">
                                                            {dayNames.map(d => (
                                                                 <div key={d} className="text-center text-[10px] font-semibold text-surface-400 dark:text-surface-500 py-0.5">{d}</div>
                                                            ))}
                                                       </div>

                                                       {/* Day grid */}
                                                       <div className="grid grid-cols-7 gap-0.5">
                                                            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                                                                 <div key={`e-${i}`} />
                                                            ))}
                                                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                                                 const day = i + 1
                                                                 const selected = isSameDay(selectedDate, day)
                                                                 const todayMark = isToday(day)
                                                                 return (
                                                                      <button
                                                                           key={day} type="button"
                                                                           onClick={() => handleDayClick(day)}
                                                                           className={`text-[11px] py-1 rounded-md transition-all font-medium
                                                                           ${selected
                                                                                     ? 'bg-primary-500 text-white shadow-sm'
                                                                                     : todayMark
                                                                                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                                                                          : 'text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'
                                                                                }`}
                                                                      >
                                                                           {day}
                                                                      </button>
                                                                 )
                                                            })}
                                                       </div>

                                                       {/* Time selector */}
                                                       {(() => {
                                                            const hrs24 = parseInt(selectedTime.split(':')[0]) || 9
                                                            const mins = parseInt(selectedTime.split(':')[1]) || 0
                                                            const isPM = hrs24 >= 12
                                                            const hrs12 = hrs24 === 0 ? 12 : hrs24 > 12 ? hrs24 - 12 : hrs24

                                                            const setTime = (h12, m, pm) => {
                                                                 let h24 = pm ? (h12 === 12 ? 12 : h12 + 12) : (h12 === 12 ? 0 : h12)
                                                                 handleTimeChange(`${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
                                                            }

                                                            return (
                                                                 <div className="mt-2 pt-2 border-t border-surface-200 dark:border-surface-700">
                                                                      <p className="text-[10px] font-semibold text-surface-400 dark:text-surface-500 mb-1.5 uppercase tracking-wider">Time</p>
                                                                      <div className="flex items-center gap-1">
                                                                           <select value={hrs12}
                                                                                onChange={e => setTime(+e.target.value, mins, isPM)}
                                                                                className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-xs font-medium text-surface-800 dark:text-surface-200 py-1.5 px-1.5 flex-1 text-center appearance-none cursor-pointer focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                                                           >
                                                                                {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(h => (
                                                                                     <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                                                                                ))}
                                                                           </select>
                                                                           <span className="text-surface-400 font-bold text-sm">:</span>
                                                                           <select value={mins}
                                                                                onChange={e => setTime(hrs12, +e.target.value, isPM)}
                                                                                className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-xs font-medium text-surface-800 dark:text-surface-200 py-1.5 px-1.5 flex-1 text-center appearance-none cursor-pointer focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                                                           >
                                                                                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                                                                                     <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                                                                                ))}
                                                                           </select>
                                                                           <div className="flex rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden">
                                                                                <button type="button" onClick={() => setTime(hrs12, mins, false)}
                                                                                     className={`text-[10px] font-bold px-2 py-1.5 transition-colors ${!isPM
                                                                                          ? 'bg-primary-500 text-white'
                                                                                          : 'bg-white dark:bg-surface-800 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700'
                                                                                          }`}>AM</button>
                                                                                <button type="button" onClick={() => setTime(hrs12, mins, true)}
                                                                                     className={`text-[10px] font-bold px-2 py-1.5 transition-colors ${isPM
                                                                                          ? 'bg-primary-500 text-white'
                                                                                          : 'bg-white dark:bg-surface-800 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700'
                                                                                          }`}>PM</button>
                                                                           </div>
                                                                      </div>
                                                                 </div>
                                                            )
                                                       })()}

                                                       {selectedDate && (
                                                            <p className="text-[10px] text-primary-500 mt-2 font-medium text-center truncate">
                                                                 {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                                 {' · '}
                                                                 {(() => {
                                                                      const h = parseInt(selectedTime.split(':')[0])
                                                                      const m = selectedTime.split(':')[1]
                                                                      const pm = h >= 12
                                                                      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
                                                                      return `${h12}:${m} ${pm ? 'PM' : 'AM'}`
                                                                 })()}
                                                            </p>
                                                       )}
                                                  </div>
                                             </div>
                                        )
                                   }
                                   return (
                                        <div className="grid grid-cols-2 gap-4">
                                             <MiniCalendar label="Start Date" value={testForm.startDate}
                                                  onChange={v => setTestForm({ ...testForm, startDate: v })} />
                                             <MiniCalendar label="End Date" value={testForm.endDate}
                                                  onChange={v => setTestForm({ ...testForm, endDate: v })} />
                                        </div>
                                   )
                              })()}
                              <div className="flex gap-6">
                                   <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={testForm.shuffleQuestions} onChange={e => setTestForm({ ...testForm, shuffleQuestions: e.target.checked })}
                                             className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
                                        <span className="text-sm text-surface-700 dark:text-surface-300">Shuffle Questions</span>
                                   </label>
                                   <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={testForm.shuffleOptions} onChange={e => setTestForm({ ...testForm, shuffleOptions: e.target.checked })}
                                             className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
                                        <span className="text-sm text-surface-700 dark:text-surface-300">Shuffle Options</span>
                                   </label>
                              </div>
                              <div className="flex justify-end gap-3 pt-2 border-t border-surface-200 dark:border-surface-700">
                                   <button onClick={() => { setShowModal(false); resetTestForm() }} className="btn-secondary">Cancel</button>
                                   <button onClick={handleSaveTest} className="btn-primary gap-1">
                                        {editingTest ? 'Save & Add Questions' : 'Save & Add Questions →'}
                                   </button>
                              </div>
                         </>)}

                         {/* Step 2: Questions */}
                         {modalStep === 2 && (<>
                              {/* Add/Edit Question Form */}
                              <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 space-y-4">
                                   <h4 className="font-medium text-surface-900 dark:text-white">
                                        {editingQuestion ? 'Edit Question' : 'Add New Question'}
                                   </h4>
                                   <div>
                                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Question Text *</label>
                                        <textarea value={questionForm.questionText} onChange={e => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                                             className="input min-h-[60px] resize-none" rows={2} placeholder="Enter question..." />
                                   </div>
                                   <div className="grid grid-cols-2 gap-3">
                                        {questionForm.options.map((opt, i) => (
                                             <div key={i}>
                                                  <label className="block text-xs font-medium text-surface-500 mb-1">Option {String.fromCharCode(65 + i)}</label>
                                                  <input value={opt} onChange={e => {
                                                       const newOpts = [...questionForm.options]
                                                       newOpts[i] = e.target.value
                                                       setQuestionForm({ ...questionForm, options: newOpts })
                                                  }} className="input text-sm py-2" placeholder={`Option ${String.fromCharCode(65 + i)}`} />
                                             </div>
                                        ))}
                                   </div>
                                   <div className="grid grid-cols-2 gap-4">
                                        <div>
                                             <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Correct Answer</label>
                                             <select value={questionForm.correctAnswer} onChange={e => setQuestionForm({ ...questionForm, correctAnswer: +e.target.value })}
                                                  className="input">
                                                  {questionForm.options.map((_, i) => (
                                                       <option key={i} value={i}>Option {String.fromCharCode(65 + i)}</option>
                                                  ))}
                                             </select>
                                        </div>
                                        <div>
                                             <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Marks</label>
                                             <input type="number" min="1" value={questionForm.marks} onChange={e => setQuestionForm({ ...questionForm, marks: +e.target.value })} className="input" />
                                        </div>
                                   </div>
                                   <div className="flex gap-2">
                                        <button onClick={handleSaveQuestion} className="btn-primary text-sm">
                                             {editingQuestion ? 'Update Question' : 'Add Question'}
                                        </button>
                                        {editingQuestion && (
                                             <button onClick={resetQuestionForm} className="btn-secondary text-sm">Cancel Edit</button>
                                        )}
                                   </div>
                              </div>

                              {/* Question List */}
                              <div className="space-y-3">
                                   <h4 className="font-medium text-surface-900 dark:text-white">
                                        Questions ({questions.length})
                                   </h4>
                                   {questions.map((q, i) => (
                                        <div key={q._id} className="p-4 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                                             <div className="flex items-start justify-between mb-2">
                                                  <p className="text-sm font-medium text-surface-900 dark:text-white">
                                                       <span className="text-primary-600 dark:text-primary-400 mr-2">Q{i + 1}.</span>
                                                       {q.questionText}
                                                  </p>
                                                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                                       <span className="badge-primary text-[10px]">{q.marks} marks</span>
                                                       <button onClick={() => {
                                                            setEditingQuestion(q)
                                                            setQuestionForm({ questionText: q.questionText, options: q.options, correctAnswer: q.correctAnswer, marks: q.marks })
                                                       }} className="p-1 text-surface-400 hover:text-primary-500 transition-colors">
                                                            <HiPencilSquare className="w-4 h-4" />
                                                       </button>
                                                       <button onClick={() => handleDeleteQuestion(q._id)}
                                                            className="p-1 text-surface-400 hover:text-red-500 transition-colors">
                                                            <HiTrash className="w-4 h-4" />
                                                       </button>
                                                  </div>
                                             </div>
                                             <div className="grid grid-cols-2 gap-1.5 text-xs">
                                                  {q.options.map((opt, oi) => (
                                                       <span key={oi} className={`px-2.5 py-1.5 rounded-lg ${oi === q.correctAnswer
                                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800'
                                                            : 'bg-surface-50 dark:bg-surface-700/50 text-surface-600 dark:text-surface-400'
                                                            }`}>
                                                            {String.fromCharCode(65 + oi)}. {opt}
                                                       </span>
                                                  ))}
                                             </div>
                                        </div>
                                   ))}
                                   {questions.length === 0 && (
                                        <p className="text-center py-8 text-surface-400 text-sm">No questions yet. Add your first question above.</p>
                                   )}
                              </div>

                              <div className="flex justify-between gap-3 pt-2 border-t border-surface-200 dark:border-surface-700">
                                   <button onClick={() => setModalStep(1)} className="btn-secondary gap-1 text-sm">
                                        ← Back to Test Details
                                   </button>
                                   <button onClick={() => { setShowModal(false); resetTestForm(); resetQuestionForm() }} className="btn-primary">
                                        Done ({questions.length} question{questions.length !== 1 ? 's' : ''} added)
                                   </button>
                              </div>
                         </>)}
                    </div>
               </Modal>

               {/* Question Modal */}
               <Modal isOpen={showQuestionModal} onClose={() => { setShowQuestionModal(false); resetQuestionForm() }}
                    title={`Questions — ${selectedTest?.title}`} size="xl">
                    <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
                         {/* Add/Edit Question Form */}
                         <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 space-y-4">
                              <h4 className="font-medium text-surface-900 dark:text-white">
                                   {editingQuestion ? 'Edit Question' : 'Add New Question'}
                              </h4>
                              <div>
                                   <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Question Text *</label>
                                   <textarea value={questionForm.questionText} onChange={e => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                                        className="input min-h-[60px] resize-none" rows={2} placeholder="Enter question..." />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                   {questionForm.options.map((opt, i) => (
                                        <div key={i}>
                                             <label className="block text-xs font-medium text-surface-500 mb-1">Option {String.fromCharCode(65 + i)}</label>
                                             <input value={opt} onChange={e => {
                                                  const newOpts = [...questionForm.options]
                                                  newOpts[i] = e.target.value
                                                  setQuestionForm({ ...questionForm, options: newOpts })
                                             }} className="input text-sm py-2" placeholder={`Option ${String.fromCharCode(65 + i)}`} />
                                        </div>
                                   ))}
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                   <div>
                                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Correct Answer</label>
                                        <select value={questionForm.correctAnswer} onChange={e => setQuestionForm({ ...questionForm, correctAnswer: +e.target.value })}
                                             className="input">
                                             {questionForm.options.map((_, i) => (
                                                  <option key={i} value={i}>Option {String.fromCharCode(65 + i)}</option>
                                             ))}
                                        </select>
                                   </div>
                                   <div>
                                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Marks</label>
                                        <input type="number" min="1" value={questionForm.marks} onChange={e => setQuestionForm({ ...questionForm, marks: +e.target.value })} className="input" />
                                   </div>
                              </div>
                              <div className="flex gap-2">
                                   <button onClick={handleSaveQuestion} className="btn-primary text-sm">
                                        {editingQuestion ? 'Update Question' : 'Add Question'}
                                   </button>
                                   {editingQuestion && (
                                        <button onClick={resetQuestionForm} className="btn-secondary text-sm">Cancel Edit</button>
                                   )}
                              </div>
                         </div>

                         {/* Question List */}
                         <div className="space-y-3">
                              <h4 className="font-medium text-surface-900 dark:text-white">
                                   Questions ({questions.length})
                              </h4>
                              {questions.map((q, i) => (
                                   <div key={q._id} className="p-4 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                                        <div className="flex items-start justify-between mb-2">
                                             <p className="text-sm font-medium text-surface-900 dark:text-white">
                                                  <span className="text-primary-600 dark:text-primary-400 mr-2">Q{i + 1}.</span>
                                                  {q.questionText}
                                             </p>
                                             <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                                  <span className="badge-primary text-[10px]">{q.marks} marks</span>
                                                  <button onClick={() => {
                                                       setEditingQuestion(q)
                                                       setQuestionForm({ questionText: q.questionText, options: q.options, correctAnswer: q.correctAnswer, marks: q.marks })
                                                  }} className="p-1 text-surface-400 hover:text-primary-500 transition-colors">
                                                       <HiPencilSquare className="w-4 h-4" />
                                                  </button>
                                                  <button onClick={() => handleDeleteQuestion(q._id)}
                                                       className="p-1 text-surface-400 hover:text-red-500 transition-colors">
                                                       <HiTrash className="w-4 h-4" />
                                                  </button>
                                             </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                                             {q.options.map((opt, oi) => (
                                                  <span key={oi} className={`px-2.5 py-1.5 rounded-lg ${oi === q.correctAnswer
                                                       ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800'
                                                       : 'bg-surface-50 dark:bg-surface-700/50 text-surface-600 dark:text-surface-400'
                                                       }`}>
                                                       {String.fromCharCode(65 + oi)}. {opt}
                                                  </span>
                                             ))}
                                        </div>
                                   </div>
                              ))}
                              {questions.length === 0 && (
                                   <p className="text-center py-8 text-surface-400 text-sm">No questions yet. Add your first question above.</p>
                              )}
                         </div>
                    </div>
               </Modal>

               {/* Delete Confirmation */}
               <ConfirmModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDeleteTest}
                    title="Delete Test"
                    message="Are you sure you want to delete this test? All associated questions will also be deleted. This action cannot be undone."
                    confirmText="Delete Test"
               />
          </div>
     )
}
