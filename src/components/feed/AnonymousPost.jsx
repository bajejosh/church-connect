// src/components/feed/AnonymousPost.jsx
import React from 'react';
import { FaUser } from 'react-icons/fa';

/**
 * Component to properly display anonymous post information
 * This ensures anonymous posts never show the real user information
 */
const AnonymousPostHeader = ({ post, relativeTime, formattedDate }) => {
  return (
    <div className="flex items-center">
      <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 mr-3">
        <div className="h-full w-full flex items-center justify-center">
          <FaUser className="text-gray-400" />
        </div>
      </div>
      <div className="flex flex-col">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">Anonymous</h3>
        <div className="flex flex-wrap items-center gap-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {relativeTime}
            {post.church?.name && ` • ${post.church.name}`}
          </p>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500" title={formattedDate}>
          {formattedDate}
        </p>
      </div>
    </div>
  );
};

export default AnonymousPostHeader;
