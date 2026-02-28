import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import ThemeToggle from '../components/common/ThemeToggle'
import toast from 'react-hot-toast'
import {
     HiOutlineHome, HiOutlineDocumentText, HiOutlineTrophy,
     HiOutlineArrowRightOnRectangle, HiOutlineBars3,
     HiShieldCheck, HiOutlineClipboardDocumentList,
} from 'react-icons/hi2'

const navItems = [
     { path: '/student', icon: HiOutlineHome, label: 'Dashboard', end: true },
     { path: '/student/tests', icon: HiOutlineDocumentText, label: 'Available Tests' },
     { path: '/student/results', icon: HiOutlineClipboardDocumentList, label: 'My Results' },
     { path: '/student/leaderboard', icon: HiOutlineTrophy, label: 'Leaderboard' },
]

export default function StudentLayout() {
     const [sidebarOpen, setSidebarOpen] = useState(false)
     const { user } = useSelector(state => state.auth)
     const { isStarted } = useSelector(state => state.exam)
     const dispatch = useDispatch()
     const navigate = useNavigate()
     const location = useLocation()

     // Hide layout during exam
     const isExamMode = location.pathname.includes('/exam/') || isStarted

     useEffect(() => {
          const token = localStorage.getItem('token')
          if (token) {
               try {
                    const decoded = JSON.parse(atob(token))
                    if (decoded.exp && decoded.exp < Date.now()) {
                         dispatch(logout())
                         toast.error('Session expired. Please login again.')
                         navigate('/login', { replace: true })
                    }
               } catch (e) { /* ignore */ }
          }
     }, [dispatch, navigate])

     const handleLogout = () => {
          dispatch(logout())
          toast.success('Logged out successfully')
          navigate('/login', { replace: true })
     }

     if (isExamMode) {
          return <Outlet />
     }

     return (
          <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex">
               {sidebarOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
               )}

               <aside className={`fixed lg:sticky top-0 z-50 lg:z-auto h-screen w-72 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}>
                    <div className="p-6 border-b border-surface-100 dark:border-surface-800">
                         <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                   <HiShieldCheck className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                   <h1 className="font-display font-bold text-lg text-surface-900 dark:text-white">Quizora</h1>
                                   <p className="text-xs text-surface-500">Student Portal</p>
                              </div>
                         </div>
                    </div>

                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                         {navItems.map(item => (
                              <NavLink
                                   key={item.path}
                                   to={item.path}
                                   end={item.end}
                                   onClick={() => setSidebarOpen(false)}
                                   className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                             ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                             : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-200'
                                        }`
                                   }
                              >
                                   <item.icon className="w-5 h-5" />
                                   {item.label}
                              </NavLink>
                         ))}
                    </nav>

                    <div className="p-4 border-t border-surface-100 dark:border-surface-800">
                         <div className="flex items-center gap-3 px-3 py-2">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                                   {user?.name?.charAt(0) || 'S'}
                              </div>
                              <div className="flex-1 min-w-0">
                                   <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{user?.name}</p>
                                   <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                              </div>
                         </div>
                         <button
                              onClick={handleLogout}
                              className="w-full mt-2 flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                         >
                              <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                              Logout
                         </button>
                    </div>
               </aside>

               <div className="flex-1 flex flex-col min-h-screen">
                    <header className="sticky top-0 z-30 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800">
                         <div className="flex items-center justify-between px-4 lg:px-8 py-3">
                              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                                   <HiOutlineBars3 className="w-6 h-6" />
                              </button>
                              <div className="hidden lg:block" />
                              <div className="flex items-center gap-2">
                                   <ThemeToggle />
                              </div>
                         </div>
                    </header>

                    <main className="flex-1 p-4 lg:p-8">
                         <Outlet />
                    </main>
               </div>
          </div>
     )
}
