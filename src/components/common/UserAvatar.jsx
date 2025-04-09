// src/components/common/UserAvatar.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

/**
 * User avatar component that displays a profile image if available,
 * or falls back to initials in a colored circle
 */
const UserAvatar = ({ 
  userId, 
  fullName = '', 
  email = '', 
  avatarUrl = null,
  size = 'md',
  className = ''
}) => {
  const [profileImage, setProfileImage] = useState(avatarUrl)
  const [loading, setLoading] = useState(!avatarUrl && !!userId)

  // Size classes for the avatar
  const sizeClasses = {
    'sm': 'h-6 w-6 text-xs',
    'md': 'h-8 w-8 text-sm',
    'lg': 'h-10 w-10 text-base',
    'xl': 'h-12 w-12 text-lg',
    '2xl': 'h-16 w-16 text-xl',
    '3xl': 'h-24 w-24 text-2xl',
    '4xl': 'h-32 w-32 text-4xl'
  }

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId || avatarUrl) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', userId)
          .single()

        if (!error && data?.avatar_url) {
          // Store in localStorage for faster access next time
          localStorage.setItem(`userAvatarUrl:${userId}`, data.avatar_url)
          setProfileImage(data.avatar_url)
        } else if (error) {
          console.warn('Error fetching profile image:', error)
          // Try to get from localStorage if available
          const cachedAvatar = localStorage.getItem(`userAvatarUrl:${userId}`)
          if (cachedAvatar) {
            setProfileImage(cachedAvatar)
          }
        }
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    // First try to get from localStorage
    const cachedAvatar = localStorage.getItem(`userAvatarUrl:${userId}`)
    if (cachedAvatar) {
      setProfileImage(cachedAvatar)
      setLoading(false)
    } else {
      fetchProfile()
    }
  }, [userId, avatarUrl])

  // Get initial to display if no image
  const getInitial = () => {
    if (fullName && fullName.length > 0) {
      return fullName.charAt(0).toUpperCase()
    } else if (email && email.length > 0) {
      return email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const sizeClass = sizeClasses[size] || sizeClasses.md

  return (
    <div className={`rounded-full overflow-hidden flex items-center justify-center ${sizeClass} ${className}`}>
      {loading ? (
        <div className="animate-pulse bg-blue-100 dark:bg-blue-900 h-full w-full"></div>
      ) : profileImage ? (
        <img 
          src={profileImage} 
          alt={fullName || 'User'} 
          className="h-full w-full object-cover"
          onError={() => setProfileImage(null)} // Fallback if image fails to load
        />
      ) : (
        <div className="bg-blue-100 dark:bg-blue-900 flex items-center justify-center h-full w-full text-blue-600 dark:text-blue-300 font-medium">
          {getInitial()}
        </div>
      )}
    </div>
  )
}

export default UserAvatar
