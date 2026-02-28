import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginStart, loginSuccess, loginFailure, clearError } from '../../store/slices/authSlice'
import { authAPI } from '../../services/api'
import InputField from '../../components/common/InputField'
import ThemeToggle from '../../components/common/ThemeToggle'
import toast from 'react-hot-toast'
import { HiEnvelope, HiLockClosed, HiShieldCheck } from 'react-icons/hi2'

export default function Login() {
     const [email, setEmail] = useState('')
     const [password, setPassword] = useState('')
     const dispatch = useDispatch()
     const navigate = useNavigate()
     const { loading, error, isAuthenticated, user } = useSelector(state => state.auth)

     useEffect(() => {
          if (isAuthenticated && user) {
               navigate(user.role === 'admin' ? '/admin' : '/student', { replace: true })
          }
     }, [isAuthenticated, user, navigate])

     useEffect(() => {
          return () => { dispatch(clearError()) }
     }, [dispatch])

     const handleSubmit = async (e) => {
          e.preventDefault()
          if (!email || !password) {
               toast.error('Please fill in all fields')
               return
          }
          dispatch(loginStart())
          try {
               const data = await authAPI.login(email, password)
               dispatch(loginSuccess(data))
               toast.success(`Welcome back, ${data.user.name}!`)
          } catch (err) {
               dispatch(loginFailure(err.message))
               toast.error(err.message)
          }
     }

     return (
          <div className="min-h-screen flex">
               {/* Left panel — decorative */}
               <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

                    <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
                         <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-8">
                              <HiShieldCheck className="w-10 h-10" />
                         </div>
                         <h1 className="text-4xl font-display font-bold mb-4 text-center">Quizora</h1>
                         <p className="text-lg text-white/80 text-center max-w-md leading-relaxed">
                              Secure, reliable, and intelligent online examination platform with advanced anti-cheating features.
                         </p>

                         <div className="mt-12 grid grid-cols-2 gap-6 w-full max-w-sm">
                              {[
                                   { label: 'Anti-Cheat', desc: 'AI-powered monitoring' },
                                   { label: 'Secure', desc: 'End-to-end encryption' },
                                   { label: 'Real-time', desc: 'Live proctoring' },
                                   { label: 'Analytics', desc: 'Detailed insights' },
                              ].map((f, i) => (
                                   <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                        <p className="font-semibold text-sm">{f.label}</p>
                                        <p className="text-xs text-white/60 mt-1">{f.desc}</p>
                                   </div>
                              ))}
                         </div>

                         {/* Demo credentials */}
                         <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 w-full max-w-sm">
                              <p className="text-sm font-semibold mb-3">Demo Credentials</p>
                              <div className="space-y-2 text-xs text-white/80">
                                   <p><span className="font-medium text-white">Admin:</span> admin@quizora.com / admin123</p>
                                   <p><span className="font-medium text-white">Student:</span> alex@student.com / student123</p>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Right panel — form */}
               <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-surface-50 dark:bg-surface-950">
                    <div className="w-full max-w-md">
                         <div className="flex justify-between items-center mb-8">
                              <div>
                                   <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Welcome back</h2>
                                   <p className="text-surface-500 dark:text-surface-400 mt-1">Sign in to your account</p>
                              </div>
                              <ThemeToggle />
                         </div>

                         {error && (
                              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm animate-slide-down">
                                   {error}
                              </div>
                         )}

                         {/* Mobile demo credentials */}
                         <div className="lg:hidden mb-6 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-sm">
                              <p className="font-semibold text-primary-700 dark:text-primary-300 mb-2">Demo Credentials</p>
                              <p className="text-primary-600 dark:text-primary-400"><strong>Admin:</strong> admin@quizora.com / admin123</p>
                              <p className="text-primary-600 dark:text-primary-400"><strong>Student:</strong> alex@student.com / student123</p>
                         </div>

                         <form onSubmit={handleSubmit} className="space-y-5">
                              <InputField
                                   label="Email Address"
                                   type="email"
                                   name="email"
                                   value={email}
                                   onChange={(e) => setEmail(e.target.value)}
                                   placeholder="you@example.com"
                                   icon={HiEnvelope}
                                   required
                              />
                              <InputField
                                   label="Password"
                                   type="password"
                                   name="password"
                                   value={password}
                                   onChange={(e) => setPassword(e.target.value)}
                                   placeholder="Enter your password"
                                   icon={HiLockClosed}
                                   required
                              />

                              <button
                                   type="submit"
                                   disabled={loading}
                                   className="btn-primary w-full py-3 text-base"
                              >
                                   {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                             Signing in...
                                        </span>
                                   ) : 'Sign In'}
                              </button>
                         </form>

                         <p className="mt-6 text-center text-sm text-surface-500 dark:text-surface-400">
                              Don't have an account?{' '}
                              <Link to="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                                   Create one
                              </Link>
                         </p>
                    </div>
               </div>
          </div>
     )
}
