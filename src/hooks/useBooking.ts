import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketType } from '../types/event';
import { bookingService } from '../services/bookingService';
import toast from 'react-hot-toast';

interface UseBookingReturn {
  selectedTickets: { [key: string]: number };
  loading: boolean;
  error: string | null;
  handleQuantityChange: (ticketId: string, quantity: number) => void;
  calculateTotals: () => {
    subtotal: number;
    processingFee: number;
    total: number;
  };
  proceedToCheckout: () => Promise<void>;
}

export function useBooking(
  eventId: string,
  ticketTypes: TicketType[],
  currency: string
): UseBookingReturn {
  const navigate = useNavigate();
  const [selectedTickets, setSelectedTickets] = useState<{ [key: string]: number }>(
    ticketTypes.reduce((acc, ticket) => ({ ...acc, [ticket.id]: 0 }), {})
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuantityChange = (ticketId: string, quantity: number) => {
    const ticket = ticketTypes.find(t => t.id === ticketId);
    if (!ticket) {
      toast.error('Invalid ticket type');
      return;
    }

    if (quantity > ticket.available) {
      toast.error('Not enough tickets available');
      return;
    }

    if (quantity > ticket.maxPerOrder) {
      toast.error(`Maximum ${ticket.maxPerOrder} tickets allowed per order`);
      return;
    }

    setSelectedTickets(prev => ({
      ...prev,
      [ticketId]: quantity
    }));
    setError(null);
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

  const proceedToCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate ticket availability
      const validation = await bookingService.validateTickets(eventId, selectedTickets);
      
      if (!validation.available) {
        throw new Error('Some tickets are no longer available');
      }

      const { subtotal, processingFee, total } = calculateTotals();

      navigate('/checkout', {
        state: {
          eventId,
          tickets: selectedTickets,
          subtotal,
          processingFee,
          total,
          currency
        }
      });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to proceed to checkout';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedTickets,
    loading,
    error,
    handleQuantityChange,
    calculateTotals,
    proceedToCheckout
  };
}