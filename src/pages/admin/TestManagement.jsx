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
                    toast.success('Test updated!')
               } else {
                    const newTest = await testAPI.create({ ...testForm, createdBy: user._id })
                    setTests([...tests, newTest])
                    toast.success('Test created!')
               }
               setShowModal(false)
               resetTestForm()
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
          setShowModal(true)
     }

     const resetTestForm = () => {
          setEditingTest(null)
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
                    <button onClick={() => { resetTestForm(); setShowModal(true) }} className="btn-primary gap-2">
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

                              <div className="flex items-center gap-2 pt-3 border-t border-surface-100 dark:border-surface-700">
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
                    title={editingTest ? 'Edit Test' : 'Create New Test'} size="lg">
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
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
                         <div className="grid grid-cols-2 gap-4">
                              <div>
                                   <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Start Date</label>
                                   <input type="datetime-local" value={testForm.startDate} onChange={e => setTestForm({ ...testForm, startDate: e.target.value })} className="input" />
                              </div>
                              <div>
                                   <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">End Date</label>
                                   <input type="datetime-local" value={testForm.endDate} onChange={e => setTestForm({ ...testForm, endDate: e.target.value })} className="input" />
                              </div>
                         </div>
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
                              <button onClick={handleSaveTest} className="btn-primary">{editingTest ? 'Update Test' : 'Create Test'}</button>
                         </div>
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
