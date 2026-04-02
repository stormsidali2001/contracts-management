import { create } from 'zustand';
import { Notification } from '@/features/notification/models/Notification.interface';
import { UserEvent } from '@/features/notification/models/UserEvent.interface';

interface NotificationStore {
  notifications: Notification[];
  events: UserEvent[];
  isConnected: boolean;
  isEstablishingConnection: boolean;
  setConnecting: () => void;
  setConnected: () => void;
  receiveNotification: (notification: Notification) => void;
  receiveNotifications: (notifications: Notification[]) => void;
  receiveUserEvent: (event: UserEvent) => void;
  receiveUserEvents: (events: UserEvent[]) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  events: [],
  isConnected: false,
  isEstablishingConnection: false,

  setConnecting: () => set({ isEstablishingConnection: true }),
  setConnected: () => set({ isConnected: true, isEstablishingConnection: false }),

  receiveNotification: (notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),

  receiveNotifications: (notifications) => set({ notifications }),

  receiveUserEvent: (event) =>
    set((state) => ({ events: [event, ...state.events] })),

  receiveUserEvents: (events) => set({ events }),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    })),
}));
