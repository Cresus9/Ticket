import React from 'react';
import { Bell, Check, X } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}: NotificationItemProps) {
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'bg-green-50 text-green-800';
      case 'ERROR':
        return 'bg-red-50 text-red-800';
      case 'WARNING':
        return 'bg-yellow-50 text-yellow-800';
      case 'INFO':
      default:
        return 'bg-blue-50 text-blue-800';
    }
  };

  return (
    <div className={`p-4 border rounded-lg ${
      notification.read ? 'bg-white' : getTypeStyles(notification.type)
    }`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${
          notification.read ? 'text-gray-400' : ''
        }`}>
          <Bell className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium">
            {notification.title}
          </p>
          <p className="text-sm mt-1">
            {notification.message}
          </p>
          <p className="text-xs mt-1 text-gray-500">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!notification.read && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="p-1 rounded-full hover:bg-white/50"
              title="Mark as read"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(notification.id)}
            className="p-1 rounded-full hover:bg-white/50"
            title="Delete notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}