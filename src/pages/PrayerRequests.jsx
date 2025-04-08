// src/pages/PrayerRequests.jsx
import { useState, useEffect } from 'react'
import { FaPlus, FaPray, FaChurch, FaGlobe, FaInfoCircle } from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// Import componentized prayer request components
import AddPrayerModal from '../components/prayer/AddPrayerModal'
import CategoryFilterDropdown from '../components/prayer/CategoryFilterDropdown'
import PrayerRequestsList from '../components/prayer/PrayerRequestsList'

const PrayerRequests = () => {
  const [prayerRequests, setPrayerRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainScope, setMainScope] = useState('global'); // 'global', 'church', 'mine'
  const [subScope, setSubScope] = useState('all'); // 'all', 'others'
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
  }, [mainScope, subScope]);
  
  const fetchPrayers = async () => {
    try {
      setLoading(true);
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('church_id')
        .eq('id', user?.id)
        .single();
      
      let queryBuilder;
      
      if (mainScope === 'mine') {
        // Fetch user's own prayer requests
        queryBuilder = supabase
          .from('prayer_requests')
          .select('*, churches:church_id(name)')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });
      } else if (mainScope === 'church' && profileData?.church_id) {
        // Fetch church-specific prayer requests
        queryBuilder = supabase
          .from('prayer_requests')
          .select('*, churches:church_id(name)')
          .eq('church_id', profileData.church_id)
          .eq('is_private', false);
          
        // Apply sub-filter for church scope
        if (subScope === 'others') {
          queryBuilder = queryBuilder.neq('user_id', user?.id);
        }
        
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
      } else {
        // Fetch global prayer requests
        queryBuilder = supabase
          .from('prayer_requests')
          .select('*, churches:church_id(name)')
          .eq('is_global', true)
          .eq('is_private', false);
          
        // Apply sub-filter for global scope
        if (subScope === 'others') {
          queryBuilder = queryBuilder.neq('user_id', user?.id);
        }
        
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
      }
      
      const { data, error } = await queryBuilder;
      
      if (error) throw error;
      
      // Process data to get church name
      const processedData = data.map(prayer => ({
        ...prayer,
        church_name: prayer.churches?.name
      }));
      
      // Extract all unique categories
      const allCategories = new Set();
      processedData.forEach(prayer => {
        if (prayer.categories && Array.isArray(prayer.categories)) {
          prayer.categories.forEach(category => allCategories.add(category));
        }
      });
      
      // Get unique user IDs to fetch profiles
      const userIds = [...new Set(
        processedData.filter(prayer => !prayer.is_anonymous)
            .map(prayer => prayer.user_id)
      )];
      
      // Initialize with existing profiles
      let profileMap = {...userProfiles};
      
      // Fetch user profiles if needed
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);
        
        if (!profilesError && profiles) {
          // Create a lookup map of user profiles
          profiles.forEach(profile => {
            profileMap[profile.id] = profile;
          });
          // Update state with the new map
          setUserProfiles(profileMap);
        }
      }
      
      // Add author name from fetched profiles - use the local profileMap
      const prayersWithAuthor = processedData.map(prayer => {
        const authorInfo = !prayer.is_anonymous && profileMap[prayer.user_id] 
          ? profileMap[prayer.user_id].full_name 
          : null;
        
        return {
          ...prayer,
          author_name: authorInfo
        };
      });
      
      setPrayerRequests(prayersWithAuthor || []);
      setAvailableCategories([...new Set([...defaultCategoryOptions, ...allCategories])]);
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
      
      // Create new prayer request
      const { data, error } = await supabase
        .from('prayer_requests')
        .insert({
          title: prayerData.title,
          description: prayerData.description,
          is_anonymous: prayerData.isAnonymous,
          is_private: prayerData.isPrivate,
          categories: prayerData.categories,
          church_id: prayerData.isGlobal ? null : profileData?.church_id,
          is_global: prayerData.isGlobal,
          user_id: user?.id,
          prayer_count: 0
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Also create a post in the Feed for this prayer request
      if (!prayerData.isPrivate) {
        const { error: postError } = await supabase
          .from('posts')
          .insert({
            content: `${prayerData.title}\n\n${prayerData.description}`,
            user_id: user?.id,
            is_anonymous: prayerData.isAnonymous,
            post_type: 'prayer',
            church_id: prayerData.isGlobal ? null : profileData?.church_id,
            is_global: prayerData.isGlobal,
            categories: prayerData.categories
          });
        
        if (postError) {
          console.error('Error creating feed post for prayer request:', postError);
        }
      }
      
      // Refetch prayers to ensure proper data synchronization
      fetchPrayers();
      
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
      // Filter by categories
      if (activeCategories.length === 0) return true;
      
      if (prayer.categories && Array.isArray(prayer.categories)) {
        return prayer.categories.some(category => activeCategories.includes(category));
      }
      
      return false;
    });
  
  return (
    <div className="space-y-4 pb-16 md:pb-0">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prayer Requests</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-sm"
          title="Add new prayer request"
        >
          <FaPlus />
        </button>
      </div>
      
      {/* Help text for Global vs My Church */}
      <div className="flex items-start rounded-md bg-blue-50 dark:bg-blue-900/20 p-3 mb-3">
        <FaInfoCircle className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <p>You can create prayer requests that are <strong>shared globally</strong> with all Church Connect users or <strong>only with members of your church</strong>.</p>
        </div>
      </div>
      
      {/* Main scope tabs (Global vs Church vs Mine) */}
      <div className="flex justify-between items-center mb-2">
        <nav className="flex w-full border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              setMainScope('global');
              setSubScope('all');
            }}
            className={`flex-1 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center justify-center ${
              mainScope === 'global'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <FaGlobe className="mr-2" /> Global
          </button>
          <button
            onClick={() => {
              setMainScope('church');
              setSubScope('all');
            }}
            className={`flex-1 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center justify-center ${
              mainScope === 'church'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <FaChurch className="mr-2" /> My Church
          </button>
          <button
            onClick={() => {
              setMainScope('mine');
              setSubScope('all');
            }}
            className={`flex-1 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center justify-center ${
              mainScope === 'mine'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <FaPray className="mr-2" /> My Requests
          </button>
        </nav>
      </div>
      
      {/* Sub-tabs for filtering (except for My Requests) */}
      {mainScope !== 'mine' && (
        <div className="flex justify-between items-center mb-4">
          <nav className="flex w-full">
            <button
              onClick={() => setSubScope('all')}
              className={`flex-1 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                subScope === 'all'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              All Requests
            </button>
            <button
              onClick={() => setSubScope('others')}
              className={`flex-1 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                subScope === 'others'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Others' Requests
            </button>
          </nav>
        </div>
      )}
      
      {/* Category filter */}
      {availableCategories.length > 0 && (
        <div className="mb-4 flex justify-end">
          <CategoryFilterDropdown
            categories={availableCategories}
            activeCategories={activeCategories}
            onChange={setActiveCategories}
          />
        </div>
      )}
      
      {/* Prayer requests list */}
      <PrayerRequestsList
        prayers={filteredPrayers}
        loading={loading}
        mainScope={mainScope}
        subScope={subScope}
        activeCategories={activeCategories}
        currentUserId={user?.id}
        onPray={handlePrayClick}
        onAddClick={() => setIsAddModalOpen(true)}
      />
      
      {/* Add Prayer Request Modal */}
      <AddPrayerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addPrayerRequest}
        categoryOptions={[...availableCategories]}
        currentMainScope={mainScope}
      />
    </div>
  );
};

export default PrayerRequests;