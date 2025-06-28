import { api } from '../api';

export interface NotificationRecipient {
  id: string;
  notificationID: string;
  utilisateurID: string;
  estLu: boolean;
  dateLecture?: string;
  notification: {
    notificationID: string;
    titre: string;
    message: string;
    type?: string;
    lien?: string;
    dateCreation: string;
    createdByID: string;
    createdBy: {
      utilisateurID: string;
      nom: string;
      prenom: string;
      email: string;
    };
  };
}

export interface Notification {
  notificationID: string;
  titre: string;
  message: string;
  type?: string;
  lien?: string;
  dateCreation: string;
  estLu: boolean;
  utilisateurID: string;
  createdBy?: {
    utilisateurID: string;
    nom: string;
    prenom: string;
    email: string;
  };
}

export interface CreateNotificationDto {
  destinataires: string[];
  titre: string;
  message: string;
  type?: string;
  lien?: string;
}

class NotificationService {
  // Get all notifications for the current user
  async getNotifications(): Promise<NotificationRecipient[]> {
    const response = await api.get('/notifications');
    return response.data;
  }

  // Get last 10 notifications for the current user
  async getLastNotifications(limit: number = 10): Promise<NotificationRecipient[]> {
    const response = await api.get('/notifications');
    const notifications = response.data;
    // Limit to specified number (already ordered by dateCreation desc from backend)
    return notifications.slice(0, limit);
  }

  // Get unread notifications for the current user
  async getUnreadNotifications(): Promise<NotificationRecipient[]> {
    const response = await api.get('/notifications/unread');
    return response.data;
  }

  // Mark a notification as read
  async markAsRead(notificationId: string): Promise<NotificationRecipient> {
    try {
      const response = await api.post(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Notification not found or access denied');
      }
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ count: number }> {
    const response = await api.post('/notifications/read-all');
    return response.data;
  }

  // Delete a notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await api.delete(`/notifications/${notificationId}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Notification not found or access denied');
      }
      throw error;
    }
  }

  // Create a new notification (for testing or admin purposes)
  async createNotification(notification: CreateNotificationDto): Promise<Notification> {
    try {
      const response = await api.post('/notifications', notification);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('Unauthorized: You can only create notifications for yourself');
      }
      throw error;
    }
  }

  // Create a test notification for the current user
  async createTestNotification(): Promise<Notification> {
    const response = await api.post('/notifications/test');
    return response.data;
  }
}

export const notificationService = new NotificationService(); 