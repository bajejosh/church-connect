// src/App.jsx
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { SidebarProvider } from './context/SidebarContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { formatPath } from './utils/pathUtils'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import VerifyEmail from './pages/auth/VerifyEmail'
import AuthCallback from './pages/auth/AuthCallback'

// Protected Pages
import Dashboard from './pages/Dashboard'
import Calendar from './pages/Calendar'
import Songs from './pages/Songs'
import Services from './pages/Services'
import Profile from './pages/Profile'
import PrayerRequests from './pages/PrayerRequests'
import Churches from './pages/Churches'
import Notifications from './pages/Notifications'

// Song Management Components
import SongDetail from './components/songs/SongDetail'
import SongForm from './components/songs/SongForm'

// Service Management Components
import ServiceDetail from './components/events/ServiceDetail'
import ServiceForm from './components/events/ServiceForm'

function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <AuthProvider>
        <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/notifications" element={<Notifications />} />
            
            {/* Song Routes */}
            <Route path="/songs" element={<Songs />} />
            <Route path="/songs/:id" element={<SongDetail />} />
            <Route path="/songs/new" element={<SongForm />} />
            <Route path="/songs/edit/:id" element={<SongForm />} />
            
            {/* Service Routes */}
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/services/new" element={<ServiceForm />} />
            <Route path="/services/edit/:id" element={<ServiceForm />} />
            
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/prayer-requests" element={<PrayerRequests />} />
            <Route path="/churches" element={<Churches />} />
          </Route>
          
          {/* Redirect root to login or dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 Route */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-gray-900 dark:text-white">
              <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">The page you're looking for doesn't exist.</p>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  The server is configured with a public base URL of '/church-connect/'
                </p>
                <button 
                  onClick={() => window.location.pathname = formatPath(window.location.pathname.replace(/^\//, ''))}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Go to Correct URL
                </button>
                <button 
                  onClick={() => window.history.back()}
                  className="block w-full mt-2 px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Go Back
                </button>
              </div>
            </div>
          } />
        </Routes>
        </Router>
        </AuthProvider>
      </SidebarProvider>
    </ThemeProvider>
  )
}

export default App
