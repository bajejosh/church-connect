// src/components/layout/BottomNavigation.jsx
import { Link } from 'react-router-dom'
import { FaHome, FaCalendarAlt, FaMusic, FaPray, FaChurch, FaUser } from 'react-icons/fa'
import { useLocation } from 'react-router-dom'

const BottomNavigation = () => {
  const location = useLocation();
  
  // Function to check if a path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

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
          to="/prayer-requests" 
          className={`flex flex-col items-center p-2 text-xs ${isActive('/prayer-requests') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
        >
          <FaPray className="text-xl mb-1" />
          <span>Prayer</span>
        </Link>
        
        <Link 
          to="/churches" 
          className={`flex flex-col items-center p-2 text-xs ${isActive('/churches') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
        >
          <FaChurch className="text-xl mb-1" />
          <span>Churches</span>
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
