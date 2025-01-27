import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, AlertCircle } from 'lucide-react';
import { TicketType } from '../../types/event';
import { supabase } from '../../lib/supabase-client';
import TicketTypeCard from './TicketTypeCard';
import BookingSummary from './BookingSummary';
import TicketReviewModal from './TicketReviewModal';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface BookingFormProps {
  eventId: string;
  ticketTypes: TicketType[];
  currency: string;
}

export default function BookingForm({ eventId, ticketTypes = [], currency }: BookingFormProps) {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<{ [key: string]: number }>(
    ticketTypes.reduce((acc, ticket) => ({ ...acc, [ticket.id]: 0 }), {})
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = (ticketTypeId: string, quantity: number) => {
    const ticket = ticketTypes.find(t => t.id === ticketTypeId);
    if (!ticket) return;

    if (quantity > ticket.available) {
      toast.error('Not enough tickets available');
      return;
    }

    if (quantity > ticket.max_per_order) {
      toast.error(`Maximum ${ticket.max_per_order} tickets allowed per order`);
      return;
    }

    setSelectedTickets(prev => ({
      ...prev,
      [ticketTypeId]: quantity
    }));
    setError('');
  };

  const calculateTotals = () => {
    const subtotal = ticketTypes.reduce((total, ticket) => {
      return total + (ticket.price * (selectedTickets[ticket.id] || 0));
    }, 0);
    const processingFee = subtotal * 0.02; // 2% processing fee
    return {
      subtotal,
      processingFee,
      total: subtotal + processingFee
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate at least one ticket is selected
    const hasTickets = Object.values(selectedTickets).some(qty => qty > 0);
    if (!hasTickets) {
      toast.error('Please select at least one ticket');
      return;
    }
    
    setIsReviewModalOpen(true);
  };

  const proceedToCheckout = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user) {
        navigate('/login', { state: { from: window.location.pathname } });
        return;
      }

      // Format ticket quantities for the order
      const ticketQuantities = Object.entries(selectedTickets)
        .filter(([_, quantity]) => quantity > 0)
        .map(([ticketTypeId, quantity]) => ({
          ticket_type_id: ticketTypeId,
          quantity
        }));

      // Create pending order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: 'PENDING',
          payment_method: 'PENDING',
          ticket_quantities: ticketQuantities,
          total: calculateTotals().total
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Navigate to payment page with order details
      navigate('/checkout', {
        state: {
          order,
          tickets: selectedTickets,
          totals: calculateTotals()
        }
      });
    } catch (error: any) {
      console.error('Booking error:', error);
      setError(error.message || 'Failed to create booking');
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
      setIsReviewModalOpen(false);
    }
  };

  const availableTickets = ticketTypes.filter(ticket => 
    ticket.available > 0 && ticket.status !== 'SOLD_OUT'
  );

  if (availableTickets.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Tickets Available</h3>
        <p className="text-gray-600">
          Tickets are currently not available for this event.
          Check back later or contact the organizer for more information.
        </p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {ticketTypes.map((ticket) => (
            <TicketTypeCard
              key={ticket.id}
              ticket={ticket}
              quantity={selectedTickets[ticket.id] || 0}
              currency={currency}
              onQuantityChange={(quantity) => handleQuantityChange(ticket.id, quantity)}
            />
          ))}
        </div>

        {Object.values(selectedTickets).some(qty => qty > 0) && (
          <BookingSummary
            selectedTickets={selectedTickets}
            ticketTypes={ticketTypes}
            currency={currency}
          />
        )}

        <button
          type="submit"
          disabled={loading || !Object.values(selectedTickets).some(qty => qty > 0)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Ticket className="h-5 w-5" />
          Proceed to Payment
        </button>
      </form>

      <TicketReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onConfirm={proceedToCheckout}
        selectedTickets={selectedTickets}
        ticketTypes={ticketTypes}
        currency={currency}
      />
    </>
  );
}