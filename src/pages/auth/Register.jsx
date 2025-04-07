// src/pages/auth/Register.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaEnvelope, FaLock, FaUser, FaChurch, FaUserPlus, FaMoon, FaSun } from 'react-icons/fa'

const Register = () => {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    churchName: ''
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    // Default to dark mode
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === null ? true : savedMode === 'true';
  })

  // Apply dark mode on component mount and when it changes
  useEffect(() => {
    // Apply dark mode to html element
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference
    localStorage.setItem('darkMode', darkMode);
    
    // Force-apply dark classes to body as well to ensure we get the dark styling
    if (darkMode) {
      document.body.classList.add('dark', 'bg-gray-900');
    } else {
      document.body.classList.remove('dark', 'bg-gray-900');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      setError(null)
      setLoading(true)
      
      // Add user metadata for profile
      await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        church_name: formData.churchName
      })
      
      navigate('/verify-email')
    } catch (err) {
      setError(err.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} px-4 py-12 sm:px-6 lg:px-8`}>
      <div className="w-full max-w-md">
        {/* Dark mode toggle */}
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'}`}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
        
        <div className="text-center mb-6">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Church Connect</h1>
          <h2 className={`mt-6 text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create an account</h2>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Join the community today
          </p>
        </div>
        
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 shadow rounded-lg`}>
          {error && (
            <div className={`mb-4 p-3 ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'} rounded-md text-sm`}>
              {error}
            </div>
          )}
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none block w-full pl-10 px-3 py-3 border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-500' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="fullName" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Full Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  className={`appearance-none block w-full pl-10 px-3 py-3 border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-500' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="churchName" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Church Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaChurch className="text-gray-400" />
                </div>
                <input
                  id="churchName"
                  name="churchName"
                  type="text"
                  className={`appearance-none block w-full pl-10 px-3 py-3 border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-500' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Grace Community Church"
                  value={formData.churchName}
                  onChange={handleChange}
                />
              </div>
              <p className={`mt-1 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Optional - You can join or create a church later</p>
            </div>
            
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none block w-full pl-10 px-3 py-3 border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-500' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none block w-full pl-10 px-3 py-3 border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-500' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? (
                  <div className="animate-spin h-5 w-5 mr-2 border-t-2 border-white rounded-full" />
                ) : (
                  <FaUserPlus className="mr-2" />
                )}
                Sign up
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Already have an account?{' '}
              <Link to="/login" className={`font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
