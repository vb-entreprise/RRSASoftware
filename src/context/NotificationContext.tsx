import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  Timestamp, 
  where,
  doc,
  updateDoc,
  writeBatch,
  getDocs,
  limit
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: Timestamp;
  read: boolean;
  userId?: string;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const [error, setError] = useState<Error | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Try the optimized query first
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedNotifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];

      setNotifications(fetchedNotifications);
    } catch (error: any) {
      // If we get an index error, fall back to a simpler query
      if (error.code === 'failed-precondition' && error.message.includes('index')) {
        console.warn('Firestore index missing, using fallback query. Consider creating the index for better performance.');
        
        try {
          // Fallback: just filter by userId without ordering
          const fallbackQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', user.id)
          );
          
          const fallbackSnapshot = await getDocs(fallbackQuery);
          const fallbackNotifications = (fallbackSnapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Notification[])
            .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds) // Client-side sort
            .slice(0, 50); // Limit on client

          setNotifications(fallbackNotifications);
        } catch (fallbackError) {
          console.error('Fallback notification query also failed:', fallbackError);
          setNotifications([]); // Set empty array to prevent further errors
        }
      } else {
        console.error('Error fetching notifications:', error);
        setNotifications([]); // Set empty array to prevent further errors
      }
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      const unreadNotifications = notifications.filter(n => !n.read);
      
      unreadNotifications.forEach(notification => {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.update(notificationRef, { read: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}; 