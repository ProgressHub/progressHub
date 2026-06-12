// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AuthShell from './pages/auth/AuthShell'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

import StudentLayout from './layouts/StudentLayout'
import StudentDashboard from './pages/student/Dashboard'
import Tasks from './pages/student/Tasks'
import Assignments from './pages/student/Assignments'

const Unauthorized = () => (
  <div
    style={{
      color: '#ff9090',
      background: '#0a1520',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif',
      fontSize: '1.2rem',
    }}
  >
    🚫 Unauthorized — You don't have access to this page.
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthShell><Outlet /></AuthShell>}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Old dashboard — keep for now */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Student routes */}
          <Route
            element={
              <ProtectedRoute>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/tasks" element={<Tasks />} />
            <Route path="/student/assignments" element={<Assignments />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App