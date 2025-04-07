import React from 'react';
import { FaSave } from 'react-icons/fa';
import TagSelector from '../common/TagSelector';

const ProfileEditForm = ({ 
  profile, 
  onProfileChange, 
  onSubmit, 
  onCancel,
  updating,
  spiritualGiftOptions,
  ministryInterestOptions
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onProfileChange(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSpiritualGiftsChange = (newGifts) => {
    onProfileChange(prev => ({
      ...prev,
      spiritualGifts: newGifts
    }));
  };
  
  const handleMinistryInterestsChange = (newInterests) => {
    onProfileChange(prev => ({
      ...prev,
      ministryInterests: newInterests
    }));
  };
  
  return (
    <form onSubmit={onSubmit}>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              id="fullName"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={profile.fullName}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              name="bio"
              id="bio"
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={profile.bio}
              onChange={handleChange}
              placeholder="Share a little about yourself, your faith journey, etc."
            />
          </div>
          
          <div>
            <TagSelector
              name="spiritualGifts"
              label="Spiritual Gifts"
              tags={profile.spiritualGifts}
              onTagsChange={handleSpiritualGiftsChange}
              options={spiritualGiftOptions}
              placeholder="Select your spiritual gifts..."
            />
          </div>
          
          <div>
            <TagSelector
              name="ministryInterests"
              label="Ministry Interests"
              tags={profile.ministryInterests}
              onTagsChange={handleMinistryInterestsChange}
              options={ministryInterestOptions}
              placeholder="Select your ministry interests..."
            />
          </div>
        </div>
        
        <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updating}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
          >
            {updating ? (
              <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-white rounded-full" />
            ) : (
              <FaSave className="mr-2" />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProfileEditForm;
