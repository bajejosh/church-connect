import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import TagSelector from '../../common/TagSelector';

const ConnectionItem = ({ connection, currentUserId, onFollowToggle, isFollowing }) => {
  // Extract user data based on if it's a follower or following
  const userData = connection.profiles || connection;
  const userId = connection.follower_id || connection.following_id;
  
  return (
    <div className="flex items-center justify-between p-3 border-b">
      <Link to={`/profile/${userId}`} className="flex items-center">
        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 mr-3 flex-shrink-0">
          {userData.avatar_url ? (
            <img 
              src={userData.avatar_url} 
              alt={userData.full_name} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <FaUser className="text-gray-400" />
            </div>
          )}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{userData.full_name}</h3>
          {userData.church_id && (
            <p className="text-xs text-gray-500">{userData.church_name || "Church Member"}</p>
          )}
          
          {/* Display spiritual gifts or ministry interests as tags */}
          {userData.spiritual_gifts && userData.spiritual_gifts.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {userData.spiritual_gifts.slice(0, 3).map(gift => (
                <span 
                  key={gift} 
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {gift}
                </span>
              ))}
              {userData.spiritual_gifts.length > 3 && (
                <span className="text-xs text-gray-500">+{userData.spiritual_gifts.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </Link>
      
      {userId !== currentUserId && (
        <button 
          onClick={() => onFollowToggle(userId)}
          className={`flex items-center px-3 py-1 rounded-md text-sm ${
            isFollowing 
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isFollowing ? (
            <>
              <FaUserMinus className="mr-1" />
              Unfollow
            </>
          ) : (
            <>
              <FaUserPlus className="mr-1" />
              Follow
            </>
          )}
        </button>
      )}
    </div>
  );
};

const ConnectionsList = ({ 
  followers, 
  following, 
  currentUserId,
  onFollowToggle,
  activeConnectionTab = 'followers',
  onTabChange 
}) => {
  // Find who the current user is following
  const followingIds = following.map(item => item.following_id);
  
  // Filter options for finding connections
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  
  // Extract all unique spiritual gifts from connections for filter options
  const allTags = new Set();
  [...followers, ...following].forEach(item => {
    const userData = item.profiles || item;
    if (userData.spiritual_gifts && Array.isArray(userData.spiritual_gifts)) {
      userData.spiritual_gifts.forEach(tag => allTags.add(tag));
    }
    if (userData.ministry_interests && Array.isArray(userData.ministry_interests)) {
      userData.ministry_interests.forEach(tag => allTags.add(tag));
    }
  });
  
  // Filter connections based on search and tags
  const filterConnections = (connections) => {
    return connections.filter(connection => {
      const userData = connection.profiles || connection;
      
      // Filter by search term
      const nameMatch = userData.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by selected tags
      let tagsMatch = true;
      if (selectedTags.length > 0) {
        tagsMatch = false;
        const userTags = [
          ...(userData.spiritual_gifts || []), 
          ...(userData.ministry_interests || [])
        ];
        
        if (userTags.some(tag => selectedTags.includes(tag))) {
          tagsMatch = true;
        }
      }
      
      return nameMatch && tagsMatch;
    });
  };
  
  const filteredFollowers = filterConnections(followers);
  const filteredFollowing = filterConnections(following);
  
  return (
    <div className="space-y-4">
      <div className="flex space-x-4 border-b">
        <button 
          onClick={() => onTabChange('followers')}
          className={`pb-2 px-4 ${
            activeConnectionTab === 'followers' 
              ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
              : 'text-gray-500'
          }`}
        >
          Followers
        </button>
        <button 
          onClick={() => onTabChange('following')}
          className={`pb-2 px-4 ${
            activeConnectionTab === 'following' 
              ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
              : 'text-gray-500'
          }`}
        >
          Following
        </button>
      </div>
      
      {/* Search and filter */}
      <div className="space-y-3">
        <div>
          <input
            type="text"
            placeholder="Search connections..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {allTags.size > 0 && (
          <TagSelector
            tags={selectedTags}
            onTagsChange={setSelectedTags}
            options={[...allTags]}
            label="Filter by gifts & interests"
            placeholder="Filter by gifts or interests..."
          />
        )}
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {activeConnectionTab === 'followers' ? (
          filteredFollowers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm || selectedTags.length > 0 
                ? 'No followers match your filters' 
                : 'No followers yet'}
            </div>
          ) : (
            <div>
              {filteredFollowers.map(follower => (
                <ConnectionItem 
                  key={follower.follower_id} 
                  connection={follower} 
                  currentUserId={currentUserId}
                  onFollowToggle={onFollowToggle}
                  isFollowing={followingIds.includes(follower.follower_id)}
                />
              ))}
            </div>
          )
        ) : (
          filteredFollowing.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm || selectedTags.length > 0 
                ? 'No connections match your filters' 
                : 'Not following anyone yet'}
            </div>
          ) : (
            <div>
              {filteredFollowing.map(followed => (
                <ConnectionItem 
                  key={followed.following_id} 
                  connection={followed} 
                  currentUserId={currentUserId}
                  onFollowToggle={onFollowToggle}
                  isFollowing={true}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ConnectionsList;
