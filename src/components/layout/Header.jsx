// src/components/layout/Header.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  FaBars, 
  FaBell,
  FaSignOutAlt,
} from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useSidebar } from '../../context/SidebarContext'
import { supabase } from '../../lib/supabase'
import ThemeToggle from '../common/ThemeToggle'
import UserAvatar from '../common/UserAvatar'

const Header = () => {
  const { user, signOut } = useAuth()
  const { darkMode } = useTheme()
  const { toggleSidebar } = useSidebar()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const [notificationCount, setNotificationCount] = useState(0)
  
  const handleSignOut = async () => {
    try {
      await signOut()
      // Manually redirect to login page after sign out
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      // Even if there's an error, still redirect to login page
      navigate('/login')
    }
  }

  // Fetch notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        if (!user?.id) return
        
        const { count, error } = await supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('recipient_id', user.id)
          .eq('read', false)
        
        if (!error) {
          setNotificationCount(count || 0)
        }
      } catch (error) {
        console.error('Error fetching notification count:', error)
      }
    }
    
    fetchNotificationCount()
    
    // Setup real-time subscription for new notifications
    const subscription = supabase
      .channel('notifications_count')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${user?.id}`,
      }, () => {
        // Increment the notification count
        setNotificationCount(prev => prev + 1)
      })
      .subscribe()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [user?.id])

  return (
    <header className="bg-white shadow-sm dark:bg-dark-secondary sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-3 py-3">
        {/* Top row with logo and user controls */}
        <div className="flex justify-between items-center">
          {/* Logo & Title */}
          <div className="flex items-center">
            <button 
              className="mr-2 md:hidden text-gray-600 dark:text-gray-300"
              onClick={toggleSidebar}
            >
              <FaBars className="text-xl" />
            </button>
            <Link to="/dashboard" className="flex items-center">
              <span className="text-xl font-bold text-blue-600">Church Connect</span>
            </Link>
          </div>
          
          {/* Right side nav items */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            
            <Link 
              to="/notifications"
              className="relative text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              <FaBell className="text-xl" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Link>
            
            <div className="relative">
              <button
                className="flex items-center"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <UserAvatar 
                  userId={user?.id} 
                  fullName={user?.user_metadata?.full_name}
                  email={user?.email}
                  size="md"
                />
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Your Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    onClick={handleSignOut}
                  >
                    <FaSignOutAlt className="mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
