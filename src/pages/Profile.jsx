import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { FaUser, FaEdit, FaCamera, FaUserPlus, FaUserMinus, FaCrop, FaChurch } from 'react-icons/fa';
import ImageModal from '../components/common/ImageModal';
import ImagePositionEditor from '../components/profile/ImagePositionEditor';
import Post from '../components/feed/Post';

const Profile = () => {
  const { userId } = useParams();
  const { user, updateProfile } = useAuth();
  const currentUserId = user?.id;
  const targetUserId = userId || currentUserId;
  const isCurrentUser = targetUserId === currentUserId;
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showAvatarPositionEditor, setShowAvatarPositionEditor] = useState(false);
  const [showCoverPositionEditor, setShowCoverPositionEditor] = useState(false);
  const [viewProfileImage, setViewProfileImage] = useState(false);
  const [viewCoverImage, setViewCoverImage] = useState(false);
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    churchName: '',
    role: '',
    avatarUrl: '',
    coverUrl: '',
    bio: '',
    avatarPosition: { x: 50, y: 50 },
    coverPosition: { x: 50, y: 50 }
  });
  
  useEffect(() => {
    fetchProfile();
    if (currentUserId && targetUserId && !isCurrentUser) {
      checkFollowStatus();
    }
  }, [targetUserId, currentUserId]);
  
  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Get profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();
      
      if (error) throw error;
      
      // Get church data separately if church_id exists
      let churchName = '';
      if (data?.church_id) {
        const { data: churchData, error: churchError } = await supabase
          .from('churches')
          .select('name')
          .eq('id', data.church_id)
          .single();
        
        if (!churchError && churchData) {
          churchName = churchData.name;
        }
      }
      
      // Set form data with safe defaults for position-related properties
      console.log('Profile data from DB:', data);
      
      // Parse JSON strings if needed (some backends return stringified JSON)
      let avatarPosition = data?.avatar_position;
      let coverPosition = data?.cover_position;
      
      // Make sure we have valid objects
      if (typeof avatarPosition === 'string') {
        try {
          avatarPosition = JSON.parse(avatarPosition);
        } catch (e) {
          console.error('Error parsing avatar_position:', e);
          avatarPosition = null;
        }
      }
      
      if (typeof coverPosition === 'string') {
        try {
          coverPosition = JSON.parse(coverPosition);
        } catch (e) {
          console.error('Error parsing cover_position:', e);
          coverPosition = null;
        }
      }
      
      setProfileData({
        fullName: data?.full_name || '',
        email: data?.email || '',
        churchName: churchName,
        role: data?.user_role || 'member',
        avatarUrl: data?.avatar_url || '',
        coverUrl: data?.cover_url || '',
        bio: data?.bio || '',
        avatarPosition: avatarPosition || { x: 50, y: 50 },
        coverPosition: coverPosition || { x: 50, y: 50 }
      });
      
      // Fetch user's posts
      fetchUserPosts(targetUserId);
      
      // Fetch following and followers counts
      fetchFollowCounts(targetUserId);
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserPosts = async (userId) => {
    try {
      // First try to get posts from the posts_with_authors view for consistent formatting with the Feed
      let { data, error } = await supabase
        .from('posts_with_authors')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      // If there's an error with the view, fall back to the regular posts table
      if (error) {
        console.error('Error fetching from posts_with_authors:', error);
        
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (fallbackError) throw fallbackError;
        data = fallbackData;
      }
      
      // Process posts to add profile, reactions, and comments data
      if (data && data.length > 0) {
        const processedPosts = await Promise.all(data.map(async (post) => {
          // Prepare the profile data
          let profile = {
            full_name: post.full_name || profileData.fullName,
            avatar_url: post.avatar_url || profileData.avatarUrl
          };
          
          // Get church data if needed
          let churchData = null;
          if (post.church_id && !post.church_name) {
            const { data: church, error: churchError } = await supabase
              .from('churches')
              .select('name')
              .eq('id', post.church_id)
              .single();
              
            if (!churchError) {
              churchData = church;
            }
          } else if (post.church_name) {
            churchData = { name: post.church_name };
          }
          
          // Get reactions
          const { data: reactions, error: reactionsError } = await supabase
            .from('reactions')
            .select('reaction_type')
            .eq('post_id', post.id);
            
          // Process reactions to get counts per type
          const processedReactions = reactions ? 
            Array.from(reactions.reduce((acc, { reaction_type }) => {
              acc.set(reaction_type, (acc.get(reaction_type) || 0) + 1);
              return acc;
            }, new Map())).map(([reaction_type, count]) => ({ reaction_type, count })) : [];
          
          // Get comments count
          const { count: commentsCount, error: commentsError } = await supabase
            .from('comments')
            .select('id', { count: 'exact' })
            .eq('post_id', post.id);
          
          // Get user's reactions (if current user)
          let userReactions = {};
          
          if (currentUserId) {
            const { data: userReactionsData } = await supabase
              .from('reactions')
              .select('reaction_type')
              .eq('post_id', post.id)
              .eq('user_id', currentUserId);
              
            userReactionsData?.forEach(reaction => {
              userReactions[reaction.reaction_type] = true;
            });
          }
          
          return {
            ...post,
            profile,
            church: churchData,
            reactions: processedReactions || [],
            commentsCount: commentsCount || 0,
            userReactions,
            created_at: post.created_at || new Date().toISOString()
          };
        }));
        
        setPosts(processedPosts);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    }
  };
  
  const fetchFollowCounts = async (userId) => {
    try {
      // Get followers count
      const { data: followersData, error: followersError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', userId);
      
      if (!followersError) {
        setFollowers(followersData || []);
      }
      
      // Get following count
      const { data: followingData, error: followingError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);
      
      if (!followingError) {
        setFollowing(followingData || []);
      }
    } catch (error) {
      console.error('Error fetching follow counts:', error);
    }
  };
  
  const checkFollowStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .maybeSingle();
      
      if (!error) {
        setIsFollowing(!!data);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };
  
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    try {
      setUpdating(true);
      setMessage(null);
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.fullName,
          bio: profileData.bio
        })
        .eq('id', currentUserId);
      
      if (error) throw error;
      
      // Update metadata in auth if needed
      if (updateProfile) {
        await updateProfile({
          fullName: profileData.fullName
        });
      }
      
      setEditMode(false);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setUpdating(false);
    }
  };
  
  const handleAvatarChange = async (event) => {
    try {
      setUploadingAvatar(true);
      const file = event.target.files[0];
      if (!file) return;
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${currentUserId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', currentUserId);
      
      if (updateError) throw updateError;
      
      // Update local state
      setProfileData(prev => ({ ...prev, avatarUrl: data.publicUrl }));
      setMessage({ type: 'success', text: 'Profile picture updated successfully' });
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage({ type: 'error', text: 'Failed to upload avatar' });
    } finally {
      setUploadingAvatar(false);
    }
  };
  
  const handleCoverChange = async (event) => {
    try {
      setUploadingCover(true);
      const file = event.target.files[0];
      if (!file) return;
      
      const fileExt = file.name.split('.').pop();
      const filePath = `covers/${currentUserId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars') // Reusing the avatars bucket for covers
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update profile with new cover URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cover_url: data.publicUrl })
        .eq('id', currentUserId);
      
      if (updateError) throw updateError;
      
      // Update local state
      setProfileData(prev => ({ ...prev, coverUrl: data.publicUrl }));
      setMessage({ type: 'success', text: 'Cover image updated successfully' });
      
    } catch (error) {
      console.error('Error uploading cover:', error);
      setMessage({ type: 'error', text: 'Failed to upload cover image' });
    } finally {
      setUploadingCover(false);
    }
  };
  
  // Handle avatar position change
  const handleAvatarPositionChange = async (position) => {
    try {
      setMessage(null);
      
      // Since the position columns may not exist yet, we'll use a try-catch
      try {
        // Update profile with new avatar position
        console.log('Saving avatar position:', position);
        
        // Ensure position is an object with x and y properties
        const positionData = {
          x: Math.round(position.x),
          y: Math.round(position.y)
        };
        
        const { error } = await supabase
          .from('profiles')
          .update({
            avatar_position: positionData
          })
          .eq('id', currentUserId);
        
        if (error) throw error;
        
        // Update local state
        setProfileData(prev => ({
          ...prev,
          avatarPosition: position
        }));
        
        setMessage({ type: 'success', text: 'Profile picture position updated' });
        
        // Refresh profile data to ensure we have the latest
        fetchProfile();
      } catch (positionError) {
        console.error('Position column may not exist yet:', positionError);
        setMessage({ 
          type: 'error', 
          text: 'Position update feature requires running the migrations. Check NEXT_STEPS.md.'
        });
      }
    } catch (error) {
      console.error('Error updating avatar position:', error);
      setMessage({ type: 'error', text: 'Failed to update profile picture position' });
    } finally {
      setShowAvatarPositionEditor(false);
    }
  };
  
  // Handle cover position change
  const handleCoverPositionChange = async (position) => {
    try {
      setMessage(null);
      
      // Since the position columns may not exist yet, we'll use a try-catch
      try {
        // Update profile with new cover position
        console.log('Saving cover position:', position);
        
        // Ensure position is an object with x and y properties
        const positionData = {
          x: Math.round(position.x),
          y: Math.round(position.y)
        };
        
        const { error } = await supabase
          .from('profiles')
          .update({
            cover_position: positionData
          })
          .eq('id', currentUserId);
        
        if (error) throw error;
        
        // Update local state
        setProfileData(prev => ({
          ...prev,
          coverPosition: position
        }));
        
        setMessage({ type: 'success', text: 'Cover image position updated' });
        
        // Refresh profile data to ensure we have the latest
        fetchProfile();
      } catch (positionError) {
        console.error('Position column may not exist yet:', positionError);
        setMessage({ 
          type: 'error', 
          text: 'Position update feature requires running the migrations. Check NEXT_STEPS.md.'
        });
      }
    } catch (error) {
      console.error('Error updating cover position:', error);
      setMessage({ type: 'error', text: 'Failed to update cover image position' });
    } finally {
      setShowCoverPositionEditor(false);
    }
  };
  
  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', targetUserId);
        
        if (error) throw error;
        setIsFollowing(false);
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUserId,
            following_id: targetUserId
          });
        
        if (error) throw error;
        setIsFollowing(true);
      }
      
      // Refresh follower counts
      fetchFollowCounts(targetUserId);
      
    } catch (error) {
      console.error('Error toggling follow:', error);
      setMessage({
        type: 'error',
        text: 'Failed to update follow status'
      });
    }
  };
  
  // If still loading, show skeleton
  if (loading) {
    return (
      <div className="space-y-6 dark:bg-gray-900">
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }
  
  const stats = {
    posts: posts.length,
    followers: followers.length,
    following: following.length
  };
  
  return (
    <div className="space-y-6 pb-16 md:pb-0 dark:bg-gray-900 dark:text-white">
      {/* Image Modal for Profile Image */}
      {viewProfileImage && profileData.avatarUrl && (
        <ImageModal
          imageUrl={profileData.avatarUrl}
          onClose={() => setViewProfileImage(false)}
        />
      )}
      
      {/* Image Modal for Cover Image */}
      {viewCoverImage && profileData.coverUrl && (
        <ImageModal
          imageUrl={profileData.coverUrl}
          onClose={() => setViewCoverImage(false)}
        />
      )}

      {/* Cover Photo */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
        {profileData.coverUrl ? (
          <img 
            src={profileData.coverUrl} 
            alt="Cover" 
            className="w-full h-full object-cover cursor-pointer"
            style={{ 
              objectPosition: profileData.coverPosition ? 
                `${profileData.coverPosition.x}% ${profileData.coverPosition.y}%` : 
                '50% 50%' 
            }}
            onClick={() => setViewCoverImage(true)}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
        )}
        
        {/* Edit cover buttons */}
        {isCurrentUser && editMode && (
          <>
            <div className="absolute bottom-2 right-2 flex space-x-2">
              {profileData.coverUrl && (
                <button 
                  className="bg-white dark:bg-gray-800 bg-opacity-70 p-2 rounded-full hover:bg-opacity-100 transition-all"
                  onClick={() => setShowCoverPositionEditor(true)}
                  disabled={uploadingCover}
                  title="Adjust cover photo position"
                >
                  <FaCrop className="text-gray-700 dark:text-gray-300" />
                </button>
              )}
              <button 
                className="bg-white dark:bg-gray-800 bg-opacity-70 p-2 rounded-full hover:bg-opacity-100 transition-all shadow-lg"
                onClick={() => document.getElementById('cover-upload').click()}
                disabled={uploadingCover}
                title="Upload new cover photo"
              >
                <FaCamera className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>
            <input 
              type="file"
              id="cover-upload"
              onChange={handleCoverChange}
              className="hidden"
              accept="image/*"
            />
          </>
        )}
      </div>
      
      {/* Profile Header */}
      <div className="relative flex flex-col md:flex-row gap-4 -mt-16 px-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-700 p-1 shadow-lg">
            {profileData.avatarUrl ? (
              <img 
                src={profileData.avatarUrl} 
                alt={profileData.fullName} 
                className="w-full h-full rounded-full object-cover cursor-pointer"
                style={{ 
                  objectPosition: profileData.avatarPosition ? 
                    `${profileData.avatarPosition.x}% ${profileData.avatarPosition.y}%` : 
                    '50% 50%' 
                }}
                onClick={() => setViewProfileImage(true)}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <FaUser className="text-gray-400 dark:text-gray-300 text-4xl" />
              </div>
            )}
            
            {/* Edit avatar buttons */}
            {isCurrentUser && editMode && (
              <>
                <div className="absolute -bottom-2 -right-2 flex space-x-1">
                  {profileData.avatarUrl && (
                    <button 
                      className="bg-white dark:bg-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all z-10"
                      onClick={() => setShowAvatarPositionEditor(true)}
                      disabled={uploadingAvatar}
                      title="Adjust profile picture position"
                    >
                      <FaCrop className="text-gray-700 dark:text-gray-300 text-sm" />
                    </button>
                  )}
                  <button 
                    className="bg-white dark:bg-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all z-10"
                    onClick={() => document.getElementById('avatar-upload').click()}
                    disabled={uploadingAvatar}
                    title="Upload new profile picture"
                  >
                    <FaCamera className="text-gray-700 dark:text-gray-300 text-sm" />
                  </button>
                </div>
                <input 
                  type="file"
                  id="avatar-upload"
                  onChange={handleAvatarChange}
                  className="hidden"
                  accept="image/*"
                />
              </>
            )}
          </div>
        </div>
        
        {/* Profile info */}
        <div className="flex-1 pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profileData.fullName}</h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center">
                {profileData.churchName ? (
                  <>
                    <FaChurch className="mr-1 text-gray-500 dark:text-gray-400" /> 
                    {profileData.churchName} • 
                  </>
                ) : ''}
                {profileData.role === 'member' ? 'Member' : 
                profileData.role === 'admin' ? 'Administrator' : 
                profileData.role === 'worship_leader' ? 'Worship Leader' : 
                profileData.role}
              </p>
              
              {/* Bio moved here directly below role */}
              {profileData.bio ? (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line mt-2">
                  {profileData.bio}
                </p>
              ) : (
                isCurrentUser && (
                  <p className="text-gray-500 dark:text-gray-400 italic mt-2">
                    Add a bio to tell people about yourself
                  </p>
                )
              )}
            </div>
            
            <div className="mt-2 md:mt-0">
              {isCurrentUser ? (
                <button 
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-md flex items-center"
                  onClick={() => setEditMode(!editMode)}
                >
                  <FaEdit className="mr-1" /> {editMode ? 'Cancel' : 'Edit'}
                </button>
              ) : (
                <button 
                  className={`px-4 py-2 ${
                    isFollowing 
                      ? 'bg-gray-600 hover:bg-gray-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white rounded-md flex items-center`}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? (
                    <>
                      <FaUserMinus className="mr-2" /> Unfollow
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="mr-2" /> Follow
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex mt-4 gap-4 text-center">
            <div className="flex-1 p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm">
              <div className="font-bold text-gray-900 dark:text-white">{stats.posts}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
            </div>
            <div className="flex-1 p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm">
              <div className="font-bold text-gray-900 dark:text-white">{stats.followers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
            </div>
            <div className="flex-1 p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm">
              <div className="font-bold text-gray-900 dark:text-white">{stats.following}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Image Position Editors */}
      {showAvatarPositionEditor && profileData.avatarUrl && (
        <ImagePositionEditor
          imageUrl={profileData.avatarUrl}
          onSave={handleAvatarPositionChange}
          onCancel={() => setShowAvatarPositionEditor(false)}
          aspectRatio={1} // Square for avatar
          initialPosition={profileData.avatarPosition || { x: 50, y: 50 }}
        />
      )}
      
      {showCoverPositionEditor && profileData.coverUrl && (
        <ImagePositionEditor
          imageUrl={profileData.coverUrl}
          onSave={handleCoverPositionChange}
          onCancel={() => setShowCoverPositionEditor(false)}
          aspectRatio={3} // Wide for cover
          initialPosition={profileData.coverPosition || { x: 50, y: 50 }}
        />
      )}
      
      {/* Message notification */}
      {message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          message.type === 'success' 
            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
            : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
        }`}>
          {message.text}
        </div>
      )}
      
      {/* Profile Tabs - moved up before About section */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`pb-4 px-1 ${
              activeTab === 'profile'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`pb-4 px-1 ${
              activeTab === 'posts'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
        </nav>
      </div>
      
      {/* Profile Tab Content */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {isCurrentUser && editMode ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit Profile</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={profileData.bio || ''}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    rows="4"
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell others about yourself..."
                  />
                </div>
                
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">About</h2>
              <p className="text-gray-700 dark:text-gray-300">
                {profileData.fullName} is a {profileData.role} at {profileData.churchName || 'a church'}.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Posts</h2>
            {isCurrentUser && (
              <Link 
                to="/dashboard"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
          
          {posts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No posts yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <Post key={post.id} post={post} currentUserId={currentUserId} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
