import React from 'react';
import { FaRegComment, FaHeart } from 'react-icons/fa';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Add relativeTime plugin to dayjs
dayjs.extend(relativeTime);

const PostItem = ({ post, isCurrentUser }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mb-4">
      <div className="p-4">
        <div className="flex items-center mb-3">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 mr-3">
            {post.profile.avatar_url && (
              <img 
                src={post.profile.avatar_url} 
                alt={post.profile.full_name} 
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{post.profile.full_name}</h3>
            <p className="text-sm text-gray-500">{dayjs(post.created_at).fromNow()}</p>
          </div>
        </div>
        
        <div className="mb-3">
          <p className="text-gray-800">{post.content}</p>
        </div>
        
        {post.image_url && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img 
              src={post.image_url} 
              alt="Post attachment" 
              className="w-full object-cover"
            />
          </div>
        )}
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <FaHeart className="mr-1 text-red-500" />
              {post.reaction_count || 0} likes
            </span>
            
            <span className="flex items-center">
              <FaRegComment className="mr-1" />
              {post.commentsCount || 0} comments
            </span>
          </div>
          
          {isCurrentUser && (
            <button className="text-blue-500 hover:text-blue-700">
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const PostsList = ({ posts, loading, isCurrentUser }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (posts.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <h3 className="text-gray-500 font-medium">No posts yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          {isCurrentUser ? 'Share your first post with your church community.' : 'This user has not posted anything yet.'}
        </p>
      </div>
    );
  }
  
  return (
    <div>
      {posts.map(post => (
        <PostItem 
          key={post.id} 
          post={post} 
          isCurrentUser={isCurrentUser} 
        />
      ))}
    </div>
  );
};

export default PostsList;
