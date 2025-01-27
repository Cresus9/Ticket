import { supabase } from '../lib/supabase-client';

export interface Booking {
  id: string;
  eventName: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  ticketType: string;
  price: number;
  currency: string;
  ticketId: string;
  qrCode: string;
}

class BookingService {
  async validateTickets(eventId: string, tickets: { [key: string]: number }) {
    try {
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          ticket_types (*)
        `)
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;
      if (!event) throw new Error('Event not found');

      if (event.status !== 'PUBLISHED') {
        throw new Error('Event is not available for booking');
      }

      for (const [ticketTypeId, quantity] of Object.entries(tickets)) {
        const ticketType = event.ticket_types.find(t => t.id === ticketTypeId);
        
        if (!ticketType) {
          throw new Error(`Ticket type ${ticketTypeId} not found`);
        }

        if (ticketType.available < quantity) {
          throw new Error(`Not enough tickets available for ${ticketType.name}`);
        }

        if (quantity > ticketType.max_per_order) {
          throw new Error(`Maximum ${ticketType.max_per_order} tickets allowed per order for ${ticketType.name}`);
        }
      }

      return {
        available: true,
        event: {
          id: event.id,
          title: event.title,
          ticketTypes: event.ticket_types.map(type => ({
            id: type.id,
            name: type.name,
            available: type.available,
            maxPerOrder: type.max_per_order
          }))
        }
      };
    } catch (error) {
      console.error('Ticket validation error:', error);
      throw error;
    }
  }

  async getUserBookings(): Promise<Booking[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get all tickets for the user with related data
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          id,
          qr_code,
          order:orders!inner(
            id,
            status
          ),
          event:events!inner(
            title,
            date,
            time,
            location,
            currency
          ),
          ticket_type:ticket_types!inner(
            name,
            price
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (tickets || []).map(ticket => ({
        id: ticket.order.id,
        eventName: ticket.event.title,
        date: ticket.event.date,
        time: ticket.event.time,
        location: ticket.event.location,
        status: this.getBookingStatus(new Date(ticket.event.date), ticket.order.status),
        ticketType: ticket.ticket_type.name,
        price: ticket.ticket_type.price,
        currency: ticket.event.currency,
        ticketId: ticket.id,
        qrCode: ticket.qr_code
      }));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }

  private getBookingStatus(eventDate: Date, orderStatus: string): 'upcoming' | 'completed' | 'cancelled' {
    if (orderStatus === 'CANCELLED') {
      return 'cancelled';
    }
    
    const now = new Date();
    if (eventDate > now) {
      return 'upcoming';
    }
    return 'completed';
  }
}

export const bookingService = new BookingService();