import { supabase } from '../lib/supabase-client';
import { Event } from '../types/event';

class EventService {
  async getEvents(params: {
    status?: string;
    featured?: boolean;
  } = {}): Promise<Event[]> {
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          ticket_types (*)
        `);

      if (params.status) {
        query = query.eq('status', params.status);
      }

      if (params.featured !== undefined) {
        query = query.eq('featured', params.featured);
      }

      const { data, error } = await query.order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Event | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          ticket_types (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  }

  async createTicket(eventId: string, ticketTypeId: string, quantity: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Start transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        event_id: eventId,
        status: 'PENDING',
        payment_method: 'CARD'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create tickets
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          order_id: order.id,
          event_id: eventId,
          user_id: user.id,
          ticket_type_id: ticketTypeId,
          status: 'VALID',
          qr_code: `${order.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        })
        .select()
        .single();

      if (ticketError) {
        // Rollback order
        await supabase.from('orders').delete().eq('id', order.id);
        throw ticketError;
      }

      tickets.push(ticket);
    }

    return { order, tickets };
  }
}

export const eventService = new EventService();