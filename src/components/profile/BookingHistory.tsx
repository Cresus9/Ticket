import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, Calendar, MapPin, Clock, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase-client';
import { generatePDF } from '../../utils/ticketService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface Booking {
  id: string;
  total: number;
  status: string;
  created_at: string;
  event_title: string;
  event_date: string;
  event_time: string;
  event_location: string;
  event_currency: string;
  ticket_count: number;
  tickets: Array<{
    id: string;
    ticket_type_name: string;
    ticket_type_price: number;
  }>;
}

export default function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [downloadingTicket, setDownloadingTicket] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchBookings();
    }
  }, [user?.id]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('order_details')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load booking history');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = async (booking: Booking) => {
    if (!booking.tickets || booking.tickets.length === 0) {
      toast.error('No tickets found for this booking');
      return;
    }

    try {
      setDownloadingTicket(booking.id);
      const ticketElement = document.getElementById(`ticket-${booking.id}`);
      if (!ticketElement) {
        throw new Error('Ticket element not found');
      }

      const pdfBlob = await generatePDF(ticketElement);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${booking.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Ticket downloaded successfully');
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toast.error('Failed to download ticket');
    } finally {
      setDownloadingTicket(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h2>
        <p className="text-gray-600 mb-4">You haven't made any bookings yet.</p>
        <Link
          to="/events"
          className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Browse Events
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
      
      {bookings.map((booking) => (
        <div 
          key={booking.id}
          id={`ticket-${booking.id}`}
          className="bg-white border border-gray-200 rounded-lg overflow-hidden"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {booking.event_title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(booking.event_date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {booking.event_time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {booking.event_location}
                  </span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                booking.status === 'COMPLETED' 
                  ? 'bg-green-100 text-green-800'
                  : booking.status === 'PENDING'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {booking.status}
              </span>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {booking.event_currency} {booking.total}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {booking.ticket_count} ticket{booking.ticket_count !== 1 ? 's' : ''}
                  </p>
                  {booking.tickets && booking.tickets.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      {booking.tickets.map((ticket, index) => (
                        <div key={ticket.id}>
                          {ticket.ticket_type_name} - {booking.event_currency} {ticket.ticket_type_price}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDownloadTicket(booking)}
                  disabled={downloadingTicket === booking.id}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {downloadingTicket === booking.id ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <Download className="h-5 w-5" />
                  )}
                  Download Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}