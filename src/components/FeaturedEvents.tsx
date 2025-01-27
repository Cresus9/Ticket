import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EventCard from './EventCard';
import { eventService } from '../services/eventService';
import { Loader } from 'lucide-react';

export default function FeaturedEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        setLoading(true);
        const data = await eventService.getEvents({
          status: 'PUBLISHED',
          featured: true
        });
        setEvents(data);
      } catch (err) {
        console.error('Error fetching featured events:', err);
        setError('Failed to load featured events');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEvents();
  }, []);

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="h-5 w-5 animate-spin" />
          <span>Loading events...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Events</h2>
          <Link to="/events" className="text-indigo-600 hover:text-indigo-700">
            View all events →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      </div>
    </section>
  );
}