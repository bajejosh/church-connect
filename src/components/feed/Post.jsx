// src/components/feed/Post.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaRegHeart, 
  FaHeart, 
  FaRegComment, 
  FaPray, 
  FaUser,
  FaEllipsisH
} from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import PostHeader from './PostHeader';
import { parseContentWithMedia } from '../../utils/mediaUtils';

// Post component
const Post = ({ post, currentUserId }) => {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [userReactions, setUserReactions] = useState(post.userReactions || {});
  const [authorInfo, setAuthorInfo] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  
  // Initialize user reactions from post data
  useEffect(() => {
    if (post.userReactions) {
      setUserReactions(post.userReactions);
    }
  }, [post.userReactions]);

  // Fetch author info if not already provided
  useEffect(() => {
    const fetchAuthorInfo = async () => {
      if (post.is_anonymous) return;
      
      if (post.profile?.full_name && post.profile?.full_name !== 'User') {
        setAuthorInfo(post.profile);
        return;
      }
      
      if (!post.user_id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', post.user_id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setAuthorInfo(data);
        }
      } catch (err) {
        console.error('Error fetching author info:', err);
      }
    };
    
    fetchAuthorInfo();
  }, [post.user_id, post.is_anonymous, post.profile]);
  
  // Format the post date
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return new Date(post.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };
  
  const relativeTime = formatRelativeTime(post.created_at);
  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  // Check if it's a special post type
  const isEvent = post.post_type === 'event';
  const isPrayer = post.post_type === 'prayer';
  const isAnnouncement = post.post_type === 'announcement';
  
  // Calculate total reactions count
  const getTotalReactions = (type) => {
    const reaction = post.reactions?.find(r => r.reaction_type === type);
    return reaction ? parseInt(reaction.count) : 0;
  };
  
  const likesCount = getTotalReactions('like');
  const prayerCount = getTotalReactions('pray');
  
  // Toggle a reaction
  const toggleReaction = async (type) => {
    if (!currentUserId) return;
    
    try {
      // Call the function to toggle the reaction
      const { data, error } = await supabase.rpc('toggle_post_reaction', {
        post_id_param: post.id,
        user_id_param: currentUserId,
        reaction_type_param: type
      });
      
      if (error) throw error;
      
      // Update the local state with the new reaction status
      setUserReactions(prev => ({
        ...prev,
        [type]: data
      }));
      
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };
  
  // Fetch comments when showComments is true
  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);
  
  // Get commenter's display name
  const getCommenterName = (comment) => {
    if (!comment) return "User";
    
    // If it's the current user, use "You" or their name from localStorage
    if (comment.user_id === currentUserId) {
      const currentUserName = localStorage.getItem('userFullName');
      return currentUserName || "You";
    }
    
    // Try to get the actual name, avoiding placeholder values
    if (comment.profiles?.full_name && comment.profiles.full_name !== 'User') {
      return comment.profiles.full_name;
    }
    
    // Just "User" as fallback
    return "User";
  };
  
  // Fetch comments for the post
  const fetchComments = async () => {
    if (!post.id) return;
    
    try {
      setLoadingComments(true);
      
      // First, get the comments without trying to join with profiles
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        setComments([]);
        return;
      }
      
      // Process each comment to add user info
      const processedComments = await Promise.all(data.map(async (comment) => {
        if (!comment.user_id) {
          return {
            ...comment,
            profiles: null
          };
        }
        
        // Get user info for each comment
        try {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', comment.user_id)
            .single();
            
          return {
            ...comment,
            profiles: userProfile
          };
        } catch (err) {
          console.error('Error fetching commenter profile:', err);
          return {
            ...comment,
            profiles: null
          };
        }
      }));
      
      setComments(processedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };
  
  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !currentUserId) return;
    
    try {
      setSubmittingComment(true);
      
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          user_id: currentUserId,
          content: comment.trim()
        })
        .select();
      
      if (error) throw error;
      
      // Add new comment to the list with current user's information
      if (data && data.length > 0) {
        const newComment = {
          ...data[0],
          profiles: {
            full_name: localStorage.getItem('userFullName') || 'You',
            avatar_url: localStorage.getItem('userAvatarUrl') || null
          }
        };
        
        setComments(prev => [...prev, newComment]);
      }
      
      // Clear the comment input
      setComment('');
      
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };
  
  // Parse post content for media embeds
  const renderContentPart = (part, index) => {
    switch (part.type) {
      case 'youtube':
        return (
          <div key={`youtube-${index}`} className="aspect-w-16 aspect-h-9 mt-3 rounded-lg overflow-hidden">
            <iframe
              src={part.src}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            ></iframe>
          </div>
        );
      case 'suno':
        return (
          <div key={`suno-${index}`} className="mt-3 rounded-lg overflow-hidden">
            <iframe
              src={part.src}
              title="Suno music player"
              allow="autoplay"
              className="w-full h-24 border-0"
            ></iframe>
          </div>
        );
      case 'url':
        return (
          <a 
            key={`url-${index}`}
            href={part.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline break-all"
          >
            {part.url}
          </a>
        );
      case 'text':
      default:
        return <span key={`text-${index}`}>{part.content}</span>;
    }
  };
  
  // Render content with media
  const renderPostContent = () => {
    const contentParts = parseContentWithMedia(post.content);
    return contentParts.map((part, index) => renderContentPart(part, index));
  };
  
  // Render comment content with media
  const renderCommentContent = (commentContent, commentId) => {
    const contentParts = parseContentWithMedia(commentContent);
    return contentParts.map((part, index) => 
      renderContentPart(part, `comment-${commentId}-${index}`)
    );
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-4">
      {/* Post header */}
      <div className="p-4 flex items-center justify-between">
        <PostHeader 
          post={post}
          authorInfo={authorInfo}
          relativeTime={relativeTime}
          formattedDate={formattedDate}
          isEvent={isEvent}
          isPrayer={isPrayer} 
          isAnnouncement={isAnnouncement}
        />
        
        {/* Post menu */}
        <div className="relative ml-auto">
          <button 
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setShowMenu(!showMenu)}
          >
            <FaEllipsisH />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10">
              <div className="py-1">
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => setShowMenu(false)}
                >
                  Save post
                </button>
                {currentUserId === post.user_id && (
                  <>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => setShowMenu(false)}
                    >
                      Edit post
                    </button>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => setShowMenu(false)}
                    >
                      Delete post
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Post content */}
      <div className="p-4 pt-0">
        <div className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
          {renderPostContent()}
        </div>
        
        {/* Media if available */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className={`mt-3 grid ${post.media_urls.length > 1 ? 'grid-cols-2 gap-2' : 'grid-cols-1'}`}>
            {post.media_urls.map((url, i) => (
              <img 
                key={i} 
                src={url} 
                alt={`Post media ${i+1}`}
                className="w-full h-auto rounded-md object-cover"
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Post stats */}
      {(likesCount > 0 || prayerCount > 0 || post.commentsCount > 0) && (
        <div className="px-4 py-2 flex justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
          <div>
            {likesCount > 0 && (
              <span className="flex items-center inline-block mr-3">
                <FaHeart className="text-red-500 mr-1" /> {likesCount}
              </span>
            )}
            {prayerCount > 0 && (
              <span className="flex items-center inline-block mr-3">
                <FaPray className="text-purple-500 mr-1" /> {prayerCount}
              </span>
            )}
          </div>
          
          {post.commentsCount > 0 && (
            <button 
              className="hover:underline"
              onClick={() => setShowComments(!showComments)}
            >
              {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
            </button>
          )}
        </div>
      )}
      
      {/* Post actions - using flex justify-between instead for proper horizontal alignment */}
      <div className="px-2 py-2 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
        <button 
          className={`flex-1 flex items-center justify-center p-2 rounded-md ${
            userReactions.like ? 'text-red-500 font-medium' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          onClick={() => toggleReaction('like')}
        >
          <span className="inline-flex items-center">
            {userReactions.like ? <FaHeart className="mr-2" /> : <FaRegHeart className="mr-2" />}
            Like
          </span>
        </button>
        
        <button 
          className="flex-1 flex items-center justify-center p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
          onClick={() => setShowComments(!showComments)}
        >
          <span className="inline-flex items-center">
            <FaRegComment className="mr-2" />
            Comment
          </span>
        </button>
        
        <button 
          className={`flex-1 flex items-center justify-center p-2 rounded-md ${
            userReactions.pray ? 'text-purple-500 font-medium' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          onClick={() => toggleReaction('pray')}
        >
          <span className="inline-flex items-center">
            <FaPray className="mr-2" />
            Pray
          </span>
        </button>
      </div>
      
      {/* Comments section */}
      {showComments && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
          {/* Comment form */}
          {currentUserId && (
            <form onSubmit={handleCommentSubmit} className="mb-4 flex">
              <input
                type="text"
                placeholder="Write a comment..."
                className="flex-1 p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={submittingComment}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md disabled:opacity-50"
                disabled={!comment.trim() || submittingComment}
              >
                {submittingComment ? 'Sending...' : 'Post'}
              </button>
            </form>
          )}
          
          {/* Comments list */}
          {loadingComments ? (
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-2">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-2">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="flex space-x-3">
                  {/* User avatar */}
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                    {comment.profiles?.avatar_url ? (
                      <img 
                        src={comment.profiles.avatar_url} 
                        alt={getCommenterName(comment)} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <FaUser className="text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Comment content */}
                  <div className="flex-1">
                    <div className="bg-white dark:bg-gray-700 rounded-lg px-3 py-2 shadow-sm">
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {getCommenterName(comment)}
                      </div>
                      <div className="text-gray-800 dark:text-gray-200">
                        {renderCommentContent(comment.content, comment.id)}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-2">
                      {formatRelativeTime(comment.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Post;
