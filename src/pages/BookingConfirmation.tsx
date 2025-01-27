import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, Download, Share2, Copy, Mail, MessageSquare, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase-client';
import { useAuth } from '../context/AuthContext';
import FestivalTicket from '../components/tickets/FestivalTicket';
import toast from 'react-hot-toast';
import { generatePDF } from '../utils/ticketService';

interface Ticket {
  id: string;
  qr_code: string;
  ticket_type: {
    name: string;
    price: number;
  };
  event: {
    title: string;
    date: string;
    time: string;
    location: string;
    image_url: string;
  };
}

export default function BookingConfirmation() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchTickets();
    }
  }, [bookingId]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          qr_code,
          ticket_type:ticket_type_id (
            name,
            price
          ),
          event:event_id (
            title,
            date,
            time,
            location,
            image_url
          )
        `)
        .eq('order_id', bookingId);

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No tickets found for this booking');
      }

      setTickets(data);
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      toast.error(error.message || 'Failed to load tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTickets = async () => {
    if (!tickets.length) return;
    
    try {
      const ticketElements = document.querySelectorAll('[data-ticket]');
      const pdfs: Blob[] = [];

      for (const element of ticketElements) {
        if (element instanceof HTMLElement) {
          const pdf = await generatePDF(element);
          pdfs.push(pdf);
        }
      }

      if (pdfs.length === 1) {
        const url = URL.createObjectURL(pdfs[0]);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ticket-${bookingId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        toast.error('Multiple ticket download not yet supported');
      }

      toast.success('Tickets downloaded successfully');
    } catch (error) {
      console.error('Error downloading tickets:', error);
      toast.error('Failed to download tickets');
    }
  };

  const handleShare = async (method: 'whatsapp' | 'email' | 'copy') => {
    const shareText = `Check out my tickets for ${tickets[0]?.event.title}!`;
    const shareUrl = window.location.href;

    try {
      switch (method) {
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`);
          break;
        case 'email':
          window.location.href = `mailto:?subject=My Event Tickets&body=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
          break;
        case 'copy':
          await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
          toast.success('Link copied to clipboard');
          break;
      }
    } catch (error) {
      toast.error('Failed to share tickets');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!tickets.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No tickets found</h2>
        <p className="text-gray-600 mb-8">We couldn't find any tickets for this booking.</p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Browse Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Tickets are Ready!</h1>
        <p className="text-gray-600">
          Your tickets have been sent to your email at {user?.email}
        </p>
      </div>

      {/* Tickets */}
      <div className="space-y-8 mb-8">
        {tickets.map((ticket) => (
          <div key={ticket.id} data-ticket>
            <FestivalTicket
              ticketHolder={user?.name || ''}
              ticketType={ticket.ticket_type.name}
              ticketId={ticket.id}
              eventTitle={ticket.event.title}
              eventDate={ticket.event.date}
              eventTime={ticket.event.time}
              eventLocation={ticket.event.location}
              qrCode={ticket.qr_code}
              eventImage={ticket.event.image_url}
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          onClick={handleDownloadTickets}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Download className="h-5 w-5" />
          Download Tickets
        </button>
        
        <div className="flex-1 flex gap-4">
          <button
            onClick={() => handleShare('whatsapp')}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <MessageSquare className="h-5 w-5" />
            WhatsApp
          </button>
          <button
            onClick={() => handleShare('email')}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Mail className="h-5 w-5" />
            Email
          </button>
          <button
            onClick={() => handleShare('copy')}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Copy className="h-5 w-5" />
            Copy Link
          </button>
        </div>
      </div>

      {/* Important Information */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Information</h3>
        <ul className="space-y-2 text-gray-600">
          <li>• Please arrive at least 30 minutes before the event starts</li>
          <li>• Have your ticket QR code ready for scanning at the entrance</li>
          <li>• Follow the event's dress code and guidelines</li>
          <li>• For any queries, contact our support team</li>
        </ul>
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/dashboard"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          View all your bookings →
        </Link>
      </div>
    </div>
  );
}