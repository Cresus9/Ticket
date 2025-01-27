import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { analyticsService, DashboardStats } from '../../services/analyticsService';
import RevenueChart from '../../components/admin/charts/RevenueChart';
import TicketSalesChart from '../../components/admin/charts/TicketSalesChart';
import UserGrowthChart from '../../components/admin/charts/UserGrowthChart';
import CategoryDistributionChart from '../../components/admin/charts/CategoryDistributionChart';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getDashboardStats();
      setStats(data);
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load analytics</p>
        <button 
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue, 'GHS'),
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Ticket Sales',
      value: stats.ticketsSold.toLocaleString(),
      change: '+23.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'blue'
    },
    {
      title: 'Active Users',
      value: stats.totalUsers.toLocaleString(),
      change: '+18.2%',
      trend: 'up',
      icon: Users,
      color: 'indigo'
    },
    {
      title: 'Total Events',
      value: stats.totalEvents.toString(),
      change: '+15.3%',
      trend: 'up',
      icon: Calendar,
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="flex gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
          </select>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.title} className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${metric.color}-100`}>
                <metric.icon className={`h-6 w-6 text-${metric.color}-600`} />
              </div>
              <div className={`text-sm font-medium ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change}
                {metric.trend === 'up' ? (
                  <ArrowUpRight className="inline h-4 w-4 ml-1" />
                ) : (
                  <ArrowDownRight className="inline h-4 w-4 ml-1" />
                )}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h2>
          <RevenueChart data={stats.userGrowth} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h2>
          <CategoryDistributionChart data={{
            labels: stats.salesByCategory.map(item => item.category),
            values: stats.salesByCategory.map(item => item.total)
          }} />
        </div>
      </div>

      {/* Top Events Table */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Events</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Event</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Tickets Sold</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Revenue</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Occupancy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.topEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{event.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{event.ticketsSold}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatCurrency(event.revenue, 'GHS')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full mr-2">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${event.occupancy}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{event.occupancy}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}