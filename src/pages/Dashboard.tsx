import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Ticket, 
  Calendar,
  CreditCard,
  ChevronRight,
  Loader,
  TrendingUp,
  Clock,
  MapPin,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';
import type { DashboardStats } from '../services/userService';

export default function Dashboard() {
  const { profile } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await userService.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      fetchDashboardData();
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load dashboard</h2>
          <p className="text-gray-600 mb-4">We couldn't load your dashboard data</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-8 flex items-center justify-between">
          <div className="text-white">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {profile?.name || 'Guest'}! 👋
            </h1>
            <p className="text-indigo-100">
              Track your events, tickets, and bookings all in one place
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/events"
              className="px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2 font-medium"
            >
              Browse Events
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              to="/support"
              className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition-colors flex items-center gap-2 font-medium"
            >
              <MessageSquare className="h-5 w-5" />
              Get Support
            </Link>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Calendar className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming Events</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats.upcomingEvents}
                </p>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Ticket className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tickets</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats.totalTickets}
                </p>
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData.stats.totalSpent, 'XOF')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <Link 
              to="/profile/bookings"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All
            </Link>
          </div>
          
          {dashboardData.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentOrders.map((order) => (
                <div 
                  key={order.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="mb-4 md:mb-0">
                    <h3 className="font-medium text-gray-900">{order.eventName}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(order.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {order.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(order.total, order.currency)}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-600 mb-4">
                Start exploring events and make your first booking
              </p>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Browse Events
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}