// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { formatPath, getBasePath } from '../utils/pathUtils'

const AuthContext = createContext()

// Helper function to get the full site URL with base path
const getSiteUrl = () => {
  const origin = window.location.origin
  const basePath = getBasePath()
  
  // For hash router, we need to include the hash
  if (window.location.hostname === 'bajejosh.github.io' || basePath.startsWith('/church-connect')) {
    return `${origin}${basePath}#`
  }
  
  return `${origin}${basePath}`
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check for active session on mount
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        
        setUser(data?.session?.user || null)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, meta = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: meta,
          emailRedirectTo: `${getSiteUrl()}/auth/callback`
        }
      })
      
      if (error) throw error
      return data
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          redirectTo: `${getSiteUrl()}/auth/callback`
        }
      })
      
      if (error) throw error
      return data
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  const signOut = async () => {
    try {
      // Force clear the user state first for immediate UI feedback
      setUser(null)
      
      // Clear any local storage items containing user data
      localStorage.removeItem('userFullName')
      localStorage.removeItem('userAvatarUrl')
      
      // Then attempt to sign out from Supabase - but handle the error gracefully
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.warn('Warning during sign out process:', error.message)
        // Don't throw the error - just log it and continue
        
        // If it's a missing session error, we can safely ignore it
        if (error.message.includes('Auth session missing')) {
          console.log('Session was already expired or invalid')
        }
      }
      
      // Manually navigate to login with the correct base path
      window.location.href = `${window.location.origin}${formatPath('login')}`
    } catch (error) {
      console.warn('Error in sign out process:', error.message)
      // Still don't throw the error - we've already cleared the user state
      
      // Ensure we still redirect to login
      window.location.href = `${window.location.origin}${formatPath('login')}`
    }
  }

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getSiteUrl()}/auth/callback?reset=true`,
      })
      
      if (error) throw error
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  const updateProfile = async (profileData) => {
    try {
      // First update auth metadata if needed
      if (profileData.email) {
        const { error: updateError } = await supabase.auth.updateUser({
          email: profileData.email,
          options: {
            emailRedirectTo: `${getSiteUrl()}/auth/callback`
          }
        })
        if (updateError) throw updateError
      }
      
      // Then update profile data in the profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.fullName,
          updated_at: new Date()
        })
        .eq('id', user.id)
      
      if (error) throw error
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
