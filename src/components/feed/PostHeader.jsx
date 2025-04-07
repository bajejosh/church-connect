// src/components/feed/PostHeader.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaCalendarAlt, FaPray, FaBullhorn } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';

/**
 * Component for rendering post headers, handles both anonymous and regular posts
 */
const PostHeader = ({ 
  post, 
  authorInfo, 
  relativeTime, 
  formattedDate,
  isEvent,
  isPrayer,
  isAnnouncement
}) => {
  const [fetchedAuthor, setFetchedAuthor] = useState(null);
  
  // Fetch author if not provided and not anonymous
  useEffect(() => {
    if (post.is_anonymous) return;
    if (authorInfo && authorInfo.full_name) return;
    if (post.full_name && post.full_name !== 'User') return;
    
    // Don't try to fetch if no user_id is available
    if (!post.user_id) return;
    
    const fetchAuthor = async () => {
      try {
        // Use the proper Supabase client method with .eq()
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', post.user_id)
          .single();
        
        if (error) throw error;
        
        if (data && data.full_name) {
          setFetchedAuthor(data);
        }
      } catch (err) {
        console.error('Error fetching author info:', err);
      }
    };
    
    fetchAuthor();
  }, [post.user_id, post.is_anonymous, authorInfo]);

  const getDisplayName = () => {
    // If post is marked as anonymous, always return "Anonymous"
    if (post.is_anonymous) {
      return 'Anonymous';
    }
    
    // Try to get name from various sources in order of reliability
    
    // From authorInfo prop (passed directly from Post)
    if (authorInfo?.full_name && authorInfo.full_name !== 'User') {
      return authorInfo.full_name;
    }
    
    // From our own fetched data
    if (fetchedAuthor?.full_name && fetchedAuthor.full_name !== 'User') {
      return fetchedAuthor.full_name;
    }
    
    // From post.full_name (from posts_with_authors view)
    if (post.full_name && post.full_name !== 'User') {
      return post.full_name;
    }
    
    // From post.profile
    if (post.profile?.full_name && post.profile.full_name !== 'User') {
      return post.profile.full_name;
    }
    
    // From specific author_name field
    if (post.author_name && post.author_name !== 'User') {
      return post.author_name;
    }
    
    // Current user's name for their own posts
    if (post.user_id === localStorage.getItem('userId')) {
      const currentUserName = localStorage.getItem('userFullName');
      if (currentUserName) {
        return currentUserName;
      }
    }
    
    // Last resort: just show "User"
    return "User";
  };
  
  // Get avatar URL from available sources
  const getAvatarUrl = () => {
    if (authorInfo?.avatar_url) {
      return authorInfo.avatar_url;
    }
    
    if (fetchedAuthor?.avatar_url) {
      return fetchedAuthor.avatar_url;
    }
    
    if (post.avatar_url) {
      return post.avatar_url;
    }
    
    if (post.profile?.avatar_url) {
      return post.profile.avatar_url;
    }
    
    return null;
  };

  return (
    <div className="flex items-center">
      {post.is_anonymous ? (
        // Anonymous post - no link, generic avatar
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-3">
            <div className="h-full w-full flex items-center justify-center">
              <FaUser className="text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Anonymous</h3>
            <div className="flex flex-wrap items-center gap-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {relativeTime}
                {post.church_name && ` • ${post.church_name}`}
              </p>

              {/* Post type indicators */}
              {renderPostTypeIndicator(isEvent, isPrayer, isAnnouncement)}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500" title={formattedDate}>
              {formattedDate}
            </p>
          </div>
        </div>
      ) : (
        // Regular post with link to profile
        <Link to={`/profile/${post.user_id}`} className="flex items-center">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-3">
            {getAvatarUrl() ? (
              <img 
                src={getAvatarUrl()} 
                alt={getDisplayName()} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <FaUser className="text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{getDisplayName()}</h3>
            <div className="flex flex-wrap items-center gap-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {relativeTime}
                {post.church_name && ` • ${post.church_name}`}
              </p>

              {/* Post type indicators */}
              {renderPostTypeIndicator(isEvent, isPrayer, isAnnouncement)}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500" title={formattedDate}>
              {formattedDate}
            </p>
          </div>
        </Link>
      )}
    </div>
  );
};

// Helper function to render post type indicators
const renderPostTypeIndicator = (isEvent, isPrayer, isAnnouncement) => {
  if (!isEvent && !isPrayer && !isAnnouncement) return null;
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
      isEvent ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 
      isPrayer ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' : 
      'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
    }`}>
      {isEvent && <FaCalendarAlt className="mr-1 text-xs" />}
      {isPrayer && <FaPray className="mr-1 text-xs" />}
      {isAnnouncement && <FaBullhorn className="mr-1 text-xs" />}
      {isEvent ? 'Event' : isPrayer ? 'Prayer' : 'Announcement'}
    </span>
  );
};

export default PostHeader;
