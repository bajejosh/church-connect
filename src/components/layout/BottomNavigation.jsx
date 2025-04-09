// src/components/layout/BottomNavigation.jsx
import { Link } from 'react-router-dom'
import { FaHome, FaCalendarAlt, FaMusic, FaPray, FaChurch, FaUser, FaBell } from 'react-icons/fa'
import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const BottomNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  
  // Function to check if a path is active
  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/') {
      return true;
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Fetch notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        if (!user?.id) return;
        
        const { count, error } = await supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('recipient_id', user.id)
          .eq('read', false);
        
        if (!error) {
          setNotificationCount(count || 0);
        }
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };
    
    fetchNotificationCount();
    
    // Setup real-time subscription for new notifications
    const subscription = supabase
      .channel('notifications_count_bottom_nav')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${user?.id}`,
      }, () => {
        // Increment the notification count
        setNotificationCount(prev => prev + 1);
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 py-2 md:hidden dark:bg-dark-secondary dark:border-gray-800">
      <div className="flex justify-around items-center">
        <Link 
          to="/dashboard" 
          className={`flex flex-col items-center p-2 text-xs ${isActive('/dashboard') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
        >
          <FaHome className="text-xl mb-1" />
          <span>Home</span>
        </Link>
        
        <Link 
          to="/calendar" 
          className={`flex flex-col items-center p-2 text-xs ${isActive('/calendar') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
        >
          <FaCalendarAlt className="text-xl mb-1" />
          <span>Calendar</span>
        </Link>
        
        <Link 
          to="/songs" 
          className={`flex flex-col items-center p-2 text-xs ${isActive('/songs') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
        >
          <FaMusic className="text-xl mb-1" />
          <span>Songs</span>
        </Link>
        
        <Link 
          to="/notifications" 
          className={`flex flex-col items-center p-2 text-xs relative ${isActive('/notifications') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
        >
          <span className="relative">
            <FaBell className="text-xl mb-1" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </span>
          <span>Alerts</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={`flex flex-col items-center p-2 text-xs ${isActive('/profile') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
        >
          <FaUser className="text-xl mb-1" />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  )
}

export default BottomNavigation
