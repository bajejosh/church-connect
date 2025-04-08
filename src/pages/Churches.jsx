// src/pages/Churches.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaChurch, FaPlus, FaSpinner, FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';

const Churches = () => {
  // Get authentication state with safe defaults
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [currentChurch, setCurrentChurch] = useState(null);
  const [churchChecked, setChurchChecked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [churches, setChurches] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Create church state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChurch, setNewChurch] = useState({
    name: '',
    location: '',
    description: ''
  });
  const [creating, setCreating] = useState(false);
  
  // First useEffect: Handle authentication state
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log("Churches page: User not authenticated, redirecting to login");
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);
  
  // Second useEffect: Check if user already has a church, but only after authentication is confirmed
  useEffect(() => {
    const checkUserChurch = async () => {
      // Only proceed if user is authenticated and we haven't checked yet
      if (!user || churchChecked) {
        return;
      }
      
      console.log("Churches page: Checking if user has a church");
      
      try {
        // First try to get from localStorage for quicker response
        const localChurchId = localStorage.getItem('userChurchId');
        
        if (localChurchId) {
          // User already has a church, get details but don't redirect
          console.log("Churches page: Found church ID in localStorage:", localChurchId);
          const { data: church } = await supabase
            .from('churches')
            .select('*')
            .eq('id', localChurchId)
            .single();
            
          if (church) {
            console.log("Churches page: Confirmed church in database:", church.name);
            setCurrentChurch(church);
            setChurchChecked(true);
            return;
          } else {
            console.log("Churches page: Church not found in database, removing from localStorage");
            localStorage.removeItem('userChurchId');
          }
        }
        
        // If not in localStorage or church not found, check profile
        console.log("Churches page: Checking profile for church_id");
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('church_id')
          .eq('id', user.id)
          .single();
          
        if (!error && profile?.church_id) {
          // User already has a church, get details but don't redirect
          console.log("Churches page: Found church_id in profile:", profile.church_id);
          localStorage.setItem('userChurchId', profile.church_id);
          
          const { data: church } = await supabase
            .from('churches')
            .select('*')
            .eq('id', profile.church_id)
            .single();
            
          if (church) {
            setCurrentChurch(church);
          }
        }
        
        setChurchChecked(true);
      } catch (error) {
        console.error('Error checking user church:', error);
        setChurchChecked(true);
      }
    };
    
    // Only run check if user is authenticated
    if (isAuthenticated && user) {
      checkUserChurch();
    }
  }, [user, navigate, isAuthenticated, churchChecked]);
  
  // Handle leaving current church
  const handleLeaveChurch = async () => {
    if (!user || !currentChurch) {
      return;
    }
    
    // Ask for confirmation
    const confirmed = window.confirm(`Are you sure you want to leave ${currentChurch.name}?`);
    if (!confirmed) {
      return;
    }
    
    setLeaving(true);
    setError(null);
    
    try {
      // Update user's profile to remove church_id
      const { error } = await supabase
        .from('profiles')
        .update({ church_id: null })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Remove from localStorage
      localStorage.removeItem('userChurchId');
      
      // Show success message
      alert(`You've successfully left ${currentChurch.name}.`);
      
      // Update local state
      setCurrentChurch(null);
    } catch (error) {
      console.error('Error leaving church:', error);
      setError('Failed to leave church. Please try again.');
    } finally {
      setLeaving(false);
    }
  };
  
  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('churches')
        .select('*');
      
      // Search by name
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setChurches(data || []);
      setSearchPerformed(true);
    } catch (error) {
      console.error('Error searching churches:', error);
      setError('Failed to search churches. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };
  
  // Handle join church
  const handleJoinChurch = async (churchId) => {
    if (!user) {
      setError('You need to be logged in to join a church.');
      return;
    }
    
    setJoining(true);
    setError(null);
    
    try {
      // Get church details to show in confirmation
      const { data: church, error: churchError } = await supabase
        .from('churches')
        .select('name')
        .eq('id', churchId)
        .single();
      
      if (churchError) throw churchError;
      
      // If user is already in a church, confirm they want to switch
      if (currentChurch) {
        const confirmed = window.confirm(`You're currently a member of ${currentChurch.name}. Do you want to switch to ${church.name}?`);
        if (!confirmed) {
          setJoining(false);
          return;
        }
      }
      
      // Update user's profile with the church ID
      const { error } = await supabase
        .from('profiles')
        .update({ church_id: churchId })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Save in localStorage for immediate use
      localStorage.setItem('userChurchId', churchId);
      
      // Show success message before redirecting
      setError(null);
      alert(`You've successfully joined ${church.name}!`);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error joining church:', error);
      setError('Failed to join church. Please try again.');
      setJoining(false);
    }
  };
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewChurch({ ...newChurch, [name]: value });
  };
  
  // Handle create church
  const handleCreateChurch = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You need to be logged in to create a church.');
      return;
    }
    
    if (!newChurch.name) {
      setError('Church name is required');
      return;
    }
    
    // If user is already in a church, confirm they want to create a new one
    if (currentChurch) {
      const confirmed = window.confirm(`You're currently a member of ${currentChurch.name}. Do you want to create and join a new church?`);
      if (!confirmed) {
        return;
      }
    }
    
    setCreating(true);
    setError(null);
    
    try {
      // Set user as admin since they're creating the church
      const userRole = 'admin';
    
      // Create new church
      const { data: churchData, error: churchError } = await supabase
        .from('churches')
        .insert([
          {
            name: newChurch.name,
            location: newChurch.location,
            description: newChurch.description,
            created_by: user.id
          }
        ])
        .select()
        .single();
      
      if (churchError) throw churchError;
      
      // Update user's profile with the new church ID and admin role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          church_id: churchData.id,
          user_role: userRole
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      // Save in localStorage for immediate use
      localStorage.setItem('userChurchId', churchData.id);
      
      // Show success message before redirecting
      setError(null);
      alert(`You've successfully created ${churchData.name}!`);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating church:', error);
      setError('Failed to create church. Please try again.');
    } finally {
      setCreating(false);
    }
  };
  
  // Show loading indicator while authentication is being checked
  if (loading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Show loading indicator while checking if user has a church
  if (!churchChecked && user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Checking church membership...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 dark:text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Find or Create a Church</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
        >
          <FaArrowLeft className="mr-1" />
          Back to Dashboard
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900 dark:border-red-700 dark:text-red-200">
          {error}
        </div>
      )}
      
      {/* Current Church Status */}
      {currentChurch && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-300">Your Current Church</h2>
              <p className="text-blue-600 dark:text-blue-200 font-medium">{currentChurch.name}</p>
              {currentChurch.location && (
                <p className="text-blue-600 dark:text-blue-200 text-sm">{currentChurch.location}</p>
              )}
            </div>
            <button
              onClick={handleLeaveChurch}
              disabled={leaving}
              className="flex items-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              {leaving ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaSignOutAlt className="mr-2" />
              )}
              Leave Church
            </button>
          </div>
          <p className="text-sm text-blue-600 dark:text-blue-200 mt-2">
            You can browse other churches below if you'd like to switch churches.
          </p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">Search for your church</h2>
          <p className="text-gray-600 text-sm mt-1 dark:text-gray-300">
            Enter the name of your church to find and join it
          </p>
        </div>
        
        <div className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search by church name"
                className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
              disabled={searchLoading}
            >
              {searchLoading ? <FaSpinner className="animate-spin" /> : 'Search'}
            </button>
          </form>
          
          {searchPerformed && (
            <div className="mt-4">
              {churches.length === 0 ? (
                <div className="text-center py-6">
                  <FaChurch className="text-gray-400 dark:text-gray-500 text-4xl mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-300">No churches found matching "{searchQuery}"</p>
                  <button
                    className="mt-4 text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center mx-auto dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={() => setShowCreateForm(true)}
                  >
                    <FaPlus className="mr-1" />
                    Create your church
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2 dark:text-gray-300">
                    {churches.length} {churches.length === 1 ? 'church' : 'churches'} found
                  </h3>
                  <div className="space-y-3">
                    {churches.map((church) => (
                      <div key={church.id} className="border rounded-md p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{church.name}</h4>
                            {church.location && (
                              <div className="text-gray-600 text-sm dark:text-gray-400">
                                {church.location}
                              </div>
                            )}
                          </div>
                          <button
                            className={`px-3 py-1 text-white text-sm rounded focus:outline-none focus:ring-2 disabled:opacity-50 ${
                              currentChurch && currentChurch.id === church.id
                                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                            }`}
                            onClick={() => handleJoinChurch(church.id)}
                            disabled={joining || (currentChurch && currentChurch.id === church.id)}
                          >
                            {joining ? 'Joining...' : currentChurch && currentChurch.id === church.id ? 'Current Church' : 'Join'}
                          </button>
                        </div>
                        {church.description && (
                          <div className="mt-1 text-sm text-gray-500 line-clamp-2 dark:text-gray-400">
                            {church.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-gray-600 text-sm dark:text-gray-300">
                      Don't see your church?
                    </p>
                    <button
                      className="mt-1 text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center mx-auto dark:text-blue-400 dark:hover:text-blue-300"
                      onClick={() => setShowCreateForm(true)}
                    >
                      <FaPlus className="mr-1" />
                      Create your church
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Create Church Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="p-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold dark:text-white">Create a new church</h2>
            <p className="text-gray-600 text-sm mt-1 dark:text-gray-300">
              Fill out the form below to create your church
            </p>
          </div>
          
          <div className="p-4">
            <form onSubmit={handleCreateChurch}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Church Name <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={newChurch.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:placeholder-gray-400"
                    value={newChurch.location}
                    onChange={handleInputChange}
                    placeholder="City, State or full address"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:placeholder-gray-400"
                    value={newChurch.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of your church"
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Church'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Churches;
