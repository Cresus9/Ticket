import React, { useState, useEffect } from 'react';
import { Search, Calendar, Download, Eye, Ban, RefreshCcw, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase-client';
import { formatCurrency } from '../../utils/formatters';
import OrderDetailsModal from '../../components/admin/orders/OrderDetailsModal';
import DateRangePicker from '../../components/common/DateRangePicker';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  total: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  user_name: string;
  user_email: string;
  event_title: string;
  tickets: Array<{
    id: string;
    ticket_type: {
      name: string;
      price: number;
    };
  }>;
}

interface Filters {
  status: string;
  startDate: string;
  endDate: string;
  search: string;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('order_details')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      if (filters.search) {
        query = query.or(`user_name.ilike.%${filters.search}%,user_email.ilike.%${filters.search}%,event_title.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleRefund = async (orderId: string) => {
    const reason = prompt('Please enter the refund reason:');
    if (!reason) return;

    try {
      // First update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: 'CANCELLED',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Then create refund record
      const { error: refundError } = await supabase
        .from('refunds')
        .insert({
          order_id: orderId,
          reason,
          status: 'COMPLETED'
        });

      if (refundError) throw refundError;

      toast.success('Order refunded successfully');
      fetchOrders();
    } catch (error: any) {
      console.error('Error refunding order:', error);
      toast.error('Failed to refund order');
    }
  };

  const handleExport = async () => {
    try {
      const { data, error } = await supabase
        .from('order_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert to CSV
      const csvContent = [
        ['Order ID', 'Customer', 'Email', 'Event', 'Total', 'Status', 'Date'].join(','),
        ...data.map(order => [
          order.id,
          order.user_name,
          order.user_email,
          order.event_title,
          order.total,
          order.status,
          new Date(order.created_at).toLocaleDateString()
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `orders-${new Date().toISOString()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      console.error('Error exporting orders:', error);
      toast.error('Failed to export orders');
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
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Download className="h-5 w-5" />
          Export Orders
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
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
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <DateRangePicker
          startDate={filters.startDate}
          endDate={filters.endDate}
          onStartDateChange={(date) => setFilters({ ...filters, startDate: date })}
          onEndDateChange={(date) => setFilters({ ...filters, endDate: date })}
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Order ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Event</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">#{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.user_name}</div>
                      <div className="text-sm text-gray-500">{order.user_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{order.event_title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(order.total, 'XOF')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      {order.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleRefund(order.id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                          title="Refund Order"
                        >
                          <RefreshCcw className="h-5 w-5" />
                        </button>
                      )}
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                          title="Cancel Order"
                        >
                          <Ban className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          onRefund={handleRefund}
        />
      )}
    </div>
  );
}