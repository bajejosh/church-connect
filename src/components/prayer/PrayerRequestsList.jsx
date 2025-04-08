// src/components/prayer/PrayerRequestsList.jsx
import { FaPray, FaPlus } from 'react-icons/fa'
import PrayerRequestCard from './PrayerRequestCard'

const PrayerRequestsList = ({ 
  prayers, 
  loading, 
  mainScope, 
  subScope, 
  activeCategories,
  currentUserId,
  onPray,
  onAddClick 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (prayers.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <FaPray className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No prayer requests found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {mainScope === 'mine'
            ? 'You haven\'t created any prayer requests yet.'
            : subScope === 'others'
              ? 'No prayer requests from others found.'
              : activeCategories.length > 0
                ? 'No prayer requests matching selected categories.'
                : mainScope === 'church' 
                  ? 'No prayer requests in your church community.'
                  : 'No global prayer requests found.'}
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={onAddClick}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaPlus className="-ml-1 mr-2 h-5 w-5" />
            Add Prayer Request
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {prayers.map(prayer => (
        <PrayerRequestCard
          key={prayer.id}
          prayer={prayer}
          onPray={onPray}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
};

export default PrayerRequestsList;