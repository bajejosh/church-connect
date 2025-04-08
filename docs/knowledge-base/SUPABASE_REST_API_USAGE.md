# Supabase REST API Usage

## Overview

This document provides guidelines for using the Supabase REST API directly in the Church Connect application. While the Supabase JavaScript client is the preferred method for interacting with Supabase, there may be cases where direct REST API calls are needed.

## When to Use Direct REST API Calls

- When you need more fine-grained control over headers and response formats
- When implementing functionality not yet supported by the JavaScript client
- When working with custom integrations or extensions

## Known Issues and Limitations

**Important Note**: There are known issues with direct REST API calls in some versions of the Supabase client. For critical operations, use the JavaScript client's built-in methods when possible:

```javascript
// Preferred method (using JavaScript client)
const { data, error } = await supabase
  .from('songs')
  .update(songData)
  .eq('id', id)
  .select()
  .single();

// Only use direct REST API when necessary and with caution
const response = await updateRecordById('songs', id, songData);
```

## Common Headers

All Supabase REST API requests require certain headers:

```
Content-Type: application/json
apikey: [your-supabase-anon-key]
Accept: application/json
```

For authenticated requests, you also need:

```
Authorization: Bearer [user-jwt-token]
```

For write operations (POST, PATCH, PUT, DELETE), you should include:

```
Prefer: return=representation
```

This tells Supabase to return the affected records after the operation is complete.

## Using the supabaseUtils Library

The application includes a utility library (`src/utils/supabaseUtils.js`) that handles proper headers and error handling for direct REST API calls:

```javascript
import { updateRecordById } from '../utils/supabaseUtils';

// Update a song by ID - USE WITH CAUTION
try {
  const updatedSong = await updateRecordById('songs', songId, {
    title: 'New Title',
    key: 'G',
    bpm: 120
  });
  console.log('Updated song:', updatedSong);
} catch (error) {
  console.error('Error updating song:', error);
}
```

## Available Utility Functions

The supabaseUtils library provides these helper functions:

1. `supabaseRestRequest(table, method, params, data, returnType)` - Base function for all requests
2. `getRecordById(table, id, select)` - Get a record by ID
3. `updateRecordById(table, id, data)` - Update a record by ID
4. `deleteRecordById(table, id)` - Delete a record by ID
5. `insertRecord(table, data)` - Insert a new record

## Common Errors and Solutions

### 406 Not Acceptable

This error often occurs when you're making a PATCH, POST, or DELETE request without specifying the `Prefer` header. The error message "JSON object requested, multiple (or no) rows returned" indicates that your request expects a single object to be returned, but it either found none or multiple records.

**Solution**: Add the `Prefer: return=representation` header and ensure your query filters to a single record. If issues persist, use the JavaScript client directly.

### 401 Unauthorized

This typically means your API key or JWT token is missing or invalid.

**Solution**: Check that you're including the proper `apikey` header and, if needed, the `Authorization` header with a valid JWT token.

### 404 Not Found

This can mean either the endpoint doesn't exist or no records match your query.

**Solution**: Double-check your table name and query parameters.

## Best Practices

1. **Use the JavaScript client when possible**: It handles most edge cases automatically
2. **Include proper error handling**: Always catch and log errors from API calls
3. **For critical operations like PATCH/updates**: Use the JavaScript client directly
4. **Use the provided utility functions for GET operations**: They handle headers and common error scenarios
5. **Be specific with selects**: Only request the fields you need
6. **Test with GET before writing**: Verify records exist before attempting to update them
7. **Implement robust logging**: Add detailed logging to help troubleshoot API issues

## Example: Fetching a Record by ID

```javascript
import { getRecordById } from '../utils/supabaseUtils';

async function fetchSong(songId) {
  try {
    const song = await getRecordById('songs', songId);
    return song[0]; // Returns the first (and should be only) record
  } catch (error) {
    console.error('Error fetching song:', error);
    throw error;
  }
}
```

## Example: Using JavaScript Client for Updates

For updates, always use the JavaScript client:

```javascript
import { supabase } from '../lib/supabase';

async function updateSong(id, songData) {
  try {
    const { data, error } = await supabase
      .from('songs')
      .update(songData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating song:', error);
    throw error;
  }
}
```
