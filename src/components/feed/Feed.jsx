import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Post from './Post';
import PostComposer from './PostComposer';
import { FaFilter } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Feed = ({ currentUserId, churchId }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const pageSize = 10;
  
  useEffect(() => {
    fetchPosts();
  }, [page, activeFilter, refreshTrigger, churchId]);
  
  // Get current user profile for adding to new posts
  useEffect(() => {
    if (currentUserId && user?.user_metadata) {
      const fetchCurrentUserData = async () => {
        try {
          // Save current user's name in localStorage and in usernames cache
          const fullName = user.user_metadata.full_name;
          const avatarUrl = user.user_metadata.avatar_url;
          
          if (fullName) {
            // Save to separate caches
            try {
              // For current user quick access
              localStorage.setItem('userFullName', fullName);
              if (avatarUrl) localStorage.setItem('userAvatarUrl', avatarUrl);
              
              // Update the usernames cache with this user
              const usernamesCache = JSON.parse(localStorage.getItem('usernamesCache') || '{}');
              usernamesCache[currentUserId] = fullName;
              localStorage.setItem('usernamesCache', JSON.stringify(usernamesCache));
            } catch (err) {
              console.error('Error updating localStorage cache:', err);
            }
          }
        } catch (error) {
          console.error('Error setting user metadata:', error);
        }
      };
      
      fetchCurrentUserData();
    }
  }, [currentUserId, user]);
  
  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Use the posts_with_authors view we created instead of doing a join
      let query = supabase
        .from('posts_with_authors')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      // Apply filters
      if (activeFilter === 'following' && currentUserId) {
        // Get posts from users the current user follows
        const { data: followingData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', currentUserId);
        
        const followingIds = followingData?.map(f => f.following_id) || [];
        
        if (followingIds.length === 0) {
          // If not following anyone, return empty array instead of executing query
          setHasMore(false);
          setPosts([]);
          setLoading(false);
          return; // Exit the function early
        } else {
          query = query.in('user_id', followingIds);
        }
      } else if (activeFilter === 'church' && churchId) {
        // Get posts from the user's church
        query = query.eq('church_id', churchId);
      } else if (activeFilter !== 'all') {
        // Filter by post type
        query = query.eq('post_type', activeFilter);
      }
      
      // Execute query
      const { data: viewData, error: viewError } = await query;
      
      // Handle potential error with the view
      if (viewError) {
        console.error('Error with posts_with_authors view:', viewError);
        
        // Fallback to regular posts table
        let fallbackQuery = supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1);
          
        // Apply the same filters
        if (activeFilter === 'following' && currentUserId) {
          const followingIds = followingData?.map(f => f.following_id) || [];
          fallbackQuery = fallbackQuery.in('user_id', followingIds);
        } else if (activeFilter === 'church' && churchId) {
          fallbackQuery = fallbackQuery.eq('church_id', churchId);
        } else if (activeFilter !== 'all') {
          fallbackQuery = fallbackQuery.eq('post_type', activeFilter);
        }
        
        const { data: postsData, error: postsError } = await fallbackQuery;
        
        if (postsError) throw postsError;
        
        // Determine if there are more posts to load
        setHasMore(postsData.length === pageSize);
        
        // Process the posts
        const postsWithExtra = await Promise.all(postsData.map(async (post) => {
          // For posts by other users, try to get profile information
          let fullName = 'User';
          let avatarUrl = null;
          
          if (post.user_id === currentUserId) {
            // Current user's post
            fullName = user?.user_metadata?.full_name || 'You';
            avatarUrl = user?.user_metadata?.avatar_url;
          } else {
            // Try to get from a usernames cache if we have it
            try {
              const usernamesCache = JSON.parse(localStorage.getItem('usernamesCache') || '{}');
              if (usernamesCache[post.user_id]) {
                fullName = usernamesCache[post.user_id];
              } else {
                // Try to get the name with our user lookup function
                const { data: nameData } = await supabase.rpc('get_user_full_name', {
                  user_id_param: post.user_id
                });
                
                if (nameData) {
                  fullName = nameData;
                  
                  // Save to cache for future use
                  const cache = JSON.parse(localStorage.getItem('usernamesCache') || '{}');
                  cache[post.user_id] = nameData;
                  localStorage.setItem('usernamesCache', JSON.stringify(cache));
                }
              }
            } catch (err) {
              console.log('Error fetching user data:', err);
            }
          }
          
          // Rest of post processing...
          return processPost(post, fullName, avatarUrl);
        }));
        
        updatePostsState(postsWithExtra);
        setLoading(false);
        return;
      }
      
      // If we got here, the view query succeeded
      // Determine if there are more posts to load
      setHasMore(viewData.length === pageSize);
      
      // Process the posts from the view (already has profile data)
      const postsWithExtra = await Promise.all(viewData.map(async (post) => {
        // Get profile info from the view data
        const fullName = post.full_name || 'User';
        const avatarUrl = post.avatar_url;
        
        // Update cache with this name
        if (fullName && fullName !== 'User' && post.user_id) {
          try {
            const usernamesCache = JSON.parse(localStorage.getItem('usernamesCache') || '{}');
            usernamesCache[post.user_id] = fullName;
            localStorage.setItem('usernamesCache', JSON.stringify(usernamesCache));
          } catch (err) {
            console.log('Error updating usernames cache:', err);
          }
        }
        
        // Rest of post processing...
        return processPost(post, fullName, avatarUrl);
      }));
      
      updatePostsState(postsWithExtra);
      
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to process a post with additional data
  const processPost = async (post, fullName, avatarUrl) => {
    let profile = {
      full_name: fullName,
      avatar_url: avatarUrl
    };
    
    // Get church information if church_id exists and church_name not already present
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
    const { data: reactions, error: reactionsQueryError } = await supabase
      .from('reactions')
      .select('reaction_type')
      .eq('post_id', post.id);
      
    // Process reactions to get counts per type
    const processedReactions = reactions ? 
      Array.from(reactions.reduce((acc, { reaction_type }) => {
        acc.set(reaction_type, (acc.get(reaction_type) || 0) + 1);
        return acc;
      }, new Map())).map(([reaction_type, count]) => ({ reaction_type, count })) : [];
      
    if (reactionsQueryError) {
      console.error('Error fetching reactions:', reactionsQueryError);
    }
    
    // Get comments count
    const { count: commentsCount, error: commentsError } = await supabase
      .from('comments')
      .select('id', { count: 'exact' })
      .eq('post_id', post.id);
      
    if (commentsError) {
      console.error('Error fetching comments count:', commentsError);
    }
    
    // Get user's reactions
    let userReactions = {};
    
    if (currentUserId) {
      // Check if the user has reacted to this post
      const { data: userReactionsData, error: reactionsError } = await supabase
        .from('reactions')
        .select('reaction_type')
        .eq('post_id', post.id)
        .eq('user_id', currentUserId);
        
      if (reactionsError) {
        console.error('Error fetching user reactions:', reactionsError);
      }
      
      userReactionsData?.forEach(reaction => {
        userReactions[reaction.reaction_type] = true;
      });
    }
    
    return {
      ...post,
      profile: profile,
      church: churchData,
      reactions: processedReactions || [],
      commentsCount: commentsCount || 0,
      userReactions,
      // Ensure created_at is properly formatted
      created_at: post.created_at || new Date().toISOString()
    };
  };
  
  // Helper function to update posts state
  const updatePostsState = (postsWithExtra) => {
    // On first page, replace posts; otherwise append
    if (page === 0) {
      setPosts(postsWithExtra);
    } else {
      setPosts(prev => [...prev, ...postsWithExtra]);
    }
  };
  
  const handlePostCreated = (post) => {
    // When a post is created, add it to the top of the feed with user profile info
    // This avoids having to refresh the entire feed
    if (currentUserId) {
      // Use current user info
      const newPost = {
        ...post,
        profile: { 
          full_name: user?.user_metadata?.full_name || 'You', 
          avatar_url: user?.user_metadata?.avatar_url || null 
        },
        reactions: [],
        commentsCount: 0,
        userReactions: {}
      };
      
      setPosts(prevPosts => [newPost, ...prevPosts]);
    } else {
      // Reset to first page and refresh if no user ID is available
      setPage(0);
      setRefreshTrigger(prev => prev + 1);
    }
  };
  
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };
  
  return (
    <div className="space-y-4">
      {currentUserId && <PostComposer onPostCreated={handlePostCreated} churchId={churchId} />}
      
      {/* Filter bar */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow flex items-center space-x-1 overflow-x-auto">
        <FaFilter className="text-gray-400 mr-2 flex-shrink-0" />
        
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            activeFilter === 'all'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        
        {currentUserId && (
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              activeFilter === 'following'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setActiveFilter('following')}
          >
            Following
          </button>
        )}
        
        {churchId && (
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              activeFilter === 'church'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setActiveFilter('church')}
          >
            My Church
          </button>
        )}
        
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            activeFilter === 'event'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          onClick={() => setActiveFilter('event')}
        >
          Events
        </button>
        
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            activeFilter === 'prayer'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          onClick={() => setActiveFilter('prayer')}
        >
          Prayer
        </button>
        
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            activeFilter === 'announcement'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          onClick={() => setActiveFilter('announcement')}
        >
          Announcements
        </button>
      </div>
      
      {/* Posts list */}
      {error ? (
        <div className="bg-red-100 dark:bg-red-900 p-4 rounded-md text-red-800 dark:text-red-200">
          Error loading posts: {error}
        </div>
      ) : posts.length === 0 && !loading ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No posts found</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {activeFilter === 'following' 
              ? "You're not following anyone yet, or the people you follow haven't posted anything."
              : activeFilter === 'church'
              ? "Your church doesn't have any posts yet."
              : activeFilter !== 'all'
              ? `No ${activeFilter} posts found.`
              : "There are no posts yet. Be the first to share something!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <Post key={post.id} post={post} currentUserId={currentUserId} />
          ))}
          
          {loading && (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                    <div className="space-y-1 flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                  </div>
                  <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          )}
          
          {hasMore && !loading && (
            <button
              onClick={handleLoadMore}
              className="w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md"
            >
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Feed;
