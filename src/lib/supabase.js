// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'
import { getAuthRedirectUrl } from '../utils/pathUtils'

// Use environment variables with fallbacks for safety
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xlsazndxtgqlsyohzjhp.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsc2F6bmR4dGdxbHN5b2h6amhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4Nzc3MTIsImV4cCI6MjA1OTQ1MzcxMn0.N1oXEwBKFjmiP0zacqY6HTHr-50-PZZjTBUzkkIyub4'

// Console log for debugging (remove in production)
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Using fallback values.')
}

// Utility function to get the current site URL including the base path
export const getSiteUrl = () => {
  if (typeof window === 'undefined') return ''
  
  const { origin } = window.location
  const basePath = import.meta.env.BASE_URL || '/church-connect/'
  return `${origin}${basePath}`
}

// Get the redirect URL for auth
const getRedirectUrl = () => {
  if (typeof window === 'undefined') return undefined
  return getAuthRedirectUrl()
}

// Create Supabase client with auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Use the utility function to generate the correct redirect URL with base path
    redirectTo: getRedirectUrl()
  }
})

// For newer Supabase versions
// This function is compatible with the latest Supabase auth API
export const updateSupabaseRedirectUrl = () => {
  // No need to dynamically update anymore - the redirectTo is set during client initialization
  console.log('Auth redirect URL:', getRedirectUrl())
}

// Don't call updateSupabaseRedirectUrl directly, as it's not needed and may produce errors
