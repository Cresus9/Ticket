import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, AlertCircle, Loader, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase-client';
import toast from 'react-hot-toast';

interface SupportTicket {
  id: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  created_at: string;
  user_name: string;
  user_email: string;
  user_id: string;
  category_name: string;
  message_count: number;
  latest_activity: string;
}

interface ChatSession {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  status: 'ACTIVE' | 'CLOSED';
  last_message?: string;
  last_message_at?: string;
}

interface Filters {
  status: string;
  priority: string;
  category: string;
  search: string;
}

export default function SupportManagement() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    priority: 'all',
    category: 'all',
    search: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchTickets();
    fetchChatSessions();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('support_categories')
        .select('name')
        .order('name');

      if (error) throw error;
      setCategories(data.map(c => c.name));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('support_ticket_details')
        .select('*')
        .order('latest_activity', { ascending: false });

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }
      if (filters.category !== 'all') {
        query = query.eq('category_name', filters.category);
      }
      if (filters.search) {
        query = query.or(
          `subject.ilike.%${filters.search}%,user_name.ilike.%${filters.search}%,user_email.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_chat_session_details')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setChatSessions(data || []);
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    }
  };

  const handleStatusChange = async (ticketId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', ticketId);

      if (error) throw error;
      toast.success('Ticket status updated successfully');
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('Failed to update ticket status');
    }
  };

  const startChat = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if chat session already exists
      const { data: existingSession } = await supabase
        .from('admin_chat_sessions')
        .select('id')
        .eq('admin_id', user.id)
        .eq('user_id', userId)
        .single();

      if (existingSession) {
        window.location.href = `/admin/support/chat/${existingSession.id}`;
        return;
      }

      // Create new chat session
      const { data: newSession, error } = await supabase
        .from('admin_chat_sessions')
        .insert({
          admin_id: user.id,
          user_id: userId,
          status: 'ACTIVE'
        })
        .select()
        .single();

      if (error) throw error;

      window.location.href = `/admin/support/chat/${newSession.id}`;
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat session');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'text-gray-600';
      case 'MEDIUM':
        return 'text-blue-600';
      case 'HIGH':
        return 'text-orange-600';
      case 'URGENT':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Support Management</h1>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>

        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Active Chat Sessions */}
      {chatSessions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Chat Sessions</h2>
          <div className="space-y-4">
            {chatSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{session.user_name}</div>
                  <div className="text-sm text-gray-500">{session.user_email}</div>
                  {session.last_message && (
                    <div className="text-sm text-gray-600 mt-1">
                      Last message: {session.last_message}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 text-sm rounded-full ${
                    session.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {session.status}
                  </span>
                  <a
                    href={`/admin/support/chat/${session.id}`}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Continue Chat
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tickets Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Ticket</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">User</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Priority</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Category</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Messages</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Last Activity</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{ticket.subject}</div>
                    <div className="text-sm text-gray-500">
                      Created: {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{ticket.user_name}</div>
                      <div className="text-gray-500">{ticket.user_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                      className={`px-3 py-1 rounded-lg ${getStatusColor(ticket.status)}`}
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {ticket.category_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {ticket.message_count}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(ticket.latest_activity).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startChat(ticket.user_id)}
                        className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100"
                        title="Start chat"
                      >
                        <MessageSquare className="h-5 w-5" />
                      </button>
                      <a
                        href={`/support/${ticket.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </a>
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