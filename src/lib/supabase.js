// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Use environment variables with fallbacks for safety
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xlsazndxtgqlsyohzjhp.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsc2F6bmR4dGdxbHN5b2h6amhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4Nzc3MTIsImV4cCI6MjA1OTQ1MzcxMn0.N1oXEwBKFjmiP0zacqY6HTHr-50-PZZjTBUzkkIyub4'

// Console log for debugging (remove in production)
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Using fallback values.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
