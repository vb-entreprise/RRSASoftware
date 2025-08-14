import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, Notification } from '../../context/NotificationContext';
import { Info, AlertCircle, CheckCircle, AlertTriangle, X } from 'lucide-react';
import Button from '../ui/Button';

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
    onClose();
  };

  const formatDate = (timestamp: any) => {
    const date = timestamp.toDate();
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 24) {
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
        -Math.round(diffInHours),
        'hour'
      );
    }

    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-base sm:text-lg font-medium text-gray-900">Notifications</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 p-1"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      <div className="divide-y divide-gray-200 max-h-[60vh] sm:max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-3 sm:p-4 text-center text-sm text-gray-500">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-3 sm:p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="flex-shrink-0">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 break-words">
                    {notification.title}
                  </p>
                  <p className="mt-0.5 sm:mt-1 text-xs text-gray-500 break-words">
                    {notification.message}
                  </p>
                  <p className="mt-0.5 sm:mt-1 text-xs text-gray-400">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 sm:p-4 border-t border-gray-200">
        <Button
          onClick={() => {
            markAllAsRead();
            onClose();
          }}
          variant="secondary"
          className="w-full text-xs sm:text-sm py-1.5 sm:py-2"
        >
          Mark all as read
        </Button>
      </div>
    </div>
  );
};

export default NotificationPanel; 