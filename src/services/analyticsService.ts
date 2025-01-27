import api from './api';

export interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalRevenue: number;
  ticketsSold: number;
  recentOrders: Array<{
    id: string;
    user: {
      name: string;
      email: string;
    };
    event: {
      title: string;
    };
    total: number;
    status: string;
  }>;
  userGrowth: Array<{
    date: string;
    value: number;
  }>;
  salesByCategory: Array<{
    category: string;
    total: number;
  }>;
  topEvents: Array<{
    id: string;
    title: string;
    ticketsSold: number;
    revenue: number;
    occupancy: number;
  }>;
}

class AnalyticsService {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/api/analytics/dashboard');
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Using mock analytics data in development');
        return {
          totalUsers: 1250,
          totalEvents: 45,
          totalRevenue: 125000,
          ticketsSold: 3500,
          recentOrders: [
            {
              id: '1',
              user: { name: 'John Doe', email: 'john@example.com' },
              event: { title: 'Afro Nation Ghana 2024' },
              total: 300,
              status: 'completed'
            }
          ],
          userGrowth: Array.from({ length: 12 }, (_, i) => ({
            date: new Date(2024, i, 1).toISOString(),
            value: Math.floor(Math.random() * 1000)
          })),
          salesByCategory: [
            { category: 'Music', total: 450 },
            { category: 'Sports', total: 320 },
            { category: 'Cultural', total: 280 },
            { category: 'Arts', total: 150 }
          ],
          topEvents: [
            {
              id: '1',
              title: 'Afro Nation Ghana 2024',
              ticketsSold: 1500,
              revenue: 45000,
              occupancy: 75
            }
          ]
        };
      }
      throw error;
    }
  }

  async getEventAnalytics(eventId: string) {
    try {
      const response = await api.get(`/api/analytics/events/${eventId}`);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Using mock event analytics in development');
        return {
          sales: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(2024, 0, i + 1).toISOString(),
            count: Math.floor(Math.random() * 100),
            revenue: Math.floor(Math.random() * 10000)
          })),
          tickets: {
            sold: 1500,
            available: 500,
            total: 2000
          }
        };
      }
      throw error;
    }
  }

  async getRevenueAnalytics(period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
    try {
      const response = await api.get('/api/analytics/revenue', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Using mock revenue analytics in development');
        const periods = period === 'daily' ? 30 : period === 'weekly' ? 12 : 12;
        return Array.from({ length: periods }, (_, i) => ({
          date: new Date(2024, 0, i + 1).toISOString(),
          revenue: Math.floor(Math.random() * 50000)
        }));
      }
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();