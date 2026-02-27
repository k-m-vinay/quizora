import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Layouts
import AdminLayout from './layouts/AdminLayout'
import StudentLayout from './layouts/StudentLayout'

// Common
import ProtectedRoute from './components/common/ProtectedRoute'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import TestManagement from './pages/admin/TestManagement'
import AdminResults from './pages/admin/AdminResults'
import AdminAnalytics from './pages/admin/AdminAnalytics'

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard'
import AvailableTests from './pages/student/AvailableTests'
import ExamInterface from './pages/student/ExamInterface'
import StudentResults from './pages/student/StudentResults'
import Leaderboard from './pages/student/Leaderboard'

function App() {
     const { isAuthenticated, user } = useSelector(state => state.auth)

     return (
          <Routes>
               {/* Public Routes */}
               <Route path="/login" element={<Login />} />
               <Route path="/register" element={<Register />} />

               {/* Admin Routes */}
               <Route
                    path="/admin"
                    element={
                         <ProtectedRoute allowedRoles={['admin']}>
                              <AdminLayout />
                         </ProtectedRoute>
                    }
               >
                    <Route index element={<AdminDashboard />} />
                    <Route path="tests" element={<TestManagement />} />
                    <Route path="results" element={<AdminResults />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
               </Route>

               {/* Student Routes */}
               <Route
                    path="/student"
                    element={
                         <ProtectedRoute allowedRoles={['student']}>
                              <StudentLayout />
                         </ProtectedRoute>
                    }
               >
                    <Route index element={<StudentDashboard />} />
                    <Route path="tests" element={<AvailableTests />} />
                    <Route path="exam/:testId" element={<ExamInterface />} />
                    <Route path="results" element={<StudentResults />} />
                    <Route path="leaderboard" element={<Leaderboard />} />
               </Route>

               {/* Root redirect */}
               <Route
                    path="/"
                    element={
                         isAuthenticated
                              ? <Navigate to={user?.role === 'admin' ? '/admin' : '/student'} replace />
                              : <Navigate to="/login" replace />
                    }
               />

               {/* Catch-all */}
               <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
     )
}

export default App
