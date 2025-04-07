import React from 'react';
import { FaChurch, FaCross, FaMusic, FaHeart } from 'react-icons/fa';

const ProfileInfo = ({ profile }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6 space-y-4">
        {/* Bio */}
        {profile.bio && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">About</h3>
            <p className="text-gray-700">{profile.bio}</p>
          </div>
        )}
        
        {/* Church Info */}
        {profile.churchName && (
          <div className="flex items-start">
            <FaChurch className="mt-1 mr-2 text-gray-500" />
            <div>
              <h3 className="font-medium text-gray-900">Church</h3>
              <p className="text-gray-700">{profile.churchName}</p>
            </div>
          </div>
        )}
        
        {/* Role */}
        {profile.role && (
          <div className="flex items-start">
            <FaCross className="mt-1 mr-2 text-gray-500" />
            <div>
              <h3 className="font-medium text-gray-900">Role</h3>
              <p className="text-gray-700">{profile.role}</p>
            </div>
          </div>
        )}
        
        {/* Spiritual Gifts */}
        {profile.spiritualGifts && profile.spiritualGifts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center">
              <FaHeart className="mr-2 text-gray-500" />
              <h3 className="font-medium text-gray-900">Spiritual Gifts</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.spiritualGifts.map(gift => (
                <span 
                  key={gift}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {gift}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Ministry Interests */}
        {profile.ministryInterests && profile.ministryInterests.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center">
              <FaMusic className="mr-2 text-gray-500" />
              <h3 className="font-medium text-gray-900">Ministry Interests</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.ministryInterests.map(interest => (
                <span 
                  key={interest}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;
