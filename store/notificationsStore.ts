import React from 'react';
import { create } from 'zustand';
import { LucideIcon } from 'lucide-react';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  icon: LucideIcon | React.ElementType;
  color: string;
  bgColor: string;
  unread: boolean;
  timestamp: number;
}

interface NotificationsState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'unread' | 'timestamp' | 'time'>) => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  unreadCount: () => number;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9),
      unread: true,
      timestamp: Date.now(),
      time: 'الآن',
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
    }));
  },
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, unread: false })),
    }));
  },
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => 
        n.id === id ? { ...n, unread: false } : n
      ),
    }));
  },
  clearAll: () => {
    set({ notifications: [] });
  },
  unreadCount: () => {
    return get().notifications.filter((n) => n.unread).length;
  },
}));
