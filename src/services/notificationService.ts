import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Notification } from '../context/NotificationContext';

type CreateNotificationData = Omit<Notification, 'id' | 'createdAt' | 'read'>;

// Helper function to check if Firebase is configured
const checkFirebaseConnection = () => {
  if (!db) {
    console.warn('⚠️ Firebase not configured - notification will be skipped');
    throw new Error('Firebase is not configured. Please update your .env file with valid Firebase credentials.');
  }
};

class NotificationService {
  async create(data: CreateNotificationData): Promise<string> {
    try {
      checkFirebaseConnection();
      const notificationRef = await addDoc(collection(db, 'notifications'), {
        ...data,
        createdAt: Timestamp.now(),
        read: false
      });
      return notificationRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      if (error instanceof Error && error.message?.includes('Firebase is not configured')) {
        console.warn('📝 Notification skipped - Firebase not configured');
        return 'offline-notification-' + Date.now(); // Return fake ID for offline mode
      }
      throw error;
    }
  }

  // Helper methods for common notifications
  async notifyInventoryLow(itemName: string, quantity: number, userId?: string) {
    return this.create({
      title: 'Low Inventory Alert',
      message: `${itemName} is running low (${quantity} remaining)`,
      type: 'warning',
      userId,
      link: '/inventory'
    });
  }

  async notifyNewCase(caseNumber: string, animalType: string, userId?: string) {
    return this.create({
      title: 'New Case Added',
      message: `New case ${caseNumber} for ${animalType} has been registered`,
      type: 'info',
      userId,
      link: `/casepaper/${caseNumber}`
    });
  }

  async notifyCleaningDue(area: string, userId?: string) {
    return this.create({
      title: 'Cleaning Reminder',
      message: `${area} is due for cleaning`,
      type: 'warning',
      userId,
      link: '/cleaning'
    });
  }

  async notifyFeedingDue(animalId: string, feedingTime: string, userId?: string) {
    return this.create({
      title: 'Feeding Due',
      message: `Feeding time (${feedingTime}) for animal ${animalId}`,
      type: 'warning',
      userId,
      link: '/feedingrecord'
    });
  }

  async notifyPasswordChanged(userId: string) {
    return this.create({
      title: 'Password Changed',
      message: 'Your password has been successfully changed',
      type: 'success',
      userId
    });
  }

  async notifySystemUpdate(message: string) {
    return this.create({
      title: 'System Update',
      message,
      type: 'info'
    });
  }
}

export const notificationService = new NotificationService(); 