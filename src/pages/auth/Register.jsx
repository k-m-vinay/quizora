import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginStart, loginSuccess, loginFailure, clearError } from '../../store/slices/authSlice'
import { authAPI } from '../../services/api'
import InputField from '../../components/common/InputField'
import ThemeToggle from '../../components/common/ThemeToggle'
import toast from 'react-hot-toast'
import { HiEnvelope, HiLockClosed, HiUser, HiShieldCheck } from 'react-icons/hi2'

export default function Register() {
     const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' })
     const [errors, setErrors] = useState({})
     const dispatch = useDispatch()
     const navigate = useNavigate()
     const { loading, isAuthenticated, user } = useSelector(state => state.auth)

     useEffect(() => {
          if (isAuthenticated && user) {
               navigate(user.role === 'admin' ? '/admin' : '/student', { replace: true })
          }
     }, [isAuthenticated, user, navigate])

     useEffect(() => {
          return () => { dispatch(clearError()) }
     }, [dispatch])

     const validate = () => {
          const e = {}
          if (!formData.name.trim()) e.name = 'Name is required'
          if (!formData.email.trim()) e.email = 'Email is required'
          else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Invalid email format'
          if (!formData.password) e.password = 'Password is required'
          else if (formData.password.length < 6) e.password = 'Password must be at least 6 characters'
          if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match'
          setErrors(e)
          return Object.keys(e).length === 0
     }

     const handleChange = (e) => {
          setFormData({ ...formData, [e.target.name]: e.target.value })
          if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
     }

     const handleSubmit = async (e) => {
          e.preventDefault()
          if (!validate()) return
          dispatch(loginStart())
          try {
               const data = await authAPI.register(formData.name, formData.email, formData.password, formData.role)
               dispatch(loginSuccess(data))
               toast.success('Account created successfully!')
          } catch (err) {
               dispatch(loginFailure(err.message))
               toast.error(err.message)
          }
     }

     return (
          <div className="min-h-screen flex">
               {/* Left panel */}
               <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-accent-600 via-primary-700 to-primary-800 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
                    <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
                         <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-8">
                              <HiShieldCheck className="w-10 h-10" />
                         </div>
                         <h1 className="text-4xl font-display font-bold mb-4 text-center">Join Quizora</h1>
                         <p className="text-lg text-white/80 text-center max-w-md leading-relaxed">
                              Create your account and access the most secure examination platform available.
                         </p>
                    </div>
               </div>

               {/* Right panel */}
               <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-surface-50 dark:bg-surface-950">
                    <div className="w-full max-w-md">
                         <div className="flex justify-between items-center mb-8">
                              <div>
                                   <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Create Account</h2>
                                   <p className="text-surface-500 dark:text-surface-400 mt-1">Fill in your details to get started</p>
                              </div>
                              <ThemeToggle />
                         </div>

                         <form onSubmit={handleSubmit} className="space-y-4">
                              <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" icon={HiUser} required error={errors.name} />
                              <InputField label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" icon={HiEnvelope} required error={errors.email} />
                              <InputField label="Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min 6 characters" icon={HiLockClosed} required error={errors.password} />
                              <InputField label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" icon={HiLockClosed} required error={errors.confirmPassword} />

                              <div className="space-y-1.5">
                                   <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Role</label>
                                   <div className="flex gap-3">
                                        {['student', 'admin'].map(role => (
                                             <button
                                                  key={role}
                                                  type="button"
                                                  onClick={() => setFormData({ ...formData, role })}
                                                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all border ${formData.role === role
                                                       ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-300'
                                                       : 'bg-surface-50 dark:bg-surface-900 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-surface-300'
                                                       }`}
                                             >
                                                  {role.charAt(0).toUpperCase() + role.slice(1)}
                                             </button>
                                        ))}
                                   </div>
                              </div>

                              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
                                   {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                             Creating account...
                                        </span>
                                   ) : 'Create Account'}
                              </button>
                         </form>

                         <p className="mt-6 text-center text-sm text-surface-500 dark:text-surface-400">
                              Already have an account?{' '}
                              <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                                   Sign in
                              </Link>
                         </p>
                    </div>
               </div>
          </div>
     )
}
