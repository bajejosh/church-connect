// src/pages/PrayerRequests.jsx
import { useState, useEffect } from 'react'
import { FaPlus, FaPray, FaHeart, FaTags } from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import TagSelector from '../components/common/TagSelector'

// Add relativeTime plugin to dayjs
dayjs.extend(relativeTime)

const AddPrayerModal = ({ isOpen, onClose, onAdd, categoryOptions }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a title for your prayer request');
      return;
    }
    
    setLoading(true);
    try {
      await onAdd({
        title,
        description,
        isAnonymous,
        isPrivate,
        categories
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setIsAnonymous(false);
      setIsPrivate(false);
      setCategories([]);
      
      onClose();
    } catch (error) {
      console.error('Error adding prayer request:', error);
      alert('Failed to add prayer request');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">New Prayer Request</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="What would you like prayer for?"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Details
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Share more details about your prayer request..."
            />
          </div>
          
          <div>
            <TagSelector
              name="categories"
              label="Categories"
              tags={categories}
              onTagsChange={setCategories}
              options={categoryOptions}
              allowCustom={true}
              placeholder="Add categories..."
            />
          </div>
          
          <div className="flex flex-col space-y-3">
            <div className="flex items-center">
              <input
                id="isAnonymous"
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isAnonymous" className="ml-2 text-sm text-gray-700">
                Post anonymously
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="isPrivate"
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPrivate" className="ml-2 text-sm text-gray-700">
                Private (only visible to church staff)
              </label>
            </div>
          </div>
          
          <div className="mt-5 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
            >
              {loading ? (
                <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-white rounded-full" />
              ) : (
                <FaPlus className="mr-2" />
              )}
              Add Prayer Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CategoryFilterDropdown = ({ categories, activeCategories, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleCategoryToggle = (category) => {
    if (activeCategories.includes(category)) {
      onChange(activeCategories.filter(c => c !== category));
    } else {
      onChange([...activeCategories, category]);
    }
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <FaTags className="mr-1" />
        Categories
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="py-1">
            {categories.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">No categories found</div>
            ) : (
              categories.map(category => (
                <div key={category} className="px-4 py-2 flex items-center">
                  <input
                    type="checkbox"
                    id={`category-${category}`}
                    checked={activeCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700">
                    {category}
                  </label>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const PrayerRequestCard = ({ prayer, onPray, currentUserId, categoryOptions }) => {
  const isPrayerAuthor = prayer.user_id === currentUserId;
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{prayer.title}</h3>
            <p className="text-sm text-gray-500">
              {prayer.is_anonymous ? 'Anonymous' : (prayer.author_name || 'User')} • {dayjs(prayer.created_at).fromNow()}
            </p>
          </div>
        </div>
        
        <div className="mt-2">
          <p className="text-gray-700">
            {prayer.description}
          </p>
        </div>
        
        {/* Categories */}
        {prayer.categories && prayer.categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {prayer.categories.map(category => (
              <span 
                key={category} 
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
              >
                {category}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => onPray(prayer.id)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaPray className="mr-1" />
            I Prayed
          </button>
          
          <div className="flex items-center text-gray-500 text-sm">
            <FaHeart className="text-red-500 mr-1" />
            <span>{prayer.prayer_count || 0} prayers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PrayerRequests = () => {
  const [prayerRequests, setPrayerRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'mine', 'others'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const { user } = useAuth();
  
  // Default prayer request categories
  const defaultCategoryOptions = [
    'Health', 'Family', 'Financial', 'Spiritual', 'Guidance',
    'Healing', 'Relationships', 'Work', 'Education', 'Emotional'
  ];
  
  useEffect(() => {
    fetchPrayers();
  }, []);
  
  const fetchPrayers = async () => {
    try {
      setLoading(true);
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('church_id')
        .eq('id', user?.id)
        .single();
      
      if (profileData?.church_id) {
        // Fetch prayer requests - removed the join that was causing errors
        const { data, error } = await supabase
          .from('prayer_requests')
          .select('*')
          .eq('church_id', profileData.church_id)
          .eq('is_private', false)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        console.log('Prayer requests data:', data);
        
        // Extract all unique categories
        const allCategories = new Set();
        data.forEach(prayer => {
          if (prayer.categories && Array.isArray(prayer.categories)) {
            prayer.categories.forEach(category => allCategories.add(category));
          }
        });
        
        // Get unique user IDs to fetch profiles
        const userIds = [...new Set(
          data.filter(prayer => !prayer.is_anonymous)
              .map(prayer => prayer.user_id)
        )];
        
        console.log('User IDs to fetch profiles for:', userIds);
        
        // Initialize with existing profiles
        let profileMap = {...userProfiles};
        
        // Fetch user profiles if needed
        if (userIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds);
          
          console.log('Fetched profiles:', profiles);
          console.log('Profiles error:', profilesError);
          
          if (!profilesError && profiles) {
            // Create a lookup map of user profiles
            profiles.forEach(profile => {
              profileMap[profile.id] = profile;
            });
            console.log('Profile map created:', profileMap);
            // Update state with the new map
            setUserProfiles(profileMap);
          }
        }
        
        // Add author name from fetched profiles - use the local profileMap
        const prayersWithAuthor = data.map(prayer => {
          const authorInfo = !prayer.is_anonymous && profileMap[prayer.user_id] 
            ? profileMap[prayer.user_id].full_name 
            : null;
          
          console.log(`Prayer ${prayer.id} author info:`, {
            is_anonymous: prayer.is_anonymous,
            user_id: prayer.user_id,
            profile_found: profileMap[prayer.user_id] ? true : false,
            author_name: authorInfo
          });
          
          return {
            ...prayer,
            author_name: authorInfo
          };
        });
        
        setPrayerRequests(prayersWithAuthor || []);
        setAvailableCategories([...allCategories]);
      }
    } catch (error) {
      console.error('Error fetching prayer requests:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const addPrayerRequest = async (prayerData) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('church_id, full_name')
        .eq('id', user?.id)
        .single();
      
      console.log('Profile data for new prayer request:', profileData);
      
      // Create new prayer request
      const { data, error } = await supabase
        .from('prayer_requests')
        .insert({
          title: prayerData.title,
          description: prayerData.description,
          is_anonymous: prayerData.isAnonymous,
          is_private: prayerData.isPrivate,
          categories: prayerData.categories,
          church_id: profileData?.church_id,
          user_id: user?.id,
          prayer_count: 0
        })
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('New prayer request created:', data);
      
      // If we have profile data and the prayer isn't anonymous, we can add it directly to the state
      // with author information without having to refetch everything
      if (data && !prayerData.isAnonymous && profileData?.full_name) {
        // Add to local state with author name
        const newPrayerWithAuthor = {
          ...data,
          author_name: profileData.full_name
        };
        
        console.log('Adding new prayer with author to state:', newPrayerWithAuthor);
        
        // Update state with the new prayer
        setPrayerRequests(prev => [newPrayerWithAuthor, ...prev]);
      } else {
        // Otherwise refetch all prayers to ensure proper data synchronization
        console.log('Refetching all prayers after creation');
        fetchPrayers();
      }
    } catch (error) {
      console.error('Error adding prayer request:', error);
      throw error;
    }
  };
  
  const handlePrayClick = async (prayerId) => {
    try {
      // Get current prayer count
      const { data, error: getError } = await supabase
        .from('prayer_requests')
        .select('prayer_count')
        .eq('id', prayerId)
        .single();
      
      if (getError) throw getError;
      
      // Increment prayer count
      const { error: updateError } = await supabase
        .from('prayer_requests')
        .update({ prayer_count: (data.prayer_count || 0) + 1 })
        .eq('id', prayerId);
      
      if (updateError) throw updateError;
      
      // Update local state
      setPrayerRequests(prayers => 
        prayers.map(prayer => 
          prayer.id === prayerId 
            ? { ...prayer, prayer_count: (prayer.prayer_count || 0) + 1 } 
            : prayer
        )
      );
      
    } catch (error) {
      console.error('Error recording prayer:', error);
      alert('Failed to record your prayer');
    }
  };
  
  // Filter prayer requests
  const filteredPrayers = prayerRequests
    .filter(prayer => {
      // Filter by ownership
      if (filter === 'all') return true;
      if (filter === 'mine') return prayer.user_id === user?.id;
      if (filter === 'others') return prayer.user_id !== user?.id;
      return true;
    })
    .filter(prayer => {
      // Filter by categories
      if (activeCategories.length === 0) return true;
      
      if (prayer.categories && Array.isArray(prayer.categories)) {
        return prayer.categories.some(category => activeCategories.includes(category));
      }
      
      return false;
    });
  
  return (
    <div className="space-y-4 pb-16 md:pb-0">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Prayer Requests</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-sm"
          title="Add new prayer request"
        >
          <FaPlus />
        </button>
      </div>
      
      {/* Filter tabs */}
      <div className="flex justify-between items-center border-b border-gray-200">
        <nav className="-mb-px flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              filter === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Requests
          </button>
          <button
            onClick={() => setFilter('mine')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              filter === 'mine'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Requests
          </button>
          <button
            onClick={() => setFilter('others')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              filter === 'others'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Others' Requests
          </button>
        </nav>
        
        {/* Category filter */}
        {availableCategories.length > 0 && (
          <CategoryFilterDropdown
            categories={availableCategories}
            activeCategories={activeCategories}
            onChange={setActiveCategories}
          />
        )}
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Prayer requests list */}
      {!loading && (
        <div className="space-y-4">
          {filteredPrayers.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <FaPray className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No prayer requests found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter !== 'all'
                  ? `No ${filter === 'mine' ? 'personal' : 'others'} prayer requests found.`
                  : activeCategories.length > 0
                    ? 'No prayer requests matching selected categories.'
                    : 'Share your first prayer request with your church community.'}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaPlus className="-ml-1 mr-2 h-5 w-5" />
                  Add Prayer Request
                </button>
              </div>
            </div>
          ) : (
            filteredPrayers.map(prayer => (
              <PrayerRequestCard
                key={prayer.id}
                prayer={prayer}
                onPray={handlePrayClick}
                currentUserId={user?.id}
              />
            ))
          )}
        </div>
      )}
      
      {/* Add Prayer Request Modal */}
      <AddPrayerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addPrayerRequest}
        categoryOptions={[...new Set([...defaultCategoryOptions, ...availableCategories])]}
      />
    </div>
  );
};

export default PrayerRequests;
