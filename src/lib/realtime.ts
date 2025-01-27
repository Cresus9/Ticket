import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase-client';

export class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();

  joinEventRoom(eventId: string, callbacks: {
    onMessage?: (message: any) => void;
    onTyping?: (data: { user_id: string; is_typing: boolean }) => void;
    onPresence?: (data: { user_id: string; online: boolean }) => void;
  }) {
    const channelId = `event:${eventId}`;
    
    if (this.channels.has(channelId)) {
      return;
    }

    const channel = supabase.channel(channelId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'event_messages',
        filter: `event_id=eq.${eventId}`
      }, payload => {
        callbacks.onMessage?.(payload.new);
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        Object.keys(state).forEach(userId => {
          callbacks.onPresence?.({ user_id: userId, online: true });
        });
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        callbacks.onPresence?.({ user_id: key, online: true });
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        callbacks.onPresence?.({ user_id: key, online: false });
      });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        this.channels.set(channelId, channel);
      }
    });

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelId);
    };
  }

  async sendMessage(eventId: string, message: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('event_messages')
      .insert({
        event_id: eventId,
        user_id: user.id,
        message
      });

    if (error) throw error;
  }

  async setTyping(eventId: string, isTyping: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('typing_status')
      .upsert({
        event_id: eventId,
        user_id: user.id,
        is_typing: isTyping,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  leaveEventRoom(eventId: string) {
    const channelId = `event:${eventId}`;
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(channelId);
    }
  }
}

export const realtime = new RealtimeManager();