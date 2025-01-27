import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, MapPin, Users, Edit2, Trash2, Star, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase-client';
import EventForm from '../../components/admin/events/EventForm';
import toast from 'react-hot-toast';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url: string;
  price: number;
  currency: string;
  capacity: number;
  tickets_sold: number;
  status: string;
  featured: boolean;
  categories: string[];
  ticket_types: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    available: number;
  }>;
}

export default function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('events')
        .select(`
          *,
          ticket_types (*)
        `);

      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Event status updated successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error updating event status:', error);
      toast.error('Failed to update event status');
    }
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ featured })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(featured ? 'Event marked as featured' : 'Event removed from featured');
      fetchEvents();
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast.error('Failed to update featured status');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (selectedEvent) {
        // Update existing event
        const { error: eventError } = await supabase
          .from('events')
          .update({
            title: formData.title,
            description: formData.description,
            date: formData.date,
            time: formData.time,
            location: formData.location,
            image_url: formData.imageUrl,
            price: formData.price,
            currency: formData.currency,
            capacity: formData.capacity,
            categories: formData.categories
          })
          .eq('id', selectedEvent.id);

        if (eventError) throw eventError;

        // Update ticket types
        for (const ticketType of formData.ticketTypes) {
          if (ticketType.id) {
            // Update existing ticket type
            const { error } = await supabase
              .from('ticket_types')
              .update({
                name: ticketType.name,
                description: ticketType.description,
                price: ticketType.price,
                quantity: ticketType.quantity,
                available: ticketType.quantity,
                max_per_order: ticketType.maxPerOrder
              })
              .eq('id', ticketType.id);

            if (error) throw error;
          } else {
            // Create new ticket type
            const { error } = await supabase
              .from('ticket_types')
              .insert({
                event_id: selectedEvent.id,
                name: ticketType.name,
                description: ticketType.description,
                price: ticketType.price,
                quantity: ticketType.quantity,
                available: ticketType.quantity,
                max_per_order: ticketType.maxPerOrder
              });

            if (error) throw error;
          }
        }

        toast.success('Event updated successfully');
      } else {
        // Create new event
        const { data: event, error: eventError } = await supabase
          .from('events')
          .insert({
            title: formData.title,
            description: formData.description,
            date: formData.date,
            time: formData.time,
            location: formData.location,
            image_url: formData.imageUrl,
            price: formData.price,
            currency: formData.currency,
            capacity: formData.capacity,
            categories: formData.categories,
            status: 'DRAFT'
          })
          .select()
          .single();

        if (eventError) throw eventError;

        // Create ticket types
        for (const ticketType of formData.ticketTypes) {
          const { error } = await supabase
            .from('ticket_types')
            .insert({
              event_id: event.id,
              name: ticketType.name,
              description: ticketType.description,
              price: ticketType.price,
              quantity: ticketType.quantity,
              available: ticketType.quantity,
              max_per_order: ticketType.maxPerOrder
            });

          if (error) throw error;
        }

        toast.success('Event created successfully');
      }

      setShowForm(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedEvent ? 'Edit Event' : 'Create Event'}
          </h1>
          <button
            onClick={() => {
              setShowForm(false);
              setSelectedEvent(null);
            }}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        <EventForm
          event={selectedEvent}
          onSuccess={() => {
            setShowForm(false);
            setSelectedEvent(null);
            fetchEvents();
          }}
          onCancel={() => {
            setShowForm(false);
            setSelectedEvent(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5" />
          Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Event</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date & Time</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Location</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Tickets</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{event.title}</div>
                        <div className="text-sm text-gray-500">
                          {event.currency} {event.price}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <div>
                        <div>{event.date}</div>
                        <div className="text-sm">{event.time}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={event.status}
                      onChange={(e) => handleStatusChange(event.id, e.target.value)}
                      className={`px-3 py-1 rounded-lg ${
                        event.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-800'
                          : event.status === 'DRAFT'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Users className="h-4 w-4" />
                      {event.tickets_sold} / {event.capacity}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleFeatured(event.id, !event.featured)}
                        className={`p-2 rounded-lg hover:bg-gray-100 ${
                          event.featured ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                        }`}
                        title={event.featured ? 'Remove from featured' : 'Mark as featured'}
                      >
                        <Star className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowForm(true);
                        }}
                        className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}