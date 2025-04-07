// src/components/layout/BottomNavigation.jsx
import { NavLink } from 'react-router-dom'
import { FaHome, FaCalendarAlt, FaMusic, FaPray, FaUser } from 'react-icons/fa'

const BottomNavigation = () => {
  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 py-2 md:hidden dark:bg-dark-secondary dark:border-gray-800">
      <div className="flex justify-around items-center">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => 
            `flex flex-col items-center p-2 text-xs ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`
          }
        >
          <FaHome className="text-xl mb-1" />
          <span>Home</span>
        </NavLink>
        
        <NavLink 
          to="/calendar" 
          className={({ isActive }) => 
            `flex flex-col items-center p-2 text-xs ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`
          }
        >
          <FaCalendarAlt className="text-xl mb-1" />
          <span>Calendar</span>
        </NavLink>
        
        <NavLink 
          to="/songs" 
          className={({ isActive }) => 
            `flex flex-col items-center p-2 text-xs ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`
          }
        >
          <FaMusic className="text-xl mb-1" />
          <span>Songs</span>
        </NavLink>
        
        <NavLink 
          to="/prayer-requests" 
          className={({ isActive }) => 
            `flex flex-col items-center p-2 text-xs ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`
          }
        >
          <FaPray className="text-xl mb-1" />
          <span>Prayer</span>
        </NavLink>
        
        <NavLink 
          to="/profile" 
          className={({ isActive }) => 
            `flex flex-col items-center p-2 text-xs ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`
          }
        >
          <FaUser className="text-xl mb-1" />
          <span>Profile</span>
        </NavLink>
      </div>
    </nav>
  )
}

export default BottomNavigation
