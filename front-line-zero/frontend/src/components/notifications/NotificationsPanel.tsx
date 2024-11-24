import React, { useState } from 'react';
import { 
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  Battery,
  Drone,
  Shield,
  Radio,
  Filter,
  Loader2
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import type { Notification } from '../../services/NotificationsService';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    filterNotifications
  } = useNotifications();

  const [filter, setFilter] = useState<{
    type?: Notification['type'];
    read?: boolean;
    source?: Notification['source'];
  }>({});

  const [isFiltering, setIsFiltering] = useState(false);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="text-red-500" size={20} />;
      case 'warning':
        return <Shield className="text-orange-500" size={20} />;
      case 'info':
        return <Info className="text-blue-500" size={20} />;
      case 'success':
        return <CheckCircle2 className="text-green-500" size={20} />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const filteredNotifications = filterNotifications(filter);

  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-4 w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-indigo-600" />
          <h3 className="font-semibold text-gray-800">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-indigo-100 text-indigo-600 text-xs font-medium px-2 py-0.5 rounded-full">
              {unreadCount} New
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsFiltering(!isFiltering)}
            className={`p-1.5 rounded-md transition-colors ${
              isFiltering ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Filter size={18} />
          </button>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1.5 rounded-md"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Filters */}
      {isFiltering && (
        <div className="p-3 border-b border-gray-200 bg-gray-50 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter(prev => ({ ...prev, type: undefined }))}
              className={`px-2 py-1 rounded text-xs font-medium ${
                !filter.type ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter(prev => ({ ...prev, type: 'emergency' }))}
              className={`px-2 py-1 rounded text-xs font-medium ${
                filter.type === 'emergency' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Emergency
            </button>
            <button
              onClick={() => setFilter(prev => ({ ...prev, type: 'warning' }))}
              className={`px-2 py-1 rounded text-xs font-medium ${
                filter.type === 'warning' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Warnings
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter(prev => ({ ...prev, read: undefined }))}
              className={`px-2 py-1 rounded text-xs font-medium ${
                filter.read === undefined ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter(prev => ({ ...prev, read: false }))}
              className={`px-2 py-1 rounded text-xs font-medium ${
                filter.read === false ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Unread
            </button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell size={24} className="mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.read ? 'bg-indigo-50/50' : ''
                }`}
              >
                <div className="flex gap-3">
                  {getIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-gray-800 truncate">
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {getTimeAgo(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    {notification.actionRequired && (
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle emergency action
                            removeNotification(notification.id);
                          }}
                          className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-md 
                            hover:bg-red-200 transition-colors"
                        >
                          Take Action
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-md 
                            hover:bg-gray-200 transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredNotifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-between items-center">
          <button 
            onClick={markAllAsRead}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Mark all as read
          </button>
          <span className="text-xs text-gray-500">
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;