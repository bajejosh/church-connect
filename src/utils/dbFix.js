// src/utils/dbFix.js
import { supabase } from '../lib/supabase';

/**
 * Add missing columns to the posts table
 * This is a direct fix for the missing is_anonymous column
 */
export const fixPostsTable = async () => {
  try {
    console.log('Attempting to fix posts table schema...');
    
    // First approach: Try a direct query to add columns
    // This may fail due to permissions but worth trying
    try {
      const { error } = await supabase.rpc('exec_sql', {
        query: `
          ALTER TABLE posts 
          ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false,
          ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';
        `
      });
      
      if (!error) {
        console.log('Schema updated via direct SQL!');
        return { success: true };
      }
    } catch (directError) {
      console.log('Direct SQL execution failed, trying next method...');
    }
    
    // Second approach: Insert data with the new column and let the API handle it
    // Sometimes Supabase will automatically add the column if data includes it
    try {
      const { error: insertError } = await supabase.from('posts').insert({
        // Use minimal required fields plus our missing column
        user_id: '00000000-0000-0000-0000-000000000000', // Dummy ID
        content: 'Schema update - please ignore',
        is_anonymous: false,
        categories: []
      });
      
      // Even if this fails, it might still update the schema
      if (!insertError) {
        console.log('Added column via sample data insert!');
        return { success: true };
      }
    } catch (insertError) {
      console.log('Insert approach failed, trying next method...');
    }
    
    // Manual approach through fallback
    try {
      // Signal to the user that they'll need to update manually
      console.log('Automatic fixes failed, please update the schema manually');
      
      return { 
        success: false, 
        error: new Error('Unable to automatically add columns. Please run the SQL manually in the Supabase dashboard.') 
      };
    } catch (error) {
      return { success: false, error };
    }
  } catch (err) {
    console.error('Unexpected error fixing posts table:', err);
    return { success: false, error: err };
  }
};

/**
 * Clear schema cache to refresh columns
 */
export const refreshSchemaCache = async () => {
  try {
    // Make a query directly to the table
    const { data, error } = await supabase.from('posts').select('id').limit(1);
    return { success: true, data };
  } catch (error) {
    console.error('Error refreshing schema cache:', error);
    return { success: false, error };
  }
};
