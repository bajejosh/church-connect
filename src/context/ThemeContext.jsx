// src/context/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

// Create the theme context
const ThemeContext = createContext();

// Provider component
export const ThemeProvider = ({ children }) => {
  // Check if user has a saved theme preference or use dark mode as default
  const [darkMode, setDarkMode] = useState(() => {
    // First check for stored preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Otherwise default to dark mode
    return true;
  });

  // Update the theme when darkMode state changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Toggle between light and dark modes
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
