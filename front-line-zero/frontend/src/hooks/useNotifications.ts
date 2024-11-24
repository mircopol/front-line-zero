import { useState, useEffect } from 'react';
import notificationsService, { Notification } from '../services/NotificationsService';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  filterNotifications: (options: {
    type?: Notification['type'];
    read?: boolean;
    source?: Notification['source'];
  }) => Notification[];
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>(
    notificationsService.getNotifications()
  );
  const [unreadCount, setUnreadCount] = useState<number>(
    notificationsService.getUnreadCount()
  );

  useEffect(() => {
    // Update notifications when the service emits changes
    const handleUpdate = (updatedNotifications: Notification[]) => {
      setNotifications(updatedNotifications);
      setUnreadCount(notificationsService.getUnreadCount());
    };

    // Listen for notification updates
    notificationsService.on('updated', handleUpdate);

    // Listen for new notifications to trigger sound/visual alerts
    notificationsService.on('new', (notification: Notification) => {
      // You can add sound effects or visual alerts here
      if (notification.type === 'emergency') {
        // Play emergency sound
        const audio = new Audio('/alert.mp3'); // You'll need to add this audio file
        audio.play().catch(e => console.log('Audio play failed:', e));
      }
    });

    // Cleanup listeners on unmount
    return () => {
      notificationsService.removeListener('updated', handleUpdate);
    };
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead: (id: string) => notificationsService.markAsRead(id),
    markAllAsRead: () => notificationsService.markAllAsRead(),
    removeNotification: (id: string) => notificationsService.removeNotification(id),
    clearAll: () => notificationsService.clearAllNotifications(),
    filterNotifications: (options) => notificationsService.filterNotifications(options)
  };
};

export default useNotifications;