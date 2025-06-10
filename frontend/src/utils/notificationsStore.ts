import { create } from 'zustand';
import brain from 'brain';

// Types for notification data
export interface Notification {
  id: string;
  userId: string;
  entityId?: string;
  type: string; // 'deadline', 'compliance', 'anomaly', etc.
  severity: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  actionRequired: boolean;
  actionLink?: string;
  createdAt: string;
  readAt?: string;
  dismissedAt?: string;
  expiresAt?: string;
  data?: Record<string, any>;
}

export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  fetchNotifications: (userId: string, entityId?: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  dismissNotification: (notificationId: string) => Promise<void>;
  dismissAll: (userId: string, type?: string) => Promise<void>;
  refreshNotifications: (userId: string, entityId?: string) => Promise<void>;
  generateDeadlineAlerts: (userId: string, entityId?: string) => Promise<void>;
  generateComplianceAlerts: (userId: string, entityId?: string) => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async (userId: string, entityId?: string) => {
    set({ isLoading: true, error: null });
    try {
      // Fetch notifications from the API
      const response = await brain.list_notifications({
        user_id: userId,
        entity_id: entityId,
        unread_only: false,
        active_only: true
      }).catch(error => {
        console.error("Network error fetching notifications:", error);
        throw error;
      });
      
      const data = await response.json();
      set({ 
        notifications: data.notifications || [], 
        unreadCount: data.unreadCount || 0,
        isLoading: false 
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      set({ 
        error: error as Error, 
        isLoading: false,
        // Keep existing notifications instead of clearing them on error
        // This prevents UI disruption when network errors occur
      });
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      const response = await brain.mark_notification_read({ notification_id: notificationId });
      const result = await response.json();
      
      if (result.success) {
        // Update local state to mark notification as read
        set(state => {
          const notifications = state.notifications.map(notif => 
            notif.id === notificationId ? { ...notif, readAt: new Date().toISOString() } : notif
          );
          
          const unreadCount = Math.max(0, state.unreadCount - 1);
          
          return { notifications, unreadCount };
        });
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      set({ error: error as Error });
    }
  },

  dismissNotification: async (notificationId: string) => {
    try {
      const response = await brain.dismiss_notification({ notification_id: notificationId });
      const result = await response.json();
      
      if (result.success) {
        // Update local state to dismiss notification
        set(state => {
          const notifications = state.notifications.map(notif => {
            if (notif.id === notificationId) {
              // If it was unread, decrease the unread count
              if (!notif.readAt) {
                set(state => ({ unreadCount: Math.max(0, state.unreadCount - 1) }));
              }
              return { ...notif, dismissedAt: new Date().toISOString(), readAt: notif.readAt || new Date().toISOString() };
            }
            return notif;
          });
          
          return { notifications };
        });
      }
    } catch (error) {
      console.error("Error dismissing notification:", error);
      set({ error: error as Error });
    }
  },

  dismissAll: async (userId: string, type?: string) => {
    try {
      const response = await brain.bulk_update_notifications({
        action: "dismiss",
        user_id: userId,
        type
      });
      const result = await response.json();
      
      if (result.success) {
        // Update all notifications of the specified type
        set(state => {
          const now = new Date().toISOString();
          const notifications = state.notifications.map(notif => {
            if ((type === undefined || notif.type === type) && !notif.dismissedAt) {
              return { 
                ...notif, 
                dismissedAt: now, 
                readAt: notif.readAt || now 
              };
            }
            return notif;
          });
          
          // Count how many were unread and are now marked as read
          const unreadCount = state.notifications.filter(n => 
            !n.readAt && !(type === undefined || n.type === type)
          ).length;
          
          return { notifications, unreadCount };
        });
      }
    } catch (error) {
      console.error("Error dismissing all notifications:", error);
      set({ error: error as Error });
    }
  },

  refreshNotifications: async (userId: string, entityId?: string) => {
    await get().fetchNotifications(userId, entityId);
  },

  generateDeadlineAlerts: async (userId: string, entityId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await brain.generate_deadline_alerts({
        user_id: userId,
        entity_id: entityId
      });
      const result = await response.json();
      
      if (result.success) {
        // Refresh the notifications list
        await get().fetchNotifications(userId, entityId);
      }
    } catch (error) {
      console.error("Error generating deadline alerts:", error);
      set({ error: error as Error, isLoading: false });
    }
  },

  generateComplianceAlerts: async (userId: string, entityId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await brain.generate_compliance_alerts({
        user_id: userId,
        entity_id: entityId
      });
      const result = await response.json();
      
      if (result.success) {
        // Refresh the notifications list
        await get().fetchNotifications(userId, entityId);
      }
    } catch (error) {
      console.error("Error generating compliance alerts:", error);
      set({ error: error as Error, isLoading: false });
    }
  }
}));
