// src/components/prayer/AddPrayerModal.jsx
import { useState, useEffect } from 'react'
import { FaPlus, FaChurch, FaGlobe } from 'react-icons/fa'
import TagSelector from '../common/TagSelector'

const AddPrayerModal = ({ isOpen, onClose, onAdd, categoryOptions, currentMainScope }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isGlobalSharing, setIsGlobalSharing] = useState(currentMainScope === 'global');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Reset isGlobalSharing when the modal opens based on current tab
  useEffect(() => {
    if (isOpen) {
      setIsGlobalSharing(currentMainScope === 'global');
    }
  }, [isOpen, currentMainScope]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a title for your prayer request');
      return;
    }
    
    setLoading(true);
    try {
      await onAdd({
        title,
        description,
        isAnonymous,
        isPrivate,
        categories,
        isGlobal: isGlobalSharing // Use the toggle value instead of tab-based prop
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setIsAnonymous(false);
      setIsPrivate(false);
      setCategories([]);
      
      onClose();
    } catch (error) {
      console.error('Error adding prayer request:', error);
      alert('Failed to add prayer request');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Modal container with max height */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Fixed header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            New Prayer Request
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable content area */}
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="What would you like prayer for?"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Details
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Share more details about your prayer request..."
              />
            </div>
            
            <div>
              <TagSelector
                name="categories"
                label="Categories"
                tags={categories}
                onTagsChange={setCategories}
                options={categoryOptions}
                allowCustom={true}
                placeholder="Add categories..."
              />
            </div>
            
            {/* Sharing section with radio buttons */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3 space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Share With:
              </label>
              
              <div className="flex items-start space-x-2">
                <input
                  id="shareChurch"
                  type="radio"
                  checked={!isGlobalSharing}
                  onChange={() => setIsGlobalSharing(false)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                />
                <div>
                  <label htmlFor="shareChurch" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <FaChurch className="mr-1" /> My Church Only
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Only members of your church will see this prayer request
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <input
                  id="shareGlobal"
                  type="radio"
                  checked={isGlobalSharing}
                  onChange={() => setIsGlobalSharing(true)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                />
                <div>
                  <label htmlFor="shareGlobal" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <FaGlobe className="mr-1" /> Share Globally
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    All Church Connect users can see and pray for this request
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3">
              <div className="flex items-center">
                <input
                  id="isAnonymous"
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="isAnonymous" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Post anonymously
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="isPrivate"
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="isPrivate" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Private (only visible to church staff)
                </label>
              </div>
            </div>
          </div>
          
          {/* Fixed footer with buttons */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              >
                {loading ? (
                  <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-white rounded-full" />
                ) : (
                  <FaPlus className="mr-2" />
                )}
                Add Prayer Request
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPrayerModal;