import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  ShoppingCart,
  BarChart2,
  FileText,
  LogOut,
  Menu,
  X,
  Ticket,
  MessageSquare,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Events', path: '/admin/events', icon: Calendar },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
  { name: 'Content', path: '/admin/content', icon: FileText },
  { name: 'Support', path: '/admin/support', icon: MessageSquare },
  { name: 'Security', path: '/admin/security', icon: Shield }
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
            <Ticket className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">Admin Panel</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path || 
                             location.pathname.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-indigo-600">
                    {user?.email?.[0].toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Administrator
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-2 flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 z-50 p-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-white shadow-lg"
        >
          {sidebarOpen ? (
            <X className="h-6 w-6 text-gray-600" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}