import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { 
  FaUser, 
  FaImage, 
  FaVideo,
  FaPray,
  FaCalendarAlt,
  FaBullhorn,
  FaTimes,
  FaSpinner,
  FaSave
} from 'react-icons/fa';

const PostEditor = ({ post, onPostUpdated, onCancel }) => {
  const { user } = useAuth();
  const [content, setContent] = useState(post?.content || '');
  const [postType, setPostType] = useState(post?.post_type || 'regular');
  const [media, setMedia] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);
  
  // State for existing media from the post
  const [existingMedia, setExistingMedia] = useState(post?.media_urls || []);
  
  const [uploading, setUploading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(post?.is_anonymous || false);
  const fileInputRef = useRef();
  
  // Initialize with existing post data
  useEffect(() => {
    if (post) {
      setContent(post.content || '');
      setPostType(post.post_type || 'regular');
      setIsAnonymous(post.is_anonymous || false);
      setExistingMedia(post.media_urls || []);
    }
  }, [post]);
  
  const handleContentChange = (e) => {
    setContent(e.target.value);
  };
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Only keep images and videos
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    
    // Create previews
    const newPreviews = validFiles.map(file => {
      return {
        file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'video'
      };
    });
    
    setMedia([...media, ...validFiles]);
    setMediaPreview([...mediaPreview, ...newPreviews]);
  };
  
  const removeMedia = (index) => {
    // Release object URL to prevent memory leaks
    URL.revokeObjectURL(mediaPreview[index].url);
    
    const newMedia = [...media];
    newMedia.splice(index, 1);
    
    const newPreviews = [...mediaPreview];
    newPreviews.splice(index, 1);
    
    setMedia(newMedia);
    setMediaPreview(newPreviews);
  };
  
  const removeExistingMedia = (index) => {
    const newExistingMedia = [...existingMedia];
    newExistingMedia.splice(index, 1);
    setExistingMedia(newExistingMedia);
  };
  
  const handlePostTypeChange = (type) => {
    setPostType(type);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && media.length === 0 && existingMedia.length === 0) return;
    
    try {
      setUploading(true);
      
      // Upload new media files if any
      const newMediaUrls = [];
      
      if (media.length > 0) {
        for (const file of media) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `posts/${user.id}/${fileName}`;
          
          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from('media')
            .upload(filePath, file);
          
          if (uploadError) {
            console.error('Media upload error:', uploadError);
            throw uploadError;
          }
          
          // Get public URL
          const { data } = supabase.storage
            .from('media')
            .getPublicUrl(filePath);
          
          newMediaUrls.push(data.publicUrl);
        }
      }
      
      // Combine existing media with new uploads
      const allMediaUrls = [...existingMedia, ...newMediaUrls];
      
      // Update the post
      const postData = {
        content: content.trim(),
        media_urls: allMediaUrls,
        post_type: postType,
        is_anonymous: postType === 'prayer' && isAnonymous,
        updated_at: new Date().toISOString()
      };
      
      const { data: updatedPost, error } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', post.id)
        .select()
        .single();
      
      if (error) {
        console.error('Post update error:', error);
        throw error;
      }
      
      console.log('Post updated successfully:', updatedPost);
      
      // Clean up previews to prevent memory leaks
      mediaPreview.forEach(preview => URL.revokeObjectURL(preview.url));
      
      if (onPostUpdated) {
        onPostUpdated(updatedPost);
      }
      
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post. Please try again: ' + error.message);
    } finally {
      setUploading(false);
    }
  };
  
  // Helper for post type button
  const PostTypeButton = ({ type, icon, label, active }) => (
    <button
      type="button"
      className={`flex items-center px-3 py-1.5 rounded-full text-sm ${
        active 
          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      onClick={() => handlePostTypeChange(type)}
    >
      {icon}
      <span className="ml-1">{label}</span>
    </button>
  );
  
  // Get profile data from user object
  const { avatar_url, full_name } = user?.user_metadata || {};
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Edit Post
        </h3>
        <button 
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
        >
          <FaTimes />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="p-4">
          {/* User info and text area */}
          <div className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                {avatar_url ? (
                  <img 
                    src={avatar_url} 
                    alt={full_name} 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <FaUser className="text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <textarea
                placeholder="What's on your mind?"
                className="w-full border rounded-lg p-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 dark:border-gray-700 resize-none"
                rows={4}
                value={content}
                onChange={handleContentChange}
              />
              
              {/* Existing Media previews */}
              {existingMedia.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Media
                  </h4>
                  <div className={`grid gap-2 ${existingMedia.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {existingMedia.map((url, i) => {
                      const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
                      return (
                        <div key={i} className="relative rounded-lg overflow-hidden bg-gray-100">
                          {isVideo ? (
                            <video 
                              src={url} 
                              className="w-full h-48 object-cover"
                              controls
                            />
                          ) : (
                            <img 
                              src={url} 
                              alt={`Media ${i+1}`}
                              className="w-full h-48 object-cover" 
                            />
                          )}
                          <button
                            type="button"
                            className="absolute top-2 right-2 bg-gray-900 bg-opacity-70 text-white rounded-full p-1"
                            onClick={() => removeExistingMedia(i)}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* New Media previews */}
              {mediaPreview.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Media
                  </h4>
                  <div className={`grid gap-2 ${mediaPreview.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {mediaPreview.map((item, i) => (
                      <div key={i} className="relative rounded-lg overflow-hidden bg-gray-100">
                        {item.type === 'image' ? (
                          <img 
                            src={item.url} 
                            alt={`Upload preview ${i+1}`}
                            className="w-full h-48 object-cover" 
                          />
                        ) : (
                          <video 
                            src={item.url} 
                            className="w-full h-48 object-cover"
                            controls
                          />
                        )}
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-gray-900 bg-opacity-70 text-white rounded-full p-1"
                          onClick={() => removeMedia(i)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Post types */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Post type:</span>
            
            <PostTypeButton 
              type="regular" 
              icon={<FaUser className="text-blue-500" />} 
              label="Regular"
              active={postType === 'regular'} 
            />
            
            <PostTypeButton 
              type="prayer" 
              icon={<FaPray className="text-purple-500" />} 
              label="Prayer Request"
              active={postType === 'prayer'} 
            />
            
            <PostTypeButton 
              type="event" 
              icon={<FaCalendarAlt className="text-green-500" />} 
              label="Event"
              active={postType === 'event'} 
            />
            
            {(user?.user_metadata?.role === 'admin' || user?.user_metadata?.role === 'worship_leader') && (
              <PostTypeButton 
                type="announcement" 
                icon={<FaBullhorn className="text-yellow-500" />} 
                label="Announcement"
                active={postType === 'announcement'} 
              />
            )}
          </div>
        </div>
        
        {/* Anonymous option for prayer requests */}
        {postType === 'prayer' && (
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
            <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <span>Post anonymously</span>
            </label>
          </div>
        )}
        
        <div className="px-4 py-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="flex items-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-3 py-1.5"
              onClick={() => fileInputRef.current.click()}
            >
              <FaImage className="text-green-500 mr-1.5" />
              <span className="text-sm">Add Photo</span>
            </button>
            
            <button
              type="button"
              className="flex items-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-3 py-1.5"
              onClick={() => fileInputRef.current.click()}
            >
              <FaVideo className="text-red-500 mr-1.5" />
              <span className="text-sm">Add Video</span>
            </button>
            
            <input
              type="file"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,video/*"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              type="button"
              className="px-4 py-1.5 text-sm border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={onCancel}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={uploading || (!content.trim() && media.length === 0 && existingMedia.length === 0)}
              className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {uploading ? (
                <>
                  <FaSpinner className="animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-1.5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostEditor;
