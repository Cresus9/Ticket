import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { CATEGORIES } from '../constants/categories';
import EventCard from '../components/EventCard';
import { useEvents } from '../context/EventContext';

export default function CategoryEvents() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { events } = useEvents();
  const [filteredEvents, setFilteredEvents] = useState(events);

  const category = CATEGORIES.find(c => c.id === categoryId);

  useEffect(() => {
    if (categoryId) {
      const filtered = events.filter(event => 
        event.categories.includes(categoryId)
      );
      setFilteredEvents(filtered);
    }
  }, [categoryId, events]);

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Category not found</h2>
        <Link to="/categories" className="mt-4 text-indigo-600 hover:text-indigo-700">
          Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/categories"
        className="mb-8 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Categories
      </Link>

      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">{category.name}</h1>
        <p className="text-gray-600">{category.description}</p>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50 p-8 text-center">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">No events found</h3>
          <p className="text-gray-600">
            There are currently no events in this category.
            Check back later or explore other categories.
          </p>
        </div>
      )}
    </div>
  );
}