// src/utils/FixDatabase.jsx
import React, { useState } from 'react';
import { fixPostsTable, refreshSchemaCache } from './dbFix';

/**
 * A component to fix database schema issues through the UI
 * This can be hidden behind an admin check if needed
 */
const FixDatabase = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState(null);
  
  const handleFixDatabase = async () => {
    setIsFixing(true);
    setResult(null);
    
    try {
      // Try to fix the database schema
      const fixResult = await fixPostsTable();
      
      // Refresh the schema cache regardless of fix result
      await refreshSchemaCache();
      
      setResult({
        success: fixResult.success,
        message: fixResult.success 
          ? 'Database schema updated successfully! You should now be able to create posts.'
          : `Failed to update database: ${fixResult.error?.message || 'Unknown error'}`
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Unexpected error: ${error.message}`
      });
    } finally {
      setIsFixing(false);
    }
  };
  
  return (
    <div className="p-4 mb-4 border rounded-lg bg-gray-50">
      <h2 className="text-lg font-medium mb-2">Database Maintenance</h2>
      
      <p className="mb-4 text-sm text-gray-600">
        If you're experiencing issues with creating posts or seeing errors about missing columns,
        click the button below to update the database schema.
      </p>
      
      <button
        onClick={handleFixDatabase}
        disabled={isFixing}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isFixing ? 'Updating Schema...' : 'Fix Database Schema'}
      </button>
      
      {result && (
        <div className={`mt-4 p-3 rounded-md ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {result.message}
        </div>
      )}
      
      <div className="mt-4">
        <h3 className="text-md font-medium mb-2">Manual Fix Instructions:</h3>
        <ol className="list-decimal ml-5 text-sm space-y-1">
          <li>Go to the <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase dashboard</a></li>
          <li>Navigate to your project</li>
          <li>Open the SQL Editor</li>
          <li>Run this SQL command:</li>
          <li>
            <pre className="bg-gray-100 p-2 mt-1 rounded overflow-x-auto">
              ALTER TABLE posts<br/>
              ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false,<br/>
              ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';
            </pre>
          </li>
          <li>Return to this app and refresh the page</li>
        </ol>
      </div>
    </div>
  );
};

export default FixDatabase;
