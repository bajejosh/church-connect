import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatPath } from '../../utils/pathUtils'

/**
 * Auth callback page that handles the redirect from Supabase auth
 * This component handles the authentication flow after email verification
 */
const AuthCallback = () => {
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('Verifying your account...')
  
  useEffect(() => {
    // Handle the auth callback
    const handleAuthCallback = async () => {
      try {
        setStatus('Processing authentication...')
        
        // Check for error in URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const errorParam = hashParams.get('error_description')
        
        if (errorParam) {
          throw new Error(errorParam)
        }
        
        // Log the hash for debugging
        console.log('Auth hash found:', window.location.hash ? 'Yes (hash exists)' : 'No')
        
        // Check if we're handling a password reset
        const isReset = hashParams.get('type') === 'recovery'
        if (isReset) {
          setStatus('Password reset confirmed')
          // For password reset, navigate to dashboard
          navigate(formatPath('dashboard'), { replace: true })
          return
        }
        
        // Get the session from URL if available
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }
        
        if (data?.session) {
          // If we have a session, navigate to the dashboard
          setStatus('Authentication successful, redirecting to dashboard')
          console.log('Authentication successful, redirecting to dashboard')
          
          // Short delay to ensure navigation works properly
          setTimeout(() => {
            navigate(formatPath('dashboard'), { replace: true })
          }, 100)
        } else {
          // If no session, try to extract token from hash
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')
          
          if (accessToken) {
            setStatus('Processing access token...')
            
            try {
              // Try to set the session with the tokens from the URL
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || ''
              })
              
              if (error) throw error
              
              if (data?.session) {
                setStatus('Session established, redirecting to dashboard')
                setTimeout(() => {
                  navigate(formatPath('dashboard'), { replace: true })
                }, 100)
                return
              }
            } catch (tokenError) {
              console.error('Token processing error:', tokenError)
              // Continue to fallback logic below
            }
          }
          
          // Fallback if other methods fail
          setStatus('No session found, redirecting to login')
          console.log('No session found, redirecting to login')
          setTimeout(() => {
            navigate(formatPath('login'), { replace: true })
          }, 100)
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError(err.message)
        setStatus('Authentication error, redirecting to login')
        // On error, redirect to login after a delay
        setTimeout(() => {
          navigate(formatPath('login'), { replace: true })
        }, 1500)
      }
    }
    
    handleAuthCallback()
  }, [navigate])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          {error ? 'Authentication Error' : 'Verifying Your Account'}
        </h1>
        
        {error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              {status}
            </p>
          </div>
        )}
        
        {error && (
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Redirecting you to the login page...
          </p>
        )}
      </div>
    </div>
  )
}

export default AuthCallback
