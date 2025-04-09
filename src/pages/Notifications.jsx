import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { FaBell, FaPray, FaHeart, FaComment, FaUserPlus } from 'react-icons/fa';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import UserAvatar from '../components/common/UserAvatar';

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime);

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        
        // Get notifications for the current user
        const { data, error } = await supabase
          .from('notifications')
          .select(`
            *,
            profiles:actor_id(full_name, avatar_url)
          `)
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (error) throw error;
        
        // Mark notifications as read
        const unreadIds = data
          .filter(notification => !notification.read)
          .map(notification => notification.id);
        
        if (unreadIds.length > 0) {
          await supabase
            .from('notifications')
            .update({ read: true })
            .in('id', unreadIds);
        }
        
        setNotifications(data || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Setup real-time subscription for new notifications
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${user.id}`,
      }, (payload) => {
        // Add the new notification to the list
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Get the appropriate icon for the notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <FaHeart className="text-red-500" />;
      case 'comment':
        return <FaComment className="text-blue-500" />;
      case 'prayer':
        return <FaPray className="text-purple-500" />;
      case 'follow':
        return <FaUserPlus className="text-green-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  // Get the notification message
  const getNotificationMessage = (notification) => {
    const actorName = notification.profiles?.full_name || 'Someone';
    
    switch (notification.type) {
      case 'like':
        return <><span className="font-medium">{actorName}</span> liked your post</>;
      case 'comment':
        return <><span className="font-medium">{actorName}</span> commented on your post</>;
      case 'prayer':
        return <><span className="font-medium">{actorName}</span> prayed for your post</>;
      case 'follow':
        return <><span className="font-medium">{actorName}</span> started following you</>;
      default:
        return <><span className="font-medium">{actorName}</span> interacted with your content</>;
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Notifications</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow animate-pulse">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="ml-3 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Notifications</h1>
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-900">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Notifications</h1>
      
      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <FaBell className="mx-auto text-4xl text-gray-400 dark:text-gray-500 mb-3" />
          <p className="text-gray-600 dark:text-gray-300">You don't have any notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-start ${
                !notification.read ? 'border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex-shrink-0 mr-3">
                <UserAvatar 
                  userId={notification.actor_id}
                  fullName={notification.profiles?.full_name}
                  avatarUrl={notification.profiles?.avatar_url}
                  size="md"
                />
              </div>
              <div className="flex-1">
                <p className="text-gray-800 dark:text-gray-200">
                  {getNotificationMessage(notification)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {dayjs(notification.created_at).fromNow()}
                  </span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    {getNotificationIcon(notification.type)}
                    <span className="ml-1 capitalize">{notification.type}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
