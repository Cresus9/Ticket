import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase-client';
import { Event } from '../types/event';
import toast from 'react-hot-toast';

interface EventContextType {
  events: Event[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  getEvent: (id: string) => Event | undefined;
  featuredEvents: Event[];
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const [eventsResponse, featuredResponse] = await Promise.all([
        supabase
          .from('events')
          .select('*, ticket_types(*)')
          .eq('status', 'PUBLISHED'),
        supabase
          .from('events')
          .select('*, ticket_types(*)')
          .eq('status', 'PUBLISHED')
          .eq('featured', true)
      ]);

      if (eventsResponse.error) throw eventsResponse.error;
      if (featuredResponse.error) throw featuredResponse.error;

      setEvents(eventsResponse.data || []);
      setFeaturedEvents(featuredResponse.data || []);
    } catch (err: any) {
      const message = err.message || 'Failed to fetch events';
      setError(message);
      toast.error(message);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEvent = (id: string) => {
    return events.find(event => event.id === id);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <EventContext.Provider
      value={{
        events,
        loading,
        error,
        fetchEvents,
        getEvent,
        featuredEvents
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}