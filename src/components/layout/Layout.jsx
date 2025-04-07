// src/components/layout/Layout.jsx
import { useState, useEffect } from 'react'
import Header from './Header'
import BottomNavigation from './BottomNavigation'
import Sidebar from './Sidebar'
import { useSidebar } from '../../context/SidebarContext'

const Layout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const { isSidebarOpen, closeSidebar } = useSidebar()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    // Close sidebar when switching to desktop view
    if (!isMobile && isSidebarOpen) {
      closeSidebar();
    }
  }, [isMobile, isSidebarOpen, closeSidebar]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gradient-dark">
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar for tablet/desktop */}
        {!isMobile && (
          <Sidebar className="hidden md:block w-64 bg-white shadow-md dark:bg-dark-secondary" />
        )}
        
        {/* Mobile sidebar */}
        {isMobile && isSidebarOpen && (
          <div className="fixed inset-0 z-40 flex">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" 
              onClick={closeSidebar}
              aria-hidden="true"
            ></div>
            
            {/* Sidebar */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-dark-secondary transform transition ease-in-out duration-300">
              <Sidebar className="flex-1 h-0 overflow-y-auto" />
            </div>
          </div>
        )}
        
        {/* Main content */}
        <main className="flex-1 px-4 md:px-6 pt-4 pb-[100px] md:ml-64">
          {children}
        </main>
      </div>
      
      {/* Bottom navigation for mobile */}
      {isMobile && <BottomNavigation />}
    </div>
  )
}

export default Layout
