import api from './api';

export interface Order {
  id: string;
  userId: string;
  eventId: string;
  total: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
  };
  event: {
    title: string;
  };
  tickets: Array<{
    id: string;
    ticketType: {
      name: string;
      price: number;
    };
  }>;
}

class OrderService {
  async getOrders(params: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const response = await api.get('/api/orders', { params });
    return response.data;
  }

  async getOrderById(id: string) {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  }

  async updateOrderStatus(id: string, status: string) {
    const response = await api.patch(`/api/orders/${id}/status`, { status });
    return response.data;
  }

  async refundOrder(id: string, reason: string) {
    const response = await api.post(`/api/orders/${id}/refund`, { reason });
    return response.data;
  }

  async exportOrders(params: {
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    const response = await api.get('/api/orders/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  }
}

export const orderService = new OrderService();