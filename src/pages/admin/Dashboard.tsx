import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Loader, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase-client';
import AdminMetricCard from '../../components/admin/AdminMetricCard';
import AdminChart from '../../components/admin/AdminChart';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AdminDashboard component mounted');
    checkAdminAccess();
    fetchStats();
  }, []);

  const checkAdminAccess = async () => {
    console.log('Checking admin access...');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'ADMIN') {
      console.log('User is not admin, redirecting to home');
      navigate('/');
      toast.error('Unauthorized access');
      return;
    }
    console.log('Admin access confirmed');
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch total events
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      // Fetch completed orders for revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total')
        .eq('status', 'COMPLETED');

      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

      // Fetch total tickets sold
      const { count: ticketsSold } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: usersCount || 0,
        totalEvents: eventsCount || 0,
        totalRevenue,
        ticketsSold: ticketsSold || 0,
        // Mock data for charts - replace with real data in production
        userGrowth: Array.from({ length: 12 }, (_, i) => ({
          date: new Date(2024, i, 1).toISOString(),
          value: Math.floor(Math.random() * 1000)
        })),
        salesByCategory: [
          { category: 'Music', total: 450 },
          { category: 'Sports', total: 320 },
          { category: 'Cultural', total: 280 },
          { category: 'Arts', total: 150 }
        ]
      });
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard statistics');
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const metrics = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
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
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <AdminMetricCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h2>
          <AdminChart type="revenue" data={stats.userGrowth} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h2>
          <AdminChart type="category" data={stats.salesByCategory} />
        </div>
      </div>
    </div>
  );
}