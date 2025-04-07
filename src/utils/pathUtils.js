/**
 * Path utilities for handling base path in the application
 * These utilities help ensure URLs work correctly with the base path configuration
 */

// Get the base path from the environment or use the default
export const getBasePath = () => {
  // This should match the 'base' setting in vite.config.js
  return import.meta.env.BASE_URL || '/church-connect/';
};

/**
 * Ensures a path includes the correct base path prefix
 * @param {string} path - The path to format
 * @returns {string} - The path with correct base path
 */
export const formatPath = (path) => {
  const basePath = getBasePath();
  
  // Remove leading slash from path if it exists
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Remove leading slash from basePath if it exists for comparison
  const cleanBasePath = basePath.startsWith('/') ? basePath.substring(1) : basePath;
  
  // If path already starts with the base path, return it as is
  if (cleanPath.startsWith(cleanBasePath)) {
    return '/' + cleanPath;
  }
  
  // Otherwise, join the base path and the path
  return basePath + cleanPath;
};

/**
 * Checks if the URL contains authentication parameters in the hash fragment
 * Returns true if the URL has auth params that should be preserved
 */
export const hasAuthParams = () => {
  const hash = window.location.hash;
  return hash.includes('access_token=') || 
         hash.includes('refresh_token=') || 
         hash.includes('type=recovery') ||
         hash.includes('type=signup');
};

/**
 * Redirects the user to the correct URL with base path if needed
 * Call this function on initial app load to handle incorrect URLs
 */
export const handleBasePathRedirection = () => {
  const basePath = getBasePath();
  const currentPath = window.location.pathname;
  
  // If URL has auth params in the hash, we need special handling
  if (hasAuthParams()) {
    // Extract the hash to preserve it
    const hash = window.location.hash;
    
    // Check if we're missing the base path prefix in the URL
    if (basePath !== '/' && !currentPath.startsWith(basePath)) {
      // Get the path after the domain
      const pathWithoutBase = currentPath.startsWith('/') ? currentPath.substring(1) : currentPath;
      
      // Create the correct path with base path
      const correctPath = basePath + pathWithoutBase;
      
      // Preserve the hash containing auth tokens by using window.location.href
      window.location.href = `${window.location.origin}${correctPath}${hash}`;
      return true;
    }
    
    // If we already have the base path, don't redirect
    return false;
  }
  
  // Regular path handling (non-auth URLs)
  // Check if we're at the root and need to redirect to the base path
  if (currentPath === '/' && basePath !== '/') {
    window.location.pathname = basePath;
    return true;
  }
  
  // Check if we're missing the base path prefix in the URL
  if (basePath !== '/' && 
      !currentPath.startsWith(basePath) && 
      !currentPath.includes('/auth/callback')) {
    
    // Get the path after the domain
    const pathWithoutBase = currentPath.startsWith('/') ? currentPath.substring(1) : currentPath;
    
    // Create the correct path with base path
    const correctPath = basePath + pathWithoutBase;
    
    // Redirect to the correct path
    window.location.pathname = correctPath;
    return true;
  }
  
  return false; // No redirection needed
};

/**
 * Creates an auth redirect URL that includes the base path
 * Use this when configuring Supabase auth redirects
 */
export const getAuthRedirectUrl = () => {
  const baseUrl = window.location.origin;
  const basePath = getBasePath();
  
  // For HashRouter, include the hash in the redirect URL
  return `${baseUrl}${basePath}#/auth/callback`;
};

export default {
  getBasePath,
  formatPath,
  handleBasePathRedirection,
  getAuthRedirectUrl,
  hasAuthParams
};
