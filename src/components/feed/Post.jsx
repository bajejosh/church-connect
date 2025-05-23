import React, { useState, useEffect } from 'react';
import ImageModal from '../common/ImageModal';
import { 
  FaRegHeart, 
  FaHeart, 
  FaRegComment, 
  FaPray, 
  FaUser,
  FaEllipsisH,
  FaEdit,
  FaTrash,
  FaThumbtack
} from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import PostHeader from './PostHeader';
import { parseContentWithMedia } from '../../utils/mediaUtils';
import PostEditor from './PostEditor';
import DeleteConfirmation from '../common/DeleteConfirmation';

const Post = ({ post, currentUserId, onPostUpdated, onPostDeleted }) => {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [userReactions, setUserReactions] = useState(post.userReactions || {});
  const [authorInfo, setAuthorInfo] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isPinned, setIsPinned] = useState(post.is_pinned || false);
  const [pinningPost, setPinningPost] = useState(false);
  
  // Initialize user reactions from post data
  useEffect(() => {
    if (post.userReactions) {
      setUserReactions(post.userReactions);
    }
  }, [post.userReactions]);

  // Fetch author info if not already provided
  useEffect(() => {
    if (post.is_anonymous) return;
    
    if (post.profile?.full_name && post.profile?.full_name !== 'User') {
      setAuthorInfo(post.profile);
      return;
    }
    
    if (!post.user_id) return;
    
    try {
      const fetchAuthorInfo = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', post.user_id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setAuthorInfo(data);
        }
      };
      
      fetchAuthorInfo();
    } catch (err) {
      console.error('Error fetching author info:', err);
    }
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

  // Toggle pin status
  const togglePinStatus = async () => {
    if (!currentUserId || currentUserId !== post.user_id) return;
    
    try {
      setPinningPost(true);
      
      try {
        // Try calling the function to toggle post pin
        const { data, error } = await supabase.rpc('toggle_post_pin', {
          post_id_param: post.id,
          user_id_param: currentUserId
        });
        
        if (error) throw error;
        
        // Update the local state
        setIsPinned(data);
        
        // Update the post object
        post.is_pinned = data;
        
        // Call the callback if provided
        if (onPostUpdated) {
          onPostUpdated({...post, is_pinned: data});
        }
      } catch (functionError) {
        console.warn('Function toggle_post_pin not found. Falling back to direct update.', functionError);
        
        // Fallback: directly update the post when the function isn't available
        const newPinnedState = !isPinned;
        
        // Update in database
        const { error: updateError } = await supabase
          .from('posts')
          .update({ is_pinned: newPinnedState })
          .eq('id', post.id)
          .eq('user_id', currentUserId); // Safety check
        
        if (updateError) throw updateError;
        
        // Update the local state
        setIsPinned(newPinnedState);
        
        // Update the post object
        post.is_pinned = newPinnedState;
        
        // Call the callback if provided
        if (onPostUpdated) {
          onPostUpdated({...post, is_pinned: newPinnedState});
        }
      }
    } catch (error) {
      console.error('Error toggling pin status:', error);
    } finally {
      setPinningPost(false);
      setShowMenu(false);
    }
  };
  
  // Fetch comments when showComments is true
  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);
  
  // Handle edit post
  const handleEditPost = () => {
    setIsEditing(true);
    setShowMenu(false);
  };
  
  // Handle update after editing
  const handlePostUpdated = (updatedPost) => {
    setIsEditing(false);
    if (onPostUpdated) {
      onPostUpdated(updatedPost);
    } else {
      // If no callback provided, update the post in place
      // This requires a deep copy to ensure the UI updates
      const updatedPostCopy = JSON.parse(JSON.stringify(updatedPost));
      Object.assign(post, updatedPostCopy);
    }
  };
  
  // Handle delete post
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setShowMenu(false);
  };
  
  // Confirm delete post
  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      
      // Delete the post from the database
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);
        
      if (error) throw error;
      
      setShowDeleteConfirm(false);
      
      // Call the callback if provided
      if (onPostDeleted) {
        onPostDeleted(post.id);
      }
      
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
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
    <>
      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
          allImages={post.media_urls?.filter(url => !url.match(/\.(mp4|webm|ogg)$/i)) || []}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmation
          title="Delete Post"
          message="Are you sure you want to delete this post? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={handleCancelDelete}
        />
      )}
      
      {/* Post Editor Modal */}
      {isEditing ? (
        <PostEditor 
          post={post} 
          onPostUpdated={handlePostUpdated} 
          onCancel={handleCancelEdit} 
        />
      ) : (
        <div className={`bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-4 ${isPinned ? 'border-l-4 border-blue-500' : ''}`}>
          {/* Post header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <PostHeader 
                post={post}
                authorInfo={authorInfo}
                relativeTime={relativeTime}
                formattedDate={formattedDate}
                isEvent={isEvent}
                isPrayer={isPrayer} 
                isAnnouncement={isAnnouncement}
              />
              
              {/* Pin indicator */}
              {isPinned && (
                <div className="ml-2 flex items-center bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full" title="Pinned post">
                  <FaThumbtack className="text-blue-500 mr-1" />
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Pinned</span>
                </div>
              )}
            </div>
            
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
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                      onClick={() => setShowMenu(false)}
                    >
                      Save post
                    </button>
                    {currentUserId === post.user_id && (
                      <>
                        <button 
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                          onClick={handleEditPost}
                        >
                          <FaEdit className="mr-2" /> Edit post
                        </button>
                        <button 
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                          onClick={togglePinStatus}
                          disabled={pinningPost}
                        >
                          <FaThumbtack className="mr-2" /> {isPinned ? 'Unpin post' : 'Pin to top'}
                        </button>
                        <button 
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                          onClick={handleDeleteClick}
                        >
                          <FaTrash className="mr-2" /> Delete post
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
                {post.media_urls.map((url, i) => {
                  const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
                  return isVideo ? (
                    <video 
                      key={i}
                      src={url} 
                      className="w-full h-auto rounded-md object-cover"
                      controls 
                    />
                  ) : (
                    <img 
                      key={i} 
                      src={url} 
                      alt={`Post media ${i+1}`}
                      className="w-full h-auto rounded-md object-cover cursor-pointer"
                      onClick={() => setSelectedImage(url)}
                    />
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Post stats */}
          {(likesCount > 0 || prayerCount > 0 || post.commentsCount > 0) && (
            <div className="px-4 py-2 flex justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                {likesCount > 0 && (
                  <span className="inline-flex items-center mr-3">
                    <FaHeart className="text-red-500 mr-1" /> {likesCount}
                  </span>
                )}
                {prayerCount > 0 && (
                  <span className="inline-flex items-center">
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
          
          {/* Post actions - using a proper grid for perfect alignment */}
          <div className="px-2 py-2 grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-gray-700">
            <button 
              className={`flex items-center justify-center p-2 rounded-md ${
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
              className="flex items-center justify-center p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
              onClick={() => setShowComments(!showComments)}
            >
              <span className="inline-flex items-center">
                <FaRegComment className="mr-2" />
                Comment
              </span>
            </button>
            
            <button 
              className={`flex items-center justify-center p-2 rounded-md ${
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
      )}
    </>
  );
};

export default Post;
