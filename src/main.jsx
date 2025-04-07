import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/output.css'
import './styles/globals.css'
import './styles/tailwind.css'
import './styles/app.css'
import { handleBasePathRedirection, hasAuthParams } from './utils/pathUtils.js'

// Special handling for auth token URLs - we'll handle them in the Auth callback component
if (hasAuthParams()) {
  console.log('Auth parameters detected in URL, redirecting to proper auth callback...');
  
  // Let the handleBasePathRedirection function deal with it
  // It will preserve the hash with auth tokens when redirecting
  const redirected = handleBasePathRedirection();
  
  if (!redirected) {
    // If no redirection needed, render the app
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  }
} else {
  // Regular path handling for non-auth URLs
  if (!handleBasePathRedirection()) {
    // Only render the app if no redirection was needed
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  }
}
