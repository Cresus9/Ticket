import { useState, useEffect } from 'react';
import { Event } from '../types/event';
import { eventService } from '../services/eventService';
import toast from 'react-hot-toast';

interface UseEventReturn {
  event: Event | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEvent(id: string): UseEventReturn {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getById(id);
      setEvent(data as Event);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load event details';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  return { event, loading, error, refetch: fetchEvent };
}