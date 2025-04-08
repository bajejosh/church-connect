// src/components/prayer/PrayerRequestCard.jsx
import { FaPray } from 'react-icons/fa'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

// Add relativeTime plugin to dayjs
dayjs.extend(relativeTime)

const PrayerRequestCard = ({ prayer, onPray, currentUserId }) => {
  const isPrayerAuthor = prayer.user_id === currentUserId;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="w-full">
            {/* Prayer title */}
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{prayer.title}</h3>
            
            {/* Author and time */}
            <div className="flex justify-between items-center mt-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {prayer.is_anonymous ? 'Anonymous' : (prayer.author_name || 'User')} • {dayjs(prayer.created_at).fromNow()}
              </p>
            </div>
            
            {/* Show church name only for non-anonymous prayers or global prayers */}
            {((!prayer.is_anonymous && prayer.church_name) || prayer.is_global) && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {prayer.is_global ? 'Global Prayer Request' : `From: ${prayer.church_name}`}
              </p>
            )}
          </div>
        </div>
        
        {/* Prayer description */}
        <div className="mt-3">
          <p className="text-gray-700 dark:text-gray-300">
            {prayer.description}
          </p>
        </div>
        
        {/* Categories */}
        {prayer.categories && prayer.categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {prayer.categories.map(category => (
              <span 
                key={category} 
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300"
              >
                {category}
              </span>
            ))}
          </div>
        )}
        
        {/* Prayer actions */}
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => onPray(prayer.id)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaPray className="mr-1" />
            I Prayed
          </button>
          
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
            <FaPray className="text-blue-500 dark:text-blue-400 mr-1" />
            <span>{prayer.prayer_count || 0} {prayer.prayer_count === 1 ? 'prayer' : 'prayers'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerRequestCard;