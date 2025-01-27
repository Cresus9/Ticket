import { supabase } from '../lib/supabase-client';

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category_id: string;
  created_at: string;
  last_reply_at: string | null;
  resolved_at: string | null;
}

export interface SupportMessage {
  id: string;
  message: string;
  is_staff_reply: boolean;
  created_at: string;
  user: {
    name: string;
  };
}

class SupportService {
  async getCategories() {
    const { data, error } = await supabase
      .from('support_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  }

  async createTicket(data: {
    subject: string;
    message: string;
    category_id: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  }) {
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        subject: data.subject,
        category_id: data.category_id,
        priority: data.priority
      })
      .select()
      .single();

    if (ticketError) throw ticketError;

    const { error: messageError } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticket.id,
        message: data.message
      });

    if (messageError) throw messageError;

    return ticket;
  }

  async getTickets() {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        category:support_categories(name),
        messages:support_messages(
          id,
          message,
          is_staff_reply,
          created_at,
          user:profiles(name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getTicketById(id: string) {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        category:support_categories(name),
        messages:support_messages(
          id,
          message,
          is_staff_reply,
          created_at,
          user:profiles(name)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async addMessage(ticketId: string, message: string) {
    const { error } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticketId,
        message
      });

    if (error) throw error;
  }

  async updateTicketStatus(id: string, status: SupportTicket['status']) {
    const { error } = await supabase
      .from('support_tickets')
      .update({ 
        status,
        resolved_at: status === 'RESOLVED' ? new Date().toISOString() : null
      })
      .eq('id', id);

    if (error) throw error;
  }
}

export const supportService = new SupportService();