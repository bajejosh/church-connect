// src/utils/supabaseUtils.js
import { supabase } from '../lib/supabase';

/**
 * Helper function for making direct REST API calls to Supabase
 * Handles the proper headers and error handling
 * 
 * @param {string} table - Table name
 * @param {string} method - HTTP method ('GET', 'POST', 'PATCH', 'DELETE')
 * @param {Object} params - URL parameters for filtering
 * @param {Object} data - Data to send in request body (for POST, PATCH)
 * @param {string} returnType - Preference for what to return ('representation', 'minimal', 'headers-only')
 * @returns {Promise<Object>} Response data
 */
export const supabaseRestRequest = async (
  table,
  method = 'GET',
  params = {},
  data = null,
  returnType = 'representation'
) => {
  // Get auth token if user is logged in
  const { data: authData } = await supabase.auth.getSession();
  const token = authData?.session?.access_token;
  
  // Get Supabase URL and anon key from environment or client
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xlsazndxtgqlsyohzjhp.supabase.co';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || supabase.supabaseKey;
  
  // Build the URL with query parameters
  const url = new URL(`${supabaseUrl}/rest/v1/${table}`);
  
  // Add params to URL
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });
  
  // Set up headers
  const headers = {
    'Content-Type': 'application/json',
    'apikey': supabaseAnonKey,
    'Accept': 'application/json' // Important for REST API responses
  };
  
  // Add auth header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Add Prefer header for write operations
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method.toUpperCase())) {
    headers['Prefer'] = `return=${returnType}`;
  }
  
  // Set up fetch options
  const options = {
    method: method.toUpperCase(),
    headers,
  };
  
  // Add body for methods that support it
  if (['POST', 'PATCH', 'PUT'].includes(method.toUpperCase()) && data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    console.log(`Making ${method} request to ${url.toString()} with headers:`, headers);
    if (data) console.log('Request data:', data);
    
    const response = await fetch(url.toString(), options);
    
    // Log response info for debugging
    console.log(`Response status: ${response.status} ${response.statusText}`);
    console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
    
    // Handle errors
    if (!response.ok) {
      // Try to get detailed error message
      let errorMessage;
      try {
        const errorData = await response.json();
        console.error('Error data:', errorData);
        errorMessage = errorData.message || errorData.error || `${response.status} ${response.statusText}`;
      } catch (e) {
        console.error('Could not parse error response:', e);
        errorMessage = `${response.status} ${response.statusText}`;
      }
      
      throw new Error(`Supabase REST API Error: ${errorMessage}`);
    }
    
    // Parse and return response data
    // Check if there's content to parse
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const contentLength = response.headers.get('content-length');
      let responseData;
      
      if (!contentLength || parseInt(contentLength) === 0) {
        console.log('Empty response, returning null');
        return null;
      }
      
      try {
        responseData = await response.json();
        console.log('Response data:', responseData);
        return responseData;
      } catch (e) {
        console.error('Error parsing JSON response:', e);
        const text = await response.text();
        console.log('Response text:', text);
        return text ? JSON.parse(text) : null;
      }
    } else {
      const text = await response.text();
      console.log('Non-JSON response:', text);
      return null;
    }
  } catch (error) {
    console.error('Supabase REST request failed:', error);
    throw error;
  }
};

/**
 * Helper function specifically for updating a record by ID
 * 
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @param {Object} data - Data to update
 * @returns {Promise<Object>} Updated record
 */
export const updateRecordById = async (table, id, data) => {
  return supabaseRestRequest(
    table,
    'PATCH',
    { id: `eq.${id}`, select: '*' }, // Add select=* to ensure we get data back
    data,
    'representation'
  );
};

/**
 * Helper function for getting a record by ID
 * 
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @param {string} select - Fields to select (default '*')
 * @returns {Promise<Object>} Record data
 */
export const getRecordById = async (table, id, select = '*') => {
  return supabaseRestRequest(
    table,
    'GET',
    { id: `eq.${id}`, select }
  );
};

/**
 * Helper function for deleting a record by ID
 * 
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @returns {Promise<null>}
 */
export const deleteRecordById = async (table, id) => {
  return supabaseRestRequest(
    table,
    'DELETE',
    { id: `eq.${id}` }
  );
};

/**
 * Helper function for inserting a new record
 * 
 * @param {string} table - Table name
 * @param {Object} data - Data to insert
 * @returns {Promise<Object>} Inserted record
 */
export const insertRecord = async (table, data) => {
  return supabaseRestRequest(
    table,
    'POST',
    { select: '*' }, // Add select=* to ensure we get data back
    data,
    'representation'
  );
};
