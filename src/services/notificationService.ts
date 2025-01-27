import { supabase } from '../lib/supabase-client';
import toast from 'react-hot-toast';

export interface NotificationPreferences {
  id?: string;
  user_id?: string;
  email: boolean;
  push: boolean;
  types: string[];
}

class NotificationService {
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences found, create default preferences
          const defaultPreferences = {
            user_id: user.id,
            email: true,
            push: false,
            types: ['EVENT_REMINDER', 'TICKET_PURCHASED', 'PRICE_CHANGE', 'EVENT_CANCELLED', 'EVENT_UPDATED']
          };

          const { error: insertError } = await supabase
            .from('notification_preferences')
            .insert(defaultPreferences);

          if (insertError) throw insertError;
          return defaultPreferences;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // If enabling push notifications, check permission first
      if (preferences.push) {
        const permission = await this.checkPushPermission();
        if (permission !== 'granted') {
          // Don't enable push if permission not granted
          preferences.push = false;
        }
      }

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  async requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      toast.error('Push notifications are not supported in your browser');
      return false;
    }

    try {
      if (Notification.permission === 'denied') {
        toast.error(
          'Push notifications are blocked. Please enable them in your browser settings.',
          { duration: 5000 }
        );
        return false;
      }

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await this.registerServiceWorker();
        return true;
      } else {
        toast.error('Push notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting push permission:', error);
      toast.error('Failed to enable push notifications');
      return false;
    }
  }

  private async checkPushPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }
}

export const notificationService = new NotificationService();